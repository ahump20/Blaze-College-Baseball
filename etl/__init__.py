"""ETL package for data ingestion flows."""

from .flows import nightly_pipeline

__all__ = ["nightly_pipeline"]
