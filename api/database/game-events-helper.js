/**
 * Helper utilities for inserting normalized play-by-play events.
 */

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

export async function insertGameEvents(client, gameId, events = [], logger, options = {}) {
  if (!events.length) {
    logger?.debug?.('No play-by-play events to persist', { gameId });
    return { inserted: 0 };
  }

  const chunkSize = options.chunkSize || 100;
  let totalInserted = 0;

  for (const [chunkIndex, chunk] of chunkArray(events, chunkSize).entries()) {
    const params = [];
    const values = chunk.map((event, rowIndex) => {
      const baseIndex = rowIndex * 9;
      params.push(
        gameId,
        event.externalEventId || null,
        event.sequence,
        event.period || null,
        event.clock || null,
        event.homeScore,
        event.awayScore,
        event.description || null,
        JSON.stringify(event.metadata || {})
      );
      const placeholders = Array.from({ length: 9 }, (_, offset) => `$${baseIndex + offset + 1}`);
      return `(${placeholders.join(', ')})`;
    });

    await client.query(`
      INSERT INTO game_events (
        game_id, external_event_id, sequence, period, clock,
        home_score, away_score, description, metadata
      ) VALUES ${values.join(', ')}
      ON CONFLICT (game_id, sequence) DO UPDATE SET
        external_event_id = EXCLUDED.external_event_id,
        period = EXCLUDED.period,
        clock = EXCLUDED.clock,
        home_score = EXCLUDED.home_score,
        away_score = EXCLUDED.away_score,
        description = EXCLUDED.description,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    `, params);

    totalInserted += chunk.length;

    logger?.debug?.('Inserted play-by-play chunk', {
      gameId,
      chunkIndex,
      chunkSize: chunk.length
    });
  }

  logger?.info?.('Play-by-play events persisted', { gameId, events: totalInserted });

  return { inserted: totalInserted };
}

export default insertGameEvents;
