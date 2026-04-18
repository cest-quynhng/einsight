import io
from typing import List, Dict, Any
import pandas as pd


CONTENT_KEYS = ["Content", "Review", "Review Text", "Body", "Text"]
NAME_KEYS = ["Unified Name", "App", "App Name", "Name"]
RATING_KEYS = ["Rating", "Stars", "Score"]
SENTIMENT_KEYS = ["Sentiment"]
DATE_KEYS = ["Date", "Review Date", "Submitted"]
AUTHOR_KEYS = ["Author", "Reviewer", "User"]
VERSION_KEYS = ["Version", "App Version"]


def _first(row: Dict[str, Any], keys: List[str], default=""):
    for k in keys:
        if k in row and pd.notna(row[k]):
            return row[k]
        for actual in row.keys():
            if actual.strip().lower() == k.lower() and pd.notna(row[actual]):
                return row[actual]
    return default


def parse_csv(content: bytes) -> Dict[str, Any]:
    for enc in ("utf-8", "utf-8-sig", "latin-1"):
        try:
            df = pd.read_csv(io.BytesIO(content), encoding=enc)
            break
        except UnicodeDecodeError:
            continue
    else:
        raise ValueError("Could not decode CSV file")

    df = df.fillna("")
    reviews: List[Dict[str, Any]] = []
    app_name = ""
    for i, row in df.iterrows():
        row_d = row.to_dict()
        content_text = str(_first(row_d, CONTENT_KEYS, "")).strip()
        if not content_text:
            continue
        if not app_name:
            app_name = str(_first(row_d, NAME_KEYS, "")).strip()
        try:
            rating = float(_first(row_d, RATING_KEYS, 0) or 0)
        except (TypeError, ValueError):
            rating = 0
        reviews.append(
            {
                "id": str(i),
                "content": content_text,
                "rating": rating,
                "title": "",
                "author": str(_first(row_d, AUTHOR_KEYS, "")),
                "version": str(_first(row_d, VERSION_KEYS, "")),
                "date": str(_first(row_d, DATE_KEYS, "")),
                "_raw_sentiment": str(_first(row_d, SENTIMENT_KEYS, "")),
            }
        )

    return {
        "app_name": app_name or "Uploaded App",
        "platform": "csv",
        "reviews": reviews,
    }
