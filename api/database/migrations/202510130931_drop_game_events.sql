-- Rollback: Drop game_events table and supporting indexes
-- Timestamp: 2025-10-13 09:31 CDT
-- Note: Execute the TimescaleDB metadata cleanup before running this rollback if game_events was promoted to a hypertable.

BEGIN;

-- For TimescaleDB deployments uncomment the following to tear down hypertable metadata safely:
-- SELECT delete_hypertable('game_events', if_exists => TRUE);

DROP INDEX IF EXISTS idx_game_events_timestamp_desc;
DROP INDEX IF EXISTS idx_game_events_event_type;
DROP INDEX IF EXISTS idx_game_events_game_inning_half;
DROP INDEX IF EXISTS idx_game_events_game_sequence;

DROP TABLE IF EXISTS game_events;

COMMIT;
