import os
from dotenv import load_dotenv

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
load_dotenv(os.path.join(ROOT, ".env"))

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")
SCRAPER_URL = os.getenv("SCRAPER_URL", "http://localhost:4000")
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "20"))

ALLOWED_TAGS = [
    "Content",
    "Perceived Benefit",
    "Features",
    "UI/UX",
    "Usability",
    "User's feeling",
    "Performance",
    "Price",
    "CS",
    "Account",
    "Subscription",
]

NEED_TYPES = ["Core Needs", "Differential Needs", "Add-on Needs"]
SENTIMENTS = ["Happy", "Mixed", "Unhappy"]
