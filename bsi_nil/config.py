"""Configuration utilities for the Blaze Sports Intel NIL pipeline."""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict

import yaml


class ConfigError(RuntimeError):
    """Raised when configuration cannot be loaded or parsed."""


@lru_cache(maxsize=1)
def load_config(path: str | Path | None = None) -> Dict[str, Any]:
    """Load YAML configuration and cache the parsed dictionary.

    Args:
        path: Optional explicit path to the YAML config file. If omitted,
            the function will look for the ``BLAZE_CONFIG`` environment
            variable and fall back to ``config/settings.yaml`` relative to the
            project root.

    Returns:
        Parsed configuration dictionary.

    Raises:
        ConfigError: If the file cannot be read or parsed.
    """

    config_path = Path(
        path
        or os.getenv("BLAZE_CONFIG")
        or Path(__file__).resolve().parent.parent / "config" / "settings.yaml"
    )

    if not config_path.exists():
        raise ConfigError(f"Configuration file not found: {config_path}")

    try:
        with config_path.open("r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
    except yaml.YAMLError as exc:  # pragma: no cover - explicit error propagation
        raise ConfigError("Invalid YAML configuration") from exc

    if not isinstance(data, dict):
        raise ConfigError("Configuration root must be a mapping")

    return data


def reset_config_cache() -> None:
    """Clear cached configuration for test isolation."""

    load_config.cache_clear()
