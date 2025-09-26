"""Pydantic schemas for FastAPI responses."""

from __future__ import annotations

from datetime import datetime
from typing import List

from pydantic import BaseModel, Field


class ValuationDriver(BaseModel):
    attention_score: float = Field(..., description="Model attention score")
    performance_index: float = Field(..., description="Model performance index")


class AthleteValuationResponse(BaseModel):
    athlete_id: str
    name: str
    sport: str
    school: str
    as_of: datetime
    nil_value: float
    confidence_lower: float
    confidence_upper: float
    drivers: ValuationDriver
    disclaimer: str


class LeaderboardEntry(BaseModel):
    rank: int
    athlete_id: str
    name: str
    sport: str
    school: str
    nil_value: float
    trend: float


class LeaderboardResponse(BaseModel):
    generated_at: datetime
    results: List[LeaderboardEntry]
    disclaimer: str
