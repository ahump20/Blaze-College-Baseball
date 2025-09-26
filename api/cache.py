"""Caching utilities backed by Redis with graceful fallback."""

from __future__ import annotations

import json
import logging
from datetime import timedelta
from typing import Any, Optional

import redis

from bsi_nil.config import load_config

logger = logging.getLogger(__name__)


class CacheClient:
    """Simple key/value cache with JSON serialization."""

    def __init__(self) -> None:
        config = load_config()
        redis_cfg = config["redis"]
        self.ttl = redis_cfg.get("ttl_seconds", 900)
        self._memory_store: dict[str, tuple[Any, float]] = {}
        try:
            self.client: Optional[redis.Redis] = redis.Redis(
                host=redis_cfg.get("host", "localhost"),
                port=redis_cfg.get("port", 6379),
                socket_timeout=1,
                socket_connect_timeout=1,
                decode_responses=True,
            )
            # Probe connection
            self.client.ping()
        except redis.RedisError as exc:  # pragma: no cover - network failure scenario
            logger.warning("Redis unavailable, falling back to in-memory cache: %s", exc)
            self.client = None
            self._memory_store: dict[str, tuple[Any, float]] = {}

    def _serialize(self, value: Any) -> str:
        return json.dumps(value, default=str)

    def _deserialize(self, value: str) -> Any:
        return json.loads(value)

    def get(self, key: str) -> Optional[Any]:
        if self.client is not None:
            payload = self.client.get(key)
            return self._deserialize(payload) if payload else None
        value, _ = self._memory_store.get(key, (None, 0))
        return value

    def set(self, key: str, value: Any) -> None:
        if self.client is not None:
            self.client.setex(key, timedelta(seconds=self.ttl), self._serialize(value))
        else:
            self._memory_store[key] = (value, self.ttl)
