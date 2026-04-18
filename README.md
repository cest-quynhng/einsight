# eInsight — App Review Intelligence Tool

Full-stack web app built for **eUp Group** that analyzes mobile app reviews, tags them with Claude (eUp taxonomy), and surfaces competitive insight across apps.

```
einsight/
├── backend/    FastAPI + Anthropic Claude (Python)
├── frontend/   React + Vite + Tailwind
├── scraper/    Node.js microservice (app-store-scraper, google-play-scraper)
├── package.json  root runner (concurrently)
└── Makefile
```

---

## 1. Prerequisites

- Node.js ≥ 18 (LTS recommended)
- Python ≥ 3.10
- An Anthropic API key

---

## 2. Setup

```bash
cd einsight
cp .env.example .env     # then edit .env and set ANTHROPIC_API_KEY=sk-ant-...
make install             # installs root deps, scraper deps, frontend deps, backend venv
```

`make install` is equivalent to `npm run install:all`.

---

## 3. Run everything with one command

```bash
make dev       # or: npm run dev
```

This starts:
- Scraper   → http://localhost:4000
- Backend   → http://localhost:8000  (docs: /docs)
- Frontend  → http://localhost:5173

You can also run individual services:

```bash
make scraper
make backend
make frontend
```

---

## 4. How to get a Sensor Tower CSV

1. Log in to https://sensortower.com
2. Choose the app → **Reviews** tab
3. Apply filters (date range, app version, country) — Sensor Tower supports **full review history**
4. Click **Export → CSV**
5. Upload the file via the **Upload CSV** panel in eInsight

Expected columns (Sensor Tower export):
`Unified Name, Content, Tags, Tag 1, Tag 2, Tag 3, Tag 4, Rating, Sentiment`

Any extra columns are ignored; `Content` and `Rating` are the minimum required.

---

## 5. Analyze a competitor by URL

Paste either:
- App Store: `https://apps.apple.com/{cc}/app/{slug}/id{appId}`
- Google Play: `https://play.google.com/store/apps/details?id={pkg}`

The Node scraper fetches ~200–500 recent reviews (no date / version filter — use Sensor Tower CSV for full history).

---

## 6. Tagging taxonomy

Claude (`claude-sonnet-4-20250514`) tags each review in batches of 20 and returns:

- **tag1…tag4** (from): `Content, Perceived Benefit, Features, UI/UX, Usability, User's feeling, Performance, Price, CS, Account, Subscription`
- **need_type**: `Core Needs | Differential Needs | Add-on Needs`
- **sentiment**: `Happy | Mixed | Unhappy`
- **confidence**: 0–100

---

## 7. API reference

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/analyze/csv` | Synchronous: upload CSV, returns full tagged analysis |
| POST | `/api/analyze/url` | Synchronous: scrape + tag a store URL |
| POST | `/api/analyze/csv/start` | Kick off CSV job, returns `job_id` |
| POST | `/api/analyze/url/start` | Kick off URL job, returns `job_id` |
| GET  | `/api/analyze/progress/{job_id}` | Server-sent events progress stream |
| GET  | `/api/analyze/result/{job_id}` | Final analysis JSON |
| POST | `/api/export/csv` | Download tagged CSV (Sensor Tower format + tag columns) |

The frontend uses the `/start` + SSE progress pair so you see “Đang phân tích 87/135 reviews…”.

---

## 8. Env vars

`.env` at repo root:

```
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-20250514   # optional override
SCRAPER_URL=http://localhost:4000       # backend → scraper
BATCH_SIZE=20                           # reviews per Claude call
```

---

## 9. Troubleshooting

- **`ANTHROPIC_API_KEY is not set`** — edit `.env` and restart `make dev`.
- **Scraper returns 0 reviews** — the App Store country code in the URL may be wrong (e.g. `/vn/app/...` instead of `/us/app/...`). Google Play often needs `&hl=en&gl=us`.
- **CSV parse error** — ensure the file is a real CSV (not XLSX). Save as *CSV UTF-8* from Sheets/Excel.
- **CORS / proxy** — Vite dev server proxies `/api` to `http://localhost:8000`; no config needed in dev.

---

## 10. Exports

- **CSV (tagged)** — downloads from `/api/export/csv` in Sensor Tower column order with added `Tag 1..4, Sentiment, Need Type, Confidence`
- **Google Sheets** — placeholder button; for now import the CSV directly into Sheets
- **PDF** — triggers browser print to PDF for the current dashboard view

---

## 11. Deploy

Three pieces deploy independently. Push this repo to GitHub first, then:

### Frontend → Vercel

1. `cd frontend && npx vercel --prod`
2. On Vercel dashboard, set:
   - `VITE_API_URL = https://einsight-api.onrender.com` (or whatever your Render backend URL is)
3. [frontend/vercel.json](frontend/vercel.json) already rewrites all paths to `/index.html` for the SPA.
4. `.env.production` in the repo is a fallback if you don't set the dashboard var.

### Backend → Render

1. Connect your GitHub repo on Render → **New Blueprint** and point it at [backend/render.yaml](backend/render.yaml) (or create manually with **Root Directory: `backend`**).
2. Set the `ANTHROPIC_API_KEY` env var on Render (marked `sync: false` so you must provide it).
3. Start command is `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (code lives in the `app/` submodule).
4. CORS is already wired for any `*.vercel.app` subdomain + `localhost:5173`. Add more via `CORS_EXTRA_ORIGINS` (comma-separated).

### Scraper → Render (second service)

1. Connect the same repo, **Root Directory: `scraper`**, using [scraper/render.yaml](scraper/render.yaml).
2. Default entry is `node index.js` and it listens on `$PORT`.
3. After deploy, copy the public scraper URL and set it as `SCRAPER_URL` on the backend service (already defaults to `https://einsight-scraper.onrender.com` in `backend/render.yaml` — adjust to match your actual URL).

### Env var summary

| Service | Var | Value |
|---|---|---|
| Frontend (Vercel) | `VITE_API_URL` | Render backend URL |
| Backend (Render) | `ANTHROPIC_API_KEY` | your Anthropic key |
| Backend (Render) | `SCRAPER_URL` | Render scraper URL |
| Backend (Render) | `CORS_EXTRA_ORIGINS` | extra comma-separated origins (optional) |
| Scraper (Render) | `PORT` | auto-provided by Render |

