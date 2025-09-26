"""Local filesystem storage to emulate S3 for raw ingested data."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict

import pandas as pd

from bsi_nil.config import load_config


class RawStorageClient:
    """Persist raw data artifacts to the configured storage path."""

    def __init__(self, base_path: str | Path | None = None) -> None:
        config = load_config()
        self.base_path = Path(base_path or config["storage"]["raw_path"])
        self.base_path.mkdir(parents=True, exist_ok=True)

    def save_dataframe(self, df: pd.DataFrame, name: str) -> Path:
        """Write a DataFrame to CSV under the storage root."""

        path = self.base_path / f"{name}.csv"
        df.to_csv(path, index=False)
        return path

    def save_json(self, data: Dict[str, Any], name: str) -> Path:
        """Write JSON payload to disk."""

        path = self.base_path / f"{name}.json"
        with path.open("w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=2, default=str)
        return path
