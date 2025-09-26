"""Model training utilities for the NIL valuation pipeline."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Dict, Tuple

import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor
from sklearn.metrics import mean_squared_error

from bsi_nil.config import load_config


@dataclass
class TrainedModels:
    stage_a: LGBMRegressor
    stage_b: LGBMRegressor
    residual_std: float


@dataclass
class TrainingArtifacts:
    stage_a_rmse: float
    stage_b_rmse: float


def _prepare_stage_a_data(
    social_stats: pd.DataFrame, search_interest: pd.DataFrame, attention: pd.DataFrame
) -> Tuple[pd.DataFrame, pd.Series, pd.Series]:
    social_features = (
        social_stats.groupby("athlete_id")
        .agg(
            followers_mean=("followers", "mean"),
            engagement_mean=("engagement_rate", "mean"),
            growth_mean=("growth_rate", "mean"),
        )
        .reset_index()
    )

    search_features = (
        search_interest.groupby("athlete_id")
        .agg(
            search_mean=("interest_score", "mean"),
            search_max=("interest_score", "max"),
        )
        .reset_index()
    )

    df = social_features.merge(search_features, on="athlete_id", how="outer").fillna(0.0)
    df = df.merge(attention[["athlete_id", "attention_score"]], on="athlete_id")

    X = df.drop(columns=["athlete_id", "attention_score"])
    y = df["attention_score"]
    ids = df["athlete_id"]
    return X, y, ids


def _prepare_stage_b_data(
    features: pd.DataFrame,
    stage_a_predictions: pd.DataFrame,
    nil_deals: pd.DataFrame,
) -> Tuple[pd.DataFrame, pd.Series]:
    training_df = features.merge(
        stage_a_predictions[["athlete_id", "predicted_attention"]], on="athlete_id"
    )
    deals = (
        nil_deals.groupby("athlete_id")[["value"]]
        .mean()
        .rename(columns={"value": "nil_value"})
        .reset_index()
    )
    training_df = training_df.merge(deals, on="athlete_id", how="inner")

    X = training_df[["predicted_attention", "adjusted_performance", "context_multiplier"]]
    y = training_df["nil_value"]
    return X, y


def train_models(
    social_stats: pd.DataFrame,
    search_interest: pd.DataFrame,
    features: pd.DataFrame,
    nil_deals: pd.DataFrame,
) -> Tuple[TrainedModels, TrainingArtifacts, pd.DataFrame]:
    """Train Stage A and Stage B models and return predictions."""

    config = load_config()
    stage_a_params: Dict[str, float] = config["modeling"]["stage_a_params"]
    stage_b_params: Dict[str, float] = config["modeling"]["stage_b_params"]

    X_a, y_a, ids = _prepare_stage_a_data(social_stats, search_interest, features)
    stage_a_model = LGBMRegressor(random_state=42, **stage_a_params)
    stage_a_model.fit(X_a, y_a)
    stage_a_pred = stage_a_model.predict(X_a)
    stage_a_rmse = float(np.sqrt(mean_squared_error(y_a, stage_a_pred)))

    stage_a_predictions = pd.DataFrame(
        {
            "athlete_id": ids,
            "predicted_attention": stage_a_pred,
        }
    )

    X_b, y_b = _prepare_stage_b_data(features, stage_a_predictions, nil_deals)
    stage_b_model = LGBMRegressor(random_state=21, **stage_b_params)
    stage_b_model.fit(X_b, y_b)
    stage_b_pred = stage_b_model.predict(X_b)
    stage_b_rmse = float(np.sqrt(mean_squared_error(y_b, stage_b_pred)))

    residual_std = float(np.std(y_b - stage_b_pred, ddof=1)) if len(y_b) > 1 else 15_000.0

    models = TrainedModels(
        stage_a=stage_a_model,
        stage_b=stage_b_model,
        residual_std=residual_std,
    )
    artifacts = TrainingArtifacts(stage_a_rmse=stage_a_rmse, stage_b_rmse=stage_b_rmse)
    return models, artifacts, stage_a_predictions


def generate_valuations(
    features: pd.DataFrame,
    stage_a_predictions: pd.DataFrame,
    models: TrainedModels,
    game_counts: pd.Series,
) -> pd.DataFrame:
    """Produce NIL valuations and apply Bayesian shrinkage and confidence bands."""

    config = load_config()["modeling"]
    shrinkage_prior = config["shrinkage_prior"]
    shrinkage_strength = config["shrinkage_strength"]

    df = features.merge(stage_a_predictions, on="athlete_id", how="left")
    df["predicted_attention"] = df["predicted_attention"].fillna(df["attention_score"])

    X_predict = df[["predicted_attention", "adjusted_performance", "context_multiplier"]].fillna(0.0)
    base_pred = models.stage_b.predict(X_predict)
    base_pred = np.nan_to_num(base_pred, nan=shrinkage_prior)

    df["raw_nil_value"] = base_pred

    counts = game_counts.reindex(df["athlete_id"]).fillna(0).astype(float)
    df["game_counts"] = counts.values

    df["shrinkage_factor"] = counts / (counts + shrinkage_strength)
    df["shrunken_value"] = (
        shrinkage_prior * (1 - df["shrinkage_factor"]) + df["raw_nil_value"] * df["shrinkage_factor"]
    )
    df["shrunken_value"] = df["shrunken_value"].fillna(shrinkage_prior)

    z_score = 1.645  # 90% confidence
    residual_std = max(models.residual_std, 5_000.0)
    df["ci_margin"] = np.nan_to_num(z_score * residual_std, nan=shrinkage_prior)

    valuations = df.assign(
        nil_value=df["shrunken_value"].astype(float),
        confidence_lower=np.maximum(df["shrunken_value"] - df["ci_margin"], 0).astype(float),
        confidence_upper=(df["shrunken_value"] + df["ci_margin"]).astype(float),
        as_of=datetime.now(UTC),
    )[
        [
            "athlete_id",
            "as_of",
            "nil_value",
            "confidence_lower",
            "confidence_upper",
            "attention_score",
            "performance_index",
        ]
    ]
    return valuations
