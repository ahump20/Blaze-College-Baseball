"""SQLAlchemy ORM models for the NIL valuation warehouse."""

from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base declarative class."""


class Athlete(Base):
    __tablename__ = "athletes"

    athlete_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    sport: Mapped[str] = mapped_column(String(64), nullable=False)
    school: Mapped[str] = mapped_column(String(128), nullable=False)

    box_scores: Mapped[list["BoxScore"]] = relationship(back_populates="athlete")
    valuations: Mapped[list["AthleteValuation"]] = relationship(back_populates="athlete")


class BoxScore(Base):
    __tablename__ = "box_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    athlete_id: Mapped[str] = mapped_column(ForeignKey("athletes.athlete_id"), nullable=False)
    game_date: Mapped[date] = mapped_column(Date, nullable=False)
    opponent: Mapped[str] = mapped_column(String(128), nullable=False)
    points: Mapped[float] = mapped_column(Float, nullable=False)
    assists: Mapped[float] = mapped_column(Float, nullable=False)
    rebounds: Mapped[float] = mapped_column(Float, nullable=False)
    efficiency: Mapped[float] = mapped_column(Float, nullable=False)
    minutes: Mapped[float] = mapped_column(Float, nullable=False)

    athlete: Mapped[Athlete] = relationship(back_populates="box_scores")


class SocialStat(Base):
    __tablename__ = "social_stats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    athlete_id: Mapped[str] = mapped_column(ForeignKey("athletes.athlete_id"), nullable=False)
    channel: Mapped[str] = mapped_column(String(32), nullable=False)
    stat_date: Mapped[date] = mapped_column(Date, nullable=False)
    followers: Mapped[int] = mapped_column(Integer, nullable=False)
    engagement_rate: Mapped[float] = mapped_column(Float, nullable=False)
    growth_rate: Mapped[float] = mapped_column(Float, nullable=False)

    athlete: Mapped[Athlete] = relationship()


class SearchInterest(Base):
    __tablename__ = "search_interest"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    athlete_id: Mapped[str] = mapped_column(ForeignKey("athletes.athlete_id"), nullable=False)
    stat_date: Mapped[date] = mapped_column(Date, nullable=False)
    interest_score: Mapped[int] = mapped_column(Integer, nullable=False)

    athlete: Mapped[Athlete] = relationship()


class AthleteFeature(Base):
    __tablename__ = "athlete_features"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    athlete_id: Mapped[str] = mapped_column(ForeignKey("athletes.athlete_id"), nullable=False)
    as_of: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    attention_score: Mapped[float] = mapped_column(Float, nullable=False)
    performance_index: Mapped[float] = mapped_column(Float, nullable=False)

    athlete: Mapped[Athlete] = relationship()


class AthleteValuation(Base):
    __tablename__ = "athlete_valuations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    athlete_id: Mapped[str] = mapped_column(ForeignKey("athletes.athlete_id"), nullable=False)
    as_of: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    nil_value: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    confidence_lower: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    confidence_upper: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    attention_score: Mapped[float] = mapped_column(Float, nullable=False)
    performance_index: Mapped[float] = mapped_column(Float, nullable=False)

    athlete: Mapped[Athlete] = relationship(back_populates="valuations")
