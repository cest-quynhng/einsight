import express from "express";
import cors from "cors";
import gplay from "google-play-scraper";
import appstore from "app-store-scraper";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.SCRAPER_PORT || 4000;

function parseAppStoreUrl(url) {
  // https://apps.apple.com/{country}/app/{slug}/id{appId}
  const m = url.match(/apps\.apple\.com\/([a-z]{2})\/app\/[^/]+\/id(\d+)/i);
  if (!m) return null;
  return { country: m[1], appId: m[2] };
}

function parseGooglePlayUrl(url) {
  // https://play.google.com/store/apps/details?id={pkg}&hl=...&gl=...
  const u = new URL(url);
  const id = u.searchParams.get("id");
  if (!id) return null;
  const country = (u.searchParams.get("gl") || "us").toLowerCase();
  const lang = (u.searchParams.get("hl") || "en").toLowerCase();
  return { appId: id, country, lang };
}

async function scrapeAppStore({ appId, country }, maxReviews = 500) {
  const all = [];
  const perPage = 50;
  const maxPages = Math.min(10, Math.ceil(maxReviews / perPage));
  for (let page = 1; page <= maxPages; page++) {
    try {
      const batch = await appstore.reviews({
        id: appId,
        country,
        sort: appstore.sort.RECENT,
        page,
      });
      if (!batch || batch.length === 0) break;
      all.push(...batch);
      if (all.length >= maxReviews) break;
    } catch (err) {
      console.error(`App Store page ${page} error:`, err.message);
      break;
    }
  }
  return all.slice(0, maxReviews).map((r) => ({
    id: String(r.id),
    title: r.title || "",
    content: r.text || "",
    rating: Number(r.score) || 0,
    author: r.userName || "",
    version: r.version || "",
    date: r.updated || r.date || "",
  }));
}

async function scrapeGooglePlay({ appId, country, lang }, maxReviews = 500) {
  try {
    const result = await gplay.reviews({
      appId,
      country,
      lang,
      sort: gplay.sort.NEWEST,
      num: maxReviews,
    });
    const data = Array.isArray(result) ? result : result.data || [];
    return data.slice(0, maxReviews).map((r) => ({
      id: String(r.id || r.reviewId || ""),
      title: "",
      content: r.text || "",
      rating: Number(r.score) || 0,
      author: r.userName || "",
      version: r.version || "",
      date: r.date || "",
    }));
  } catch (err) {
    console.error("Google Play scrape error:", err.message);
    return [];
  }
}

async function fetchAppMeta(platform, parsed) {
  try {
    if (platform === "appstore") {
      const meta = await appstore.app({ id: parsed.appId, country: parsed.country });
      return { name: meta.title, icon: meta.icon, platform };
    }
    const meta = await gplay.app({ appId: parsed.appId, country: parsed.country, lang: parsed.lang });
    return { name: meta.title, icon: meta.icon, platform };
  } catch {
    return { name: "Unknown App", icon: null, platform };
  }
}

app.post("/scrape", async (req, res) => {
  const { url, maxReviews = 500 } = req.body || {};
  if (!url) return res.status(400).json({ error: "Missing url" });

  try {
    let platform = null;
    let parsed = null;
    if (/apps\.apple\.com/i.test(url)) {
      platform = "appstore";
      parsed = parseAppStoreUrl(url);
    } else if (/play\.google\.com/i.test(url)) {
      platform = "googleplay";
      parsed = parseGooglePlayUrl(url);
    }
    if (!platform || !parsed) {
      return res.status(400).json({ error: "Unrecognized URL. Provide an App Store or Google Play URL." });
    }

    const [meta, reviews] = await Promise.all([
      fetchAppMeta(platform, parsed),
      platform === "appstore"
        ? scrapeAppStore(parsed, maxReviews)
        : scrapeGooglePlay(parsed, maxReviews),
    ]);

    res.json({
      platform,
      app: meta,
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Scrape failed" });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[scraper] listening on http://localhost:${PORT}`);
});
