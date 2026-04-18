import httpx
from .config import SCRAPER_URL


async def scrape_reviews(url: str, max_reviews: int = 500) -> dict:
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(
            f"{SCRAPER_URL}/scrape",
            json={"url": url, "maxReviews": max_reviews},
        )
        resp.raise_for_status()
        return resp.json()
