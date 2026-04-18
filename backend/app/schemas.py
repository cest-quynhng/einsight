from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ReviewIn(BaseModel):
    id: Optional[str] = None
    content: str
    rating: Optional[float] = None
    title: Optional[str] = ""
    author: Optional[str] = ""
    version: Optional[str] = ""
    date: Optional[str] = ""


class TaggedReview(BaseModel):
    id: str
    content: str
    rating: float = 0
    title: str = ""
    author: str = ""
    version: str = ""
    date: str = ""
    tag1: Optional[str] = None
    tag2: Optional[str] = None
    tag3: Optional[str] = None
    tag4: Optional[str] = None
    need_type: Optional[str] = None
    sentiment: Optional[str] = None
    confidence: Optional[int] = 0


class AnalyzeResponse(BaseModel):
    app_name: str = "Unknown"
    platform: str = "unknown"
    total: int
    positive_count: int
    negative_count: int
    mixed_count: int
    avg_rating: float
    positive_by_category: Dict[str, int] = Field(default_factory=dict)
    negative_by_category: Dict[str, int] = Field(default_factory=dict)
    need_type_breakdown: Dict[str, int] = Field(default_factory=dict)
    reviews: List[TaggedReview] = Field(default_factory=list)
    ai_insight: Optional[str] = None


class UrlAnalyzeRequest(BaseModel):
    url: str
    max_reviews: int = 500
