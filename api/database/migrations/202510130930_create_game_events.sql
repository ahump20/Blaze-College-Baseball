-- Migration: Create game_events table for granular play-by-play ingestion
-- Timestamp: 2025-10-13 09:30 CDT
-- Context: BlazeSportsIntel Diamond Insights - capture NCAA baseball game events

BEGIN;

CREATE TABLE IF NOT EXISTS game_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    description TEXT,
    inning SMALLINT CHECK (inning IS NULL OR inning >= 1),
    half_inning VARCHAR(6) CHECK (half_inning IN ('top', 'bottom')),
    outs_before SMALLINT CHECK (outs_before IS NULL OR (outs_before BETWEEN 0 AND 2)),
    outs_after SMALLINT CHECK (outs_after IS NULL OR (outs_after BETWEEN 0 AND 3)),
    home_score INTEGER,
    away_score INTEGER,
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source VARCHAR(50),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (game_id, sequence_number)
);

COMMENT ON TABLE game_events IS 'Atomic play-by-play events aligned to NCAA baseball and future multi-sport coverage.';
COMMENT ON COLUMN game_events.sequence_number IS 'Monotonic event ordering within a game.';
COMMENT ON COLUMN game_events.metadata IS 'Provider-specific payload snapshot (JSONB).';

-- TimescaleDB / partitioning guidance:
-- To convert this table into a hypertable once TimescaleDB is enabled, run:
--   SELECT create_hypertable('game_events', 'event_timestamp', chunk_time_interval => INTERVAL '7 days', if_not_exists => TRUE, migrate_data => TRUE);
-- For vanilla PostgreSQL partitioning, consider RANGE partitioning on event_timestamp per season and attach indexes per partition.

CREATE INDEX IF NOT EXISTS idx_game_events_game_sequence
    ON game_events (game_id, sequence_number);

CREATE INDEX IF NOT EXISTS idx_game_events_game_inning_half
    ON game_events (game_id, inning, half_inning);

CREATE INDEX IF NOT EXISTS idx_game_events_event_type
    ON game_events (event_type)
    INCLUDE (game_id, inning, half_inning, sequence_number, event_timestamp);

CREATE INDEX IF NOT EXISTS idx_game_events_timestamp_desc
    ON game_events (event_timestamp DESC)
    INCLUDE (game_id, event_type, inning, half_inning, sequence_number);

COMMIT;
