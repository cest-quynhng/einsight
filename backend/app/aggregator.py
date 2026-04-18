from typing import List, Dict, Any
from .config import ALLOWED_TAGS, NEED_TYPES


def aggregate(reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
    total = len(reviews)
    positive = sum(1 for r in reviews if r.get("sentiment") == "Happy")
    negative = sum(1 for r in reviews if r.get("sentiment") == "Unhappy")
    mixed = sum(1 for r in reviews if r.get("sentiment") == "Mixed")

    ratings = [float(r.get("rating") or 0) for r in reviews if r.get("rating")]
    avg_rating = round(sum(ratings) / len(ratings), 2) if ratings else 0.0

    pos_by_cat: Dict[str, int] = {t: 0 for t in ALLOWED_TAGS}
    neg_by_cat: Dict[str, int] = {t: 0 for t in ALLOWED_TAGS}
    need_breakdown = {"core": 0, "differential": 0, "addon": 0}

    for r in reviews:
        sent = r.get("sentiment")
        tags = [r.get("tag1"), r.get("tag2"), r.get("tag3"), r.get("tag4")]
        tags = [t for t in tags if t]
        for t in tags:
            if t in pos_by_cat and sent == "Happy":
                pos_by_cat[t] += 1
            if t in neg_by_cat and sent == "Unhappy":
                neg_by_cat[t] += 1
        need = r.get("need_type")
        if need == "Core Needs":
            need_breakdown["core"] += 1
        elif need == "Differential Needs":
            need_breakdown["differential"] += 1
        elif need == "Add-on Needs":
            need_breakdown["addon"] += 1

    pos_by_cat = {k: v for k, v in pos_by_cat.items() if v > 0}
    neg_by_cat = {k: v for k, v in neg_by_cat.items() if v > 0}

    return {
        "total": total,
        "positive_count": positive,
        "negative_count": negative,
        "mixed_count": mixed,
        "avg_rating": avg_rating,
        "positive_by_category": pos_by_cat,
        "negative_by_category": neg_by_cat,
        "need_type_breakdown": need_breakdown,
    }
