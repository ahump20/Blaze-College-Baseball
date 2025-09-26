"""Database utilities and SQLAlchemy session management."""

from __future__ import annotations

import contextlib
import logging
import os
from typing import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from bsi_nil.config import load_config

logger = logging.getLogger(__name__)

_ENGINE = None
_SESSION_FACTORY = None


def _create_engine():
    config = load_config()
    database_url = os.getenv("DATABASE_URL", config["database"]["url"])
    echo = config["database"].get("echo", False)

    engine = create_engine(database_url, echo=echo, future=True)
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
