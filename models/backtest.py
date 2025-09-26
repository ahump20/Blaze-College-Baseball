"""Backtesting utilities for the NIL valuation pipeline."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_percentage_error


@dataclass
class BacktestResult:
    mape: float
    bias: float
    coverage: float


def backtest(valuations: pd.DataFrame, deals: pd.DataFrame) -> BacktestResult:
    """Compare generated valuations against observed NIL deals."""

    if valuations.empty or deals.empty:
        return BacktestResult(mape=float("nan"), bias=float("nan"), coverage=0.0)

    merged = valuations.merge(deals, on="athlete_id", how="inner")
    if merged.empty:
        return BacktestResult(mape=float("nan"), bias=float("nan"), coverage=0.0)

    y_true = merged["value"].to_numpy()
    y_pred = merged["nil_value"].to_numpy()
    lower = merged["confidence_lower"].to_numpy()
    upper = merged["confidence_upper"].to_numpy()

    mape = float(mean_absolute_percentage_error(y_true, y_pred))
    bias = float(np.mean(y_pred - y_true))
    coverage = float(np.mean((y_true >= lower) & (y_true <= upper)))
    return BacktestResult(mape=mape, bias=bias, coverage=coverage)
