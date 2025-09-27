"""Database utilities and SQLAlchemy session management."""

from __future__ import annotations

import contextlib
import logging
import os
from pathlib import Path
from typing import Iterator

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.engine.url import make_url
from sqlalchemy.orm import Session, sessionmaker

from bsi_nil.config import load_config

logger = logging.getLogger(__name__)

_ENGINE = None
_SESSION_FACTORY = None


def _create_engine():
    config = load_config()
    database_url = os.getenv("DATABASE_URL", config["database"]["url"])
    echo = bool(config["database"].get("echo", False))

    url: URL = make_url(database_url)
    connect_args: dict[str, object] = {}

    if url.drivername.startswith("sqlite"):
        database = url.database or ""
        if database not in {"", ":memory:"}:
            db_path = Path(database).expanduser()
            if not db_path.is_absolute():
                db_path = Path.cwd() / db_path
            db_path.parent.mkdir(parents=True, exist_ok=True)
            url = url.set(database=str(db_path))
        connect_args["check_same_thread"] = False

    engine = create_engine(url, echo=echo, future=True, connect_args=connect_args)
    return engine


def get_engine():
    global _ENGINE
    if _ENGINE is None:
        _ENGINE = _create_engine()
    return _ENGINE


def get_session_factory():
    global _SESSION_FACTORY
    if _SESSION_FACTORY is None:
        engine = get_engine()
        _SESSION_FACTORY = sessionmaker(bind=engine, class_=Session, autoflush=False)
    return _SESSION_FACTORY


@contextlib.contextmanager
def session_scope() -> Iterator[Session]:
    """Provide a transactional scope around a series of operations."""

    session_factory = get_session_factory()
    session = session_factory()
    try:
        yield session
        session.commit()
    except Exception:  # pragma: no cover - defensive rollback
        session.rollback()
        raise
    finally:
        session.close()


def reset_engine() -> None:
    """Dispose of the cached SQLAlchemy engine (for tests)."""

    global _ENGINE, _SESSION_FACTORY
    if _ENGINE is not None:
        _ENGINE.dispose()
    _ENGINE = None
    _SESSION_FACTORY = None
