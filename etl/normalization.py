"""Utilities for normalizing athlete identifiers across sources."""

from __future__ import annotations

from typing import Dict

import pandas as pd


def build_id_map(directory: pd.DataFrame) -> Dict[str, str]:
    """Create a lookup of alternate IDs to canonical athlete IDs."""

    # In a full system we would manage crosswalk tables. For the scaffold we
    # simply ensure the canonical ID maps to itself.
    return {row["athlete_id"]: row["athlete_id"] for _, row in directory.iterrows()}


def normalize_ids(df: pd.DataFrame, id_column: str, id_map: Dict[str, str]) -> pd.DataFrame:
    """Replace identifiers in ``id_column`` using the provided lookup."""

    df = df.copy()
    df[id_column] = df[id_column].map(id_map).fillna(df[id_column])
    return df
