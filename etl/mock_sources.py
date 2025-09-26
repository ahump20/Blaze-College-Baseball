"""Mock data generators for the Blaze Sports Intel NIL pipeline."""

from __future__ import annotations

from datetime import date, timedelta
from typing import Dict, Iterable, List

import numpy as np
import pandas as pd

ATHLETES = [
    {
        "athlete_id": "athlete_baseball_001",
        "name": "Jordan Hale",
        "sport": "Baseball",
        "school": "BSI University",
    },
    {
        "athlete_id": "athlete_baseball_002",
        "name": "Samantha Ortiz",
        "sport": "Baseball",
        "school": "Summit College",
    },
    {
        "athlete_id": "athlete_football_001",
        "name": "Marcus Lee",
        "sport": "Football",
        "school": "Redwood State",
    },
    {
        "athlete_id": "athlete_basketball_001",
        "name": "Riley Chen",
        "sport": "Basketball",
        "school": "BSI University",
    },
    {
        "athlete_id": "athlete_track_001",
        "name": "Avery Patel",
        "sport": "Track & Field",
        "school": "Summit College",
    },
]


SOCIAL_CHANNELS = ["instagram", "tiktok", "twitter"]


def generate_box_scores(num_games: int = 5) -> pd.DataFrame:
    """Create mock performance metrics for each athlete."""

    rows: List[Dict[str, object]] = []
    today = date.today()
    for athlete in ATHLETES:
        for game_index in range(num_games):
            game_date = today - timedelta(days=game_index * 3)
            rng = np.random.default_rng(hash((athlete["athlete_id"], game_index)) % (2**32))
            points = rng.normal(15, 5)
            assists = rng.normal(4, 1.5)
            rebounds = rng.normal(6, 2)
            efficiency = max(0.0, rng.normal(0.55, 0.05))
            rows.append(
                {
                    "athlete_id": athlete["athlete_id"],
                    "game_date": game_date,
                    "opponent": f"Opponent {game_index + 1}",
                    "points": round(points, 2),
                    "assists": round(assists, 2),
                    "rebounds": round(rebounds, 2),
                    "efficiency": round(efficiency, 3),
                    "minutes": round(rng.uniform(20, 35), 1),
                }
            )
    return pd.DataFrame(rows)


def generate_social_stats(days: int = 14) -> pd.DataFrame:
    """Create mock social media follower and engagement data."""

    rows: List[Dict[str, object]] = []
    today = date.today()
    for athlete in ATHLETES:
        base_followers = 10_000 + hash(athlete["athlete_id"]) % 20_000
        for offset in range(days):
            stat_date = today - timedelta(days=offset)
            for channel in SOCIAL_CHANNELS:
                rng = np.random.default_rng(
                    hash((athlete["athlete_id"], channel, offset)) % (2**32)
                )
                followers = base_followers * (1 + offset * 0.005) + rng.normal(0, 500)
                engagement = rng.normal(0.08, 0.02)
                rows.append(
                    {
                        "athlete_id": athlete["athlete_id"],
                        "channel": channel,
                        "date": stat_date,
                        "followers": int(max(100, followers)),
                        "engagement_rate": max(0.01, round(engagement, 3)),
                        "growth_rate": round(rng.normal(0.01, 0.005), 3),
                    }
                )
    return pd.DataFrame(rows)


def generate_search_interest(days: int = 14) -> pd.DataFrame:
    """Create mock Google Trends style search interest scores."""

    today = date.today()
    rows: List[Dict[str, object]] = []
    for athlete in ATHLETES:
        for offset in range(days):
            stat_date = today - timedelta(days=offset)
            rng = np.random.default_rng(
                hash(("search", athlete["athlete_id"], offset)) % (2**32)
            )
            interest = rng.integers(20, 90)
            rows.append(
                {
                    "athlete_id": athlete["athlete_id"],
                    "date": stat_date,
                    "interest_score": int(interest),
                }
            )
    return pd.DataFrame(rows)


def load_athlete_directory() -> pd.DataFrame:
    """Return canonical athlete metadata for ID normalization."""

    return pd.DataFrame(ATHLETES)


def get_mock_nil_deals() -> pd.DataFrame:
    """Simulate NIL deals for backtesting comparisons."""

    rows: Iterable[Dict[str, object]] = [
        {
            "athlete_id": "athlete_baseball_001",
            "deal_date": date.today() - timedelta(days=7),
            "value": 25000,
        },
        {
            "athlete_id": "athlete_football_001",
            "deal_date": date.today() - timedelta(days=10),
            "value": 120000,
        },
        {
            "athlete_id": "athlete_basketball_001",
            "deal_date": date.today() - timedelta(days=3),
            "value": 60000,
        },
    ]
    return pd.DataFrame(rows)
