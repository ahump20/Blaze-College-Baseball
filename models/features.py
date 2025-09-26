"""Feature engineering for NIL valuation."""

from __future__ import annotations

from datetime import UTC, datetime

import numpy as np
import pandas as pd

from bsi_nil.config import load_config


def compute_attention_scores(
    social_stats: pd.DataFrame,
    search_interest: pd.DataFrame,
) -> pd.DataFrame:
    """Calculate attention scores with exponential decay."""

    config = load_config()
    weights = config["features"]["attention_weights"]
    decay_days = config["features"]["attention_decay_days"]

    social_daily = (
        social_stats.groupby(["athlete_id", "date"], as_index=False)
        .agg(
            followers=("followers", "sum"),
            engagement_rate=("engagement_rate", "mean"),
            growth_rate=("growth_rate", "mean"),
        )
    )
    social_daily["social_score"] = (
        weights["social_followers"] * social_daily["followers"].rank(pct=True)
        + weights["social_engagement"] * social_daily["engagement_rate"].rank(pct=True)
    )

    search_daily = search_interest.rename(columns={"stat_date": "date"})
    search_daily["search_score"] = (
        weights["search_interest"] * search_daily["interest_score"].rank(pct=True)
    )

    merged = pd.merge(
        social_daily,
        search_daily[["athlete_id", "date", "search_score"]],
        on=["athlete_id", "date"],
        how="outer",
    ).fillna(0.0)

    today = pd.Timestamp.now(tz="UTC").normalize()
    dates = pd.to_datetime(merged["date"], utc=True)
    merged["days_ago"] = (today - dates).dt.days
    merged["decay_weight"] = np.exp(-merged["days_ago"] / decay_days)
    merged["attention_score"] = (
        (merged["social_score"] + merged["search_score"]) * merged["decay_weight"]
    )

    attention = (
        merged.groupby("athlete_id", as_index=False)["attention_score"].sum()
        .rename(columns={"attention_score": "attention_score"})
        .assign(as_of=datetime.now(UTC))
    )
    return attention


def compute_performance_index(box_scores: pd.DataFrame) -> pd.DataFrame:
    """Aggregate game-level performance into a single index per athlete."""

    config = load_config()
    weights = config["features"]["performance_weights"]

    performance = (
        box_scores.groupby("athlete_id", as_index=False)
        .agg(
            points=("points", "mean"),
            assists=("assists", "mean"),
            rebounds=("rebounds", "mean"),
            efficiency=("efficiency", "mean"),
        )
        .assign(as_of=datetime.now(UTC))
    )

    performance_index = pd.Series(0.0, index=performance.index, dtype=float)
    for stat, weight in weights.items():
        performance_index += weight * performance[stat].fillna(0.0)

    performance["performance_index"] = performance_index / max(sum(weights.values()), 1e-6)

    return performance[["athlete_id", "performance_index", "as_of"]]


def join_with_context(
    athletes: pd.DataFrame,
    attention: pd.DataFrame,
    performance: pd.DataFrame,
) -> pd.DataFrame:
    """Combine engineered features with contextual multipliers."""

    config = load_config()
    market_adjustment = config["features"]["market_adjustment"]
    school_context = config["context"]["schools"]

    df = athletes.merge(attention, on="athlete_id").merge(performance, on="athlete_id")

    def _context_multiplier(row: pd.Series) -> float:
        school_meta = school_context.get(
            row["school"], {"market_size": 1.0, "tv_exposure": 1.0}
        )
        sport_multiplier = market_adjustment.get(row["sport"], 1.0)
        return (
            sport_multiplier
            * school_meta.get("market_size", 1.0)
            * school_meta.get("tv_exposure", 1.0)
        )

    df["context_multiplier"] = df.apply(_context_multiplier, axis=1)
    df["adjusted_attention"] = df["attention_score"] * df["context_multiplier"]
    df["adjusted_performance"] = df["performance_index"] * df["context_multiplier"]
    df["as_of"] = datetime.now(UTC)
    return df
