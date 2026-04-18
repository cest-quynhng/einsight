import json
import re
import asyncio
from typing import List, Dict, Any

from anthropic import Anthropic

from .config import ANTHROPIC_API_KEY, CLAUDE_MODEL, ALLOWED_TAGS, NEED_TYPES, SENTIMENTS

_client: Anthropic | None = None


def get_client() -> Anthropic:
    global _client
    if _client is None:
        if not ANTHROPIC_API_KEY:
            raise RuntimeError("ANTHROPIC_API_KEY is not set. Add it to .env")
        _client = Anthropic(api_key=ANTHROPIC_API_KEY)
    return _client


TAGGING_SYSTEM_PROMPT = f"""You are an expert mobile app review analyst for eUp Group.
For every review you receive, return STRICT JSON with the following shape:

{{
  "reviews": [
    {{
      "id": "<same id as input>",
      "tag1": "<one of the allowed tags or null>",
      "tag2": "<one of the allowed tags or null>",
      "tag3": "<one of the allowed tags or null>",
      "tag4": "<one of the allowed tags or null>",
      "need_type": "<Core Needs | Differential Needs | Add-on Needs>",
      "sentiment": "<Happy | Mixed | Unhappy>",
      "confidence": <integer 0-100>
    }}
  ]
}}

Allowed tags (pick up to 4 most relevant; use null for unused slots, no duplicates):
{", ".join(ALLOWED_TAGS)}

Need type definitions:
- Core Needs: fundamental expectations a user has for this type of app (must-haves)
- Differential Needs: features/qualities that differentiate this app vs competitors
- Add-on Needs: nice-to-have extras or peripheral requests

Sentiment rules:
- Happy: clearly positive review
- Unhappy: clearly negative review
- Mixed: both positive and negative points, or neutral/ambivalent

Output ONLY valid JSON. Do not wrap in markdown fences. Do not add commentary.
"""


def _extract_json(text: str) -> Dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        raise


def _sanitize_tag(tag):
    if not tag:
        return None
    tag = str(tag).strip()
    for allowed in ALLOWED_TAGS:
        if tag.lower() == allowed.lower():
            return allowed
    return None


def _sanitize_tagged(item: Dict[str, Any]) -> Dict[str, Any]:
    tags = []
    for key in ("tag1", "tag2", "tag3", "tag4"):
        t = _sanitize_tag(item.get(key))
        if t and t not in tags:
            tags.append(t)
    while len(tags) < 4:
        tags.append(None)
    need = item.get("need_type")
    if need not in NEED_TYPES:
        need = "Core Needs"
    sentiment = item.get("sentiment")
    if sentiment not in SENTIMENTS:
        sentiment = "Mixed"
    try:
        conf = int(item.get("confidence") or 0)
    except (TypeError, ValueError):
        conf = 0
    conf = max(0, min(100, conf))
    return {
        "id": str(item.get("id", "")),
        "tag1": tags[0],
        "tag2": tags[1],
        "tag3": tags[2],
        "tag4": tags[3],
        "need_type": need,
        "sentiment": sentiment,
        "confidence": conf,
    }


def tag_batch_sync(batch: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    client = get_client()
    payload = [
        {
            "id": r.get("id") or str(i),
            "content": (r.get("content") or "")[:1500],
            "rating": r.get("rating"),
        }
        for i, r in enumerate(batch)
    ]
    user_msg = (
        "Tag the following reviews. Return JSON only with a 'reviews' array "
        "in the same order/ids.\n\n"
        f"{json.dumps(payload, ensure_ascii=False)}"
    )
    resp = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=4000,
        system=TAGGING_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_msg}],
    )
    text = "".join(
        block.text for block in resp.content if getattr(block, "type", "") == "text"
    )
    try:
        data = _extract_json(text)
        items = data.get("reviews", [])
    except Exception:
        items = []

    by_id = {str(it.get("id")): _sanitize_tagged(it) for it in items if it}
    out = []
    for r in payload:
        got = by_id.get(str(r["id"]))
        if not got:
            got = _sanitize_tagged({"id": r["id"]})
        out.append(got)
    return out


async def tag_batch(batch: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return await asyncio.to_thread(tag_batch_sync, batch)


INSIGHT_SYSTEM = """You are a product analyst summarizing app review analytics for a Vietnamese
product team. Write a concise insight (2-4 sentences, mix of Vietnamese + English
where natural) highlighting:
1) Top strength (largest positive category)
2) Biggest pain point (largest negative category)
3) A competitive opportunity if competitor data is provided.
Keep it punchy and actionable. No bullet lists, no markdown."""


def insight_sync(summary: Dict[str, Any]) -> str:
    try:
        client = get_client()
    except RuntimeError:
        return ""
    try:
        resp = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=400,
            system=INSIGHT_SYSTEM,
            messages=[
                {
                    "role": "user",
                    "content": "Analytics summary:\n" + json.dumps(summary, ensure_ascii=False),
                }
            ],
        )
        return "".join(
            block.text for block in resp.content if getattr(block, "type", "") == "text"
        ).strip()
    except Exception as e:
        return f"(Không tạo được insight: {e})"


async def generate_insight(summary: Dict[str, Any]) -> str:
    return await asyncio.to_thread(insight_sync, summary)
