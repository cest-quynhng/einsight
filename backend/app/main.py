import asyncio
import json
import uuid
import io
import csv as csvlib
from typing import Dict, Any, List

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

from .config import BATCH_SIZE
from .schemas import UrlAnalyzeRequest, AnalyzeResponse, TaggedReview
from .csv_parser import parse_csv
from .scraper_client import scrape_reviews
from .claude_client import tag_batch, generate_insight
from .aggregator import aggregate

app = FastAPI(title="eInsight API", version="0.1.0")

import os

_EXTRA_ORIGINS = [o.strip() for o in os.getenv("CORS_EXTRA_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", *_EXTRA_ORIGINS],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job store for progress streaming + result retrieval
JOBS: Dict[str, Dict[str, Any]] = {}


def _merge(base: List[Dict[str, Any]], tagged: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    tag_by_id = {str(t.get("id")): t for t in tagged}
    out = []
    for r in base:
        t = tag_by_id.get(str(r["id"]), {})
        merged = {**r, **{k: t.get(k) for k in ("tag1", "tag2", "tag3", "tag4", "need_type", "sentiment", "confidence")}}
        merged.pop("_raw_sentiment", None)
        out.append(merged)
    return out


async def _analyze_reviews(raw_reviews: List[Dict[str, Any]], job_id: str | None = None) -> List[Dict[str, Any]]:
    tagged_all: List[Dict[str, Any]] = []
    total = len(raw_reviews)
    if job_id:
        JOBS[job_id]["total"] = total
        JOBS[job_id]["done"] = 0

    for i in range(0, total, BATCH_SIZE):
        batch = raw_reviews[i : i + BATCH_SIZE]
        try:
            tagged = await tag_batch(batch)
        except Exception as e:
            tagged = [
                {
                    "id": r["id"],
                    "tag1": None, "tag2": None, "tag3": None, "tag4": None,
                    "need_type": "Core Needs",
                    "sentiment": "Mixed",
                    "confidence": 0,
                }
                for r in batch
            ]
            if job_id:
                JOBS[job_id].setdefault("errors", []).append(str(e))
        tagged_all.extend(tagged)
        if job_id:
            JOBS[job_id]["done"] = min(total, i + len(batch))
    return _merge(raw_reviews, tagged_all)


async def _build_response(app_name: str, platform: str, reviews: List[Dict[str, Any]]) -> AnalyzeResponse:
    stats = aggregate(reviews)
    insight_summary = {
        "app_name": app_name,
        "total": stats["total"],
        "positive_by_category": stats["positive_by_category"],
        "negative_by_category": stats["negative_by_category"],
        "need_type_breakdown": stats["need_type_breakdown"],
        "avg_rating": stats["avg_rating"],
    }
    insight = await generate_insight(insight_summary)
    return AnalyzeResponse(
        app_name=app_name,
        platform=platform,
        **stats,
        reviews=[TaggedReview(**r) for r in reviews],
        ai_insight=insight,
    )


@app.get("/api/health")
async def health():
    return {"ok": True}


@app.post("/api/analyze/csv", response_model=AnalyzeResponse)
async def analyze_csv(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(400, "Please upload a .csv file")
    content = await file.read()
    try:
        parsed = parse_csv(content)
    except Exception as e:
        raise HTTPException(400, f"Could not parse CSV: {e}")
    if not parsed["reviews"]:
        raise HTTPException(400, "CSV contained no review text")

    reviews = await _analyze_reviews(parsed["reviews"])
    return await _build_response(parsed["app_name"], "csv", reviews)


@app.post("/api/analyze/url", response_model=AnalyzeResponse)
async def analyze_url(req: UrlAnalyzeRequest):
    try:
        scraped = await scrape_reviews(req.url, req.max_reviews)
    except Exception as e:
        raise HTTPException(502, f"Scraper error: {e}")
    base_reviews = scraped.get("reviews") or []
    if not base_reviews:
        raise HTTPException(404, "No reviews found for this URL")
    app_meta = scraped.get("app") or {}
    app_name = app_meta.get("name") or "App"
    platform = scraped.get("platform") or "unknown"

    reviews = await _analyze_reviews(base_reviews)
    return await _build_response(app_name, platform, reviews)


# ----- Progress-streaming variants (optional use from frontend) -----

@app.post("/api/analyze/csv/start")
async def analyze_csv_start(file: UploadFile = File(...)):
    content = await file.read()
    try:
        parsed = parse_csv(content)
    except Exception as e:
        raise HTTPException(400, f"Could not parse CSV: {e}")
    if not parsed["reviews"]:
        raise HTTPException(400, "CSV contained no review text")
    job_id = uuid.uuid4().hex
    JOBS[job_id] = {"status": "running", "total": len(parsed["reviews"]), "done": 0}

    async def run():
        try:
            reviews = await _analyze_reviews(parsed["reviews"], job_id)
            resp = await _build_response(parsed["app_name"], "csv", reviews)
            JOBS[job_id]["result"] = json.loads(resp.model_dump_json())
            JOBS[job_id]["status"] = "done"
        except Exception as e:
            JOBS[job_id]["status"] = "error"
            JOBS[job_id]["error"] = str(e)

    asyncio.create_task(run())
    return {"job_id": job_id}


@app.post("/api/analyze/url/start")
async def analyze_url_start(req: UrlAnalyzeRequest):
    try:
        scraped = await scrape_reviews(req.url, req.max_reviews)
    except Exception as e:
        raise HTTPException(502, f"Scraper error: {e}")
    base_reviews = scraped.get("reviews") or []
    if not base_reviews:
        raise HTTPException(404, "No reviews found for this URL")
    app_meta = scraped.get("app") or {}
    app_name = app_meta.get("name") or "App"
    platform = scraped.get("platform") or "unknown"

    job_id = uuid.uuid4().hex
    JOBS[job_id] = {"status": "running", "total": len(base_reviews), "done": 0}

    async def run():
        try:
            reviews = await _analyze_reviews(base_reviews, job_id)
            resp = await _build_response(app_name, platform, reviews)
            JOBS[job_id]["result"] = json.loads(resp.model_dump_json())
            JOBS[job_id]["status"] = "done"
        except Exception as e:
            JOBS[job_id]["status"] = "error"
            JOBS[job_id]["error"] = str(e)

    asyncio.create_task(run())
    return {"job_id": job_id}


@app.get("/api/analyze/progress/{job_id}")
async def analyze_progress(job_id: str):
    if job_id not in JOBS:
        raise HTTPException(404, "Unknown job")

    async def event_stream():
        while True:
            job = JOBS.get(job_id)
            if not job:
                break
            payload = {
                "status": job.get("status"),
                "done": job.get("done", 0),
                "total": job.get("total", 0),
            }
            yield f"data: {json.dumps(payload)}\n\n"
            if job.get("status") in ("done", "error"):
                break
            await asyncio.sleep(0.6)

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/api/analyze/result/{job_id}")
async def analyze_result(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(404, "Unknown job")
    if job["status"] == "error":
        raise HTTPException(500, job.get("error", "Unknown error"))
    if job["status"] != "done":
        raise HTTPException(409, "Job not finished")
    return JSONResponse(job["result"])


# ----- CSV export (Sensor Tower-like format + added tag columns) -----

@app.post("/api/export/csv")
async def export_csv(data: AnalyzeResponse):
    buf = io.StringIO()
    writer = csvlib.writer(buf)
    writer.writerow([
        "Unified Name", "Content", "Tags", "Tag 1", "Tag 2", "Tag 3", "Tag 4",
        "Rating", "Sentiment", "Need Type", "Confidence", "Date", "Version",
    ])
    for r in data.reviews:
        tags = [t for t in [r.tag1, r.tag2, r.tag3, r.tag4] if t]
        writer.writerow([
            data.app_name, r.content, ", ".join(tags),
            r.tag1 or "", r.tag2 or "", r.tag3 or "", r.tag4 or "",
            r.rating, r.sentiment or "", r.need_type or "", r.confidence or 0,
            r.date or "", r.version or "",
        ])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="einsight_{data.app_name}.csv"'},
    )
