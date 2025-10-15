/**
 * Blaze Sports Intel - Live Data Ingestion Script
 *
 * Fetches real, current sports data from SportsDataIO API and populates D1 database.
 * Replaces seed/mock data with live game information for accurate semantic search.
 *
 * Usage:
 *   SPORTSDATA_API_KEY=xxx node scripts/ingest-live-data.js
 *
 * Features:
 * - Fetches recent NFL, MLB, CFB, CBB games
 * - Generates rich, semantic descriptions for each game
 * - Stores in D1 database with proper normalization
 * - Prepares data for embedding generation
 */

const SPORTSDATA_API_KEY = process.env.SPORTSDATA_API_KEY || '6ca2adb39404482da5406f0a6cd7aa37';

let servicesPromise = null;

async function initializeServices() {
  if (!servicesPromise) {
    servicesPromise = (async () => {
      const [databaseModule, loggerModule] = await Promise.all([
        import('../api/database/connection-service.js'),
        import('../api/services/logger-service.js')
      ]);

      const LoggerService = loggerModule.default;
      const DatabaseConnectionService = databaseModule.default;

      const logger = new LoggerService({
        level: process.env.LOG_LEVEL || 'info',
        environment: process.env.NODE_ENV || 'development',
        service: 'live-data-ingest',
        version: '1.0.0'
      });

      const database = new DatabaseConnectionService({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
        database: process.env.DB_NAME || 'blaze_sports_intel',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL ? process.env.DB_SSL === 'true' : process.env.NODE_ENV === 'production',
        maxConnections: 5,
        minConnections: 1,
        connectionTimeout: 10000,
        queryTimeout: 30000
      }, logger);

      if (database.ready) {
        await database.ready;
      }

      return { database, logger };
    })();
  }

  return servicesPromise;
}

// Current season years
const CURRENT_SEASON = {
  NFL: 2024,    // 2024 season (Sep 2024 - Feb 2025)
  MLB: 2024,    // 2024 season (Apr - Oct 2024)
  CFB: 2024,    // 2024 season (Aug - Jan 2025)
  CBB: 2024     // 2024-2025 season (Nov 2024 - Apr 2025)
};

// API Configuration
const API_BASE = 'https://api.sportsdata.io/v3';
const API_ENDPOINTS = {
  NFL: {
    teams: `/nfl/scores/json/Teams`,
    schedule: `/nfl/scores/json/Schedules/${CURRENT_SEASON.NFL}`,
    scores: `/nfl/scores/json/ScoresByWeek/${CURRENT_SEASON.NFL}/5` // Week 5
  },
  MLB: {
    teams: `/mlb/scores/json/teams`,
    games: `/mlb/scores/json/Games/2024` // Full 2024 season
  },
  CFB: {
    teams: `/cfb/scores/json/Teams`,
    games: `/cfb/scores/json/Games/${CURRENT_SEASON.CFB}`
  },
  CBB: {
    teams: `/cbb/scores/json/Teams`,
    games: `/cbb/scores/json/Games/${CURRENT_SEASON.CBB}`
  }
};

/**
 * Map SportsDataIO season type codes to database values
 * @param {string|number} seasonType - API season type code
 * @returns {string} 'REG' or 'POST'
 */
function mapSeasonType(seasonType) {
  // SportsDataIO codes:
  // 1 = Regular Season
  // 2 = Preseason (treat as REG)
  // 3 = Postseason/Playoffs
  // 4 = All-Star (treat as REG)
  if (!seasonType) return 'REG';

  const code = String(seasonType);
  if (code === '3') return 'POST';

  // Default to REG for all other codes (1, 2, 4, etc.)
  return 'REG';
}

/**
 * Fetch data from SportsDataIO API
 */
async function fetchAPI(sport, endpoint) {
  const url = `${API_BASE}${endpoint}?key=${SPORTSDATA_API_KEY}`;
  console.log(`Fetching: ${sport} - ${endpoint}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Generate rich semantic description for game (for better embeddings)
 */
function generateGameDescription(game, sport) {
  const parts = [];

  // Basic matchup
  parts.push(`${game.away_team_name} at ${game.home_team_name}`);

  // Add sport context
  parts.push(`${sport} game`);

  // Score and outcome
  if (game.status === 'Final' || game.status === 'Completed') {
    const margin = Math.abs(game.home_score - game.away_score);
    const winner = game.home_score > game.away_score ? game.home_team_name : game.away_team_name;

    parts.push(`Final score: ${game.away_team_name} ${game.away_score}, ${game.home_team_name} ${game.home_score}`);
    parts.push(`${winner} won by ${margin} ${sport === 'NFL' || sport === 'CFB' ? 'points' : 'runs'}`);

    // Categorize game
    if (margin <= 3 && (sport === 'NFL' || sport === 'CFB')) {
      parts.push('close game');
      parts.push('one-possession game');
    } else if (margin <= 2 && (sport === 'MLB' || sport === 'CBB')) {
      parts.push('close game');
      parts.push('tight contest');
    } else if (margin >= 20 && (sport === 'NFL' || sport === 'CFB')) {
      parts.push('blowout');
      parts.push('dominant victory');
    } else if (margin >= 10 && (sport === 'MLB' || sport === 'CBB')) {
      parts.push('decisive win');
      parts.push('comfortable margin');
    }
  } else {
    parts.push(`Status: ${game.status}`);
  }

  // Date and venue
  const gameDate = new Date(game.game_date);
  const month = gameDate.toLocaleDateString('en-US', { month: 'long' });
  const day = gameDate.getDate();
  const year = gameDate.getFullYear();

  parts.push(`played on ${month} ${day}, ${year}`);

  if (game.stadium_name) {
    parts.push(`at ${game.stadium_name}`);
  }

  // Week context for football
  if (game.week && (sport === 'NFL' || sport === 'CFB')) {
    parts.push(`Week ${game.week}`);
  }

  // Season context
  parts.push(`${game.season} season`);

  return parts.join('. ');
}

/**
 * Normalize NFL game data from SportsDataIO
 */
function normalizeNFLGame(game) {
  return {
    sport: 'NFL',
    game_id: game.GameKey || game.ScoreID,
    season: game.Season,
    season_type: mapSeasonType(game.SeasonType),
    week: game.Week,
    game_date: game.Date || game.DateTime,
    game_time: game.DateTime ? new Date(game.DateTime).toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: '2-digit', minute: '2-digit' }) : null,
    status: game.Status,
    home_team_id: game.HomeTeamID,
    home_team_key: game.HomeTeam,
    home_team_name: game.HomeTeamName || `${game.HomeTeam}`,
    home_score: game.HomeScore,
    away_team_id: game.AwayTeamID,
    away_team_key: game.AwayTeam,
    away_team_name: game.AwayTeamName || `${game.AwayTeam}`,
    away_score: game.AwayScore,
    stadium_name: game.StadiumDetails?.Name || game.Stadium,
    winning_team_id: game.HomeScore > game.AwayScore ? game.HomeTeamID : game.AwayTeamID
  };
}

/**
 * Normalize MLB game data from SportsDataIO
 */
function normalizeMLBGame(game) {
  return {
    sport: 'MLB',
    game_id: game.GameID,
    season: game.Season,
    season_type: mapSeasonType(game.SeasonType),
    week: null,
    game_date: game.Day || game.DateTime,
    game_time: game.DateTime ? new Date(game.DateTime).toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: '2-digit', minute: '2-digit' }) : null,
    status: game.Status,
    home_team_id: game.HomeTeamID,
    home_team_key: game.HomeTeam,
    home_team_name: game.HomeTeamName || `${game.HomeTeam}`,
    home_score: game.HomeTeamRuns,
    away_team_id: game.AwayTeamID,
    away_team_key: game.AwayTeam,
    away_team_name: game.AwayTeamName || `${game.AwayTeam}`,
    away_score: game.AwayTeamRuns,
    stadium_name: game.StadiumName || game.Stadium,
    winning_team_id: game.HomeTeamRuns > game.AwayTeamRuns ? game.HomeTeamID : game.AwayTeamID
  };
}

/**
 * Normalize CFB game data from SportsDataIO
 */
function normalizeCFBGame(game) {
  return {
    sport: 'CFB',
    game_id: game.GameID,
    season: game.Season,
    season_type: mapSeasonType(game.SeasonType),
    week: game.Week,
    game_date: game.Day || game.DateTime,
    game_time: game.DateTime ? new Date(game.DateTime).toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: '2-digit', minute: '2-digit' }) : null,
    status: game.Status,
    home_team_id: game.HomeTeamID,
    home_team_key: game.HomeTeam,
    home_team_name: game.HomeTeamName || game.HomeTeam,
    home_score: game.HomeTeamScore,
    away_team_id: game.AwayTeamID,
    away_team_key: game.AwayTeam,
    away_team_name: game.AwayTeamName || game.AwayTeam,
    away_score: game.AwayTeamScore,
    stadium_name: game.Stadium,
    winning_team_id: game.HomeTeamScore > game.AwayTeamScore ? game.HomeTeamID : game.AwayTeamID
  };
}

/**
 * Normalize CBB game data from SportsDataIO
 */
function normalizeCBBGame(game) {
  return {
    sport: 'CBB',
    game_id: game.GameID,
    season: game.Season,
    season_type: mapSeasonType(game.SeasonType),
    week: null,
    game_date: game.Day || game.DateTime,
    game_time: game.DateTime ? new Date(game.DateTime).toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: '2-digit', minute: '2-digit' }) : null,
    status: game.Status,
    home_team_id: game.HomeTeamID,
    home_team_key: game.HomeTeam,
    home_team_name: game.HomeTeamName || game.HomeTeam,
    home_score: game.HomeTeamScore,
    away_team_id: game.AwayTeamID,
    away_team_key: game.AwayTeam,
    away_team_name: game.AwayTeamName || game.AwayTeam,
    away_score: game.AwayTeamScore,
    stadium_name: game.Stadium,
    winning_team_id: game.HomeTeamScore > game.AwayTeamScore ? game.HomeTeamID : game.AwayTeamID
  };
}

function toISOStringSafe(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeGameWithEvents(game, normalizer) {
  const normalizedGame = normalizer(game);
  const events = normalizeGameEvents(game, normalizedGame);
  return { game: normalizedGame, events };
}

function normalizeGameEvents(rawGame, normalizedGame) {
  if (!normalizedGame) return [];

  const sport = normalizedGame.sport;
  const fallbackGameId = normalizedGame.game_id ?? rawGame.GameID ?? rawGame.GameKey ?? rawGame.ScoreID ?? rawGame.GameId;
  const gameId = fallbackGameId != null ? String(fallbackGameId) : null;

  if (!gameId) {
    return [];
  }

  const events = [];
  const seen = new Set();

  const pushEvent = (play) => {
    if (!play || typeof play !== 'object') {
      return;
    }

    const rawEventId = play.PlayID ?? play.PlayId ?? play.ScoringPlayID ?? play.EventId ?? play.EventID ?? play.Id ?? play.ID;
    const period = play.Quarter ?? play.Inning ?? play.Period ?? play.Half ?? play.PeriodNumber ?? null;
    const clock = play.TimeRemaining ?? play.GameClock ?? play.Clock ?? play.Time ?? play.DisplayClock ?? play.DisplayTime ?? null;
    const description = play.Description ?? play.PlayDescription ?? play.Details ?? play.Comment ?? '';

    const dedupeKey = rawEventId
      ? String(rawEventId)
      : `${period || 'NA'}-${clock || '00:00'}-${description}`.toLowerCase();

    if (seen.has(dedupeKey)) {
      return;
    }

    seen.add(dedupeKey);

    const sequence = play.Sequence ?? play.SequenceNumber ?? play.PlaySequence ?? play.PlaySequenceNumber ?? play.EventNumber ?? (events.length + 1);

    events.push({
      sport,
      game_id: gameId,
      event_id: rawEventId ? String(rawEventId) : dedupeKey,
      sequence,
      period: period != null ? String(period) : null,
      clock: clock || null,
      team_key: play.Team ?? play.TeamKey ?? play.TeamAbbr ?? play.OffenseTeam ?? play.OffenseTeamAbbr ?? play.EventTeam ?? null,
      team_id: play.TeamID ?? play.TeamId ?? play.OffenseTeamID ?? play.DefenseTeamID ?? play.EventTeamID ?? null,
      event_type: play.PlayType ?? play.PlayTypeID ?? play.EventType ?? play.Type ?? play.Category ?? null,
      description,
      home_score: play.HomeScore ?? play.HomeTeamScore ?? play.HomeTeamRuns ?? play.Score?.Home ?? null,
      away_score: play.AwayScore ?? play.AwayTeamScore ?? play.AwayTeamRuns ?? play.Score?.Away ?? null,
      raw: play
    });
  };

  const addCollection = (collection) => {
    if (Array.isArray(collection)) {
      collection.forEach(pushEvent);
    }
  };

  addCollection(rawGame.ScoringPlays);
  addCollection(rawGame.ScoringDetails);
  addCollection(rawGame.Plays);
  addCollection(rawGame.PlayEvents);
  addCollection(rawGame.GamePlays);
  addCollection(rawGame.Events);

  if (rawGame.PlayByPlay) {
    addCollection(rawGame.PlayByPlay.Plays);

    if (Array.isArray(rawGame.PlayByPlay.Quarters)) {
      rawGame.PlayByPlay.Quarters.forEach((quarter) => addCollection(quarter?.Plays));
    }

    if (Array.isArray(rawGame.PlayByPlay.Innings)) {
      rawGame.PlayByPlay.Innings.forEach((inning) => addCollection(inning?.Plays));
    }

    if (Array.isArray(rawGame.PlayByPlay.Halves)) {
      rawGame.PlayByPlay.Halves.forEach((half) => addCollection(half?.Plays));
    }
  }

  return events
    .map((event, index) => ({
      ...event,
      sequence: event.sequence ?? index + 1
    }))
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
}

/**
 * Insert games and their play-by-play events in transactional batches
 */
async function insertGames(database, logger, games) {
  const BATCH_SIZE = 25;

  for (let i = 0; i < games.length; i += BATCH_SIZE) {
    const batch = games.slice(i, i + BATCH_SIZE);

    await database.transaction(async (client) => {
      const params = [];
      const values = [];
      let paramIndex = 1;
      const eventsPayload = [];

      for (const entry of batch) {
        const game = entry.game;
        const description = generateGameDescription(game, game.sport);
        const isoDate = toISOStringSafe(game.game_date) ?? game.game_date ?? null;

        values.push(`(
          $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++},
          $${paramIndex++}, $${paramIndex++}, $${paramIndex++},
          $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++},
          $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++},
          $${paramIndex++}, $${paramIndex++}, $${paramIndex++}
        )`);

        params.push(
          game.sport,
          String(game.game_id),
          game.season,
          game.season_type,
          game.week ?? null,
          isoDate,
          game.game_time || null,
          game.status,
          game.home_team_id,
          game.home_team_key,
          game.home_team_name,
          game.home_score ?? null,
          game.away_team_id,
          game.away_team_key,
          game.away_team_name,
          game.away_score ?? null,
          game.stadium_name || null,
          game.winning_team_id ?? null,
          description
        );

        if (Array.isArray(entry.events) && entry.events.length > 0) {
          const normalizedEvents = entry.events.map((event, index) => ({
            sport: game.sport,
            game_id: String(game.game_id),
            event_id: event.event_id ? String(event.event_id) : `${game.game_id}-${event.sequence ?? index + 1}`,
            sequence: event.sequence ?? index + 1,
            period: event.period ?? null,
            clock: event.clock ?? null,
            team_key: event.team_key ?? null,
            team_id: event.team_id ? String(event.team_id) : null,
            event_type: event.event_type ?? null,
            description: event.description ?? '',
            metadata: {
              homeScore: event.home_score ?? null,
              awayScore: event.away_score ?? null,
              raw: event.raw || event
            }
          }));

          eventsPayload.push(...normalizedEvents);
        }
      }

      if (values.length === 0) {
        return;
      }

      const sql = `
        INSERT INTO games (
          sport, game_id, season, season_type, week,
          game_date, game_time, status,
          home_team_id, home_team_key, home_team_name, home_score,
          away_team_id, away_team_key, away_team_name, away_score,
          stadium_name, winning_team_id, description
        ) VALUES ${values.join(', ')}
        ON CONFLICT (sport, game_id) DO UPDATE SET
          season = EXCLUDED.season,
          season_type = EXCLUDED.season_type,
          week = EXCLUDED.week,
          game_date = EXCLUDED.game_date,
          game_time = EXCLUDED.game_time,
          status = EXCLUDED.status,
          home_team_id = EXCLUDED.home_team_id,
          home_team_key = EXCLUDED.home_team_key,
          home_team_name = EXCLUDED.home_team_name,
          home_score = EXCLUDED.home_score,
          away_team_id = EXCLUDED.away_team_id,
          away_team_key = EXCLUDED.away_team_key,
          away_team_name = EXCLUDED.away_team_name,
          away_score = EXCLUDED.away_score,
          stadium_name = EXCLUDED.stadium_name,
          winning_team_id = EXCLUDED.winning_team_id,
          description = EXCLUDED.description,
          updated_at = CURRENT_TIMESTAMP
      `;

      await client.query(sql, params);

      if (eventsPayload.length > 0) {
        await database.insertGameEvents(client, eventsPayload);
      }

      logger.debug('Game batch persisted', {
        games: batch.length,
        events: eventsPayload.length
      });
    });
  }
}

/**
 * Main ingestion workflow
 */
async function ingestLiveData() {
  const { database, logger } = await initializeServices();

  console.log('🔥 Blaze Sports Intel - Live Data Ingestion\n');
  logger.info('Starting live data ingestion run');

  const allGames = [];
  let totalEvents = 0;

  try {
    console.log('📊 Starting fresh data ingestion...\n');

    console.log('🏈 Fetching NFL data...');
    logger.info('Fetching NFL play-by-play feed', { sport: 'NFL' });
    const nflGames = await fetchAPI('NFL', API_ENDPOINTS.NFL.scores);
    const normalizedNFL = nflGames
      .filter(game => game.Status === 'Final' || game.Status === 'InProgress')
      .map(game => normalizeGameWithEvents(game, normalizeNFLGame));

    console.log(`✅ Found ${normalizedNFL.length} NFL games\n`);
    logger.debug('NFL normalization complete', { count: normalizedNFL.length });
    allGames.push(...normalizedNFL);

    console.log('⚾ Fetching MLB data...');
    logger.info('Fetching MLB play-by-play feed', { sport: 'MLB' });
    const mlbGames = await fetchAPI('MLB', API_ENDPOINTS.MLB.games);
    const normalizedMLB = mlbGames
      .filter(game => game.Status === 'Final' && game.Day >= '2024-09-01')
      .slice(0, 100)
      .map(game => normalizeGameWithEvents(game, normalizeMLBGame));

    console.log(`✅ Found ${normalizedMLB.length} MLB games\n`);
    logger.debug('MLB normalization complete', { count: normalizedMLB.length });
    allGames.push(...normalizedMLB);

    console.log('🏈 Fetching CFB data...');
    logger.info('Fetching CFB play-by-play feed', { sport: 'CFB' });
    try {
      const cfbGames = await fetchAPI('CFB', API_ENDPOINTS.CFB.games);
      const normalizedCFB = cfbGames
        .filter(game => game.Status === 'Final' && game.Week <= 7)
        .slice(0, 50)
        .map(game => normalizeGameWithEvents(game, normalizeCFBGame));

      console.log(`✅ Found ${normalizedCFB.length} CFB games\n`);
      logger.debug('CFB normalization complete', { count: normalizedCFB.length });
      allGames.push(...normalizedCFB);
    } catch (error) {
      console.warn('⚠️  CFB data unavailable:', error.message);
      logger.warn('CFB feed unavailable, continuing without updates', { error: error.message });
    }

    console.log('🏀 Fetching CBB data...');
    logger.info('Fetching CBB play-by-play feed', { sport: 'CBB' });
    try {
      const cbbGames = await fetchAPI('CBB', API_ENDPOINTS.CBB.games);
      const normalizedCBB = cbbGames
        .filter(game => game.Status === 'Final')
        .slice(0, 50)
        .map(game => normalizeGameWithEvents(game, normalizeCBBGame));

      console.log(`✅ Found ${normalizedCBB.length} CBB games\n`);
      logger.debug('CBB normalization complete', { count: normalizedCBB.length });
      allGames.push(...normalizedCBB);
    } catch (error) {
      console.warn('⚠️  CBB data unavailable (season hasn\'t started):', error.message);
      logger.warn('CBB feed unavailable, continuing without updates', { error: error.message });
    }

    console.log(`📊 Inserting ${allGames.length} total games into database...`);
    logger.info('Persisting games and events', { totalGames: allGames.length });
    await insertGames(database, logger, allGames);

    totalEvents = allGames.reduce((sum, entry) => sum + (entry.events?.length || 0), 0);

    const gameCounts = allGames.reduce((acc, entry) => {
      const sport = entry.game.sport;
      acc[sport] = (acc[sport] || 0) + 1;
      return acc;
    }, {});

    const eventCounts = allGames.reduce((acc, entry) => {
      const sport = entry.game.sport;
      acc[sport] = (acc[sport] || 0) + (entry.events?.length || 0);
      return acc;
    }, {});

    console.log('\n✅ Live data ingestion complete!');
    console.log(`\n📈 Summary:`);
    console.log(`   - NFL: ${gameCounts.NFL || 0} games (${eventCounts.NFL || 0} events)`);
    console.log(`   - MLB: ${gameCounts.MLB || 0} games (${eventCounts.MLB || 0} events)`);
    console.log(`   - CFB: ${gameCounts.CFB || 0} games (${eventCounts.CFB || 0} events)`);
    console.log(`   - CBB: ${gameCounts.CBB || 0} games (${eventCounts.CBB || 0} events)`);
    console.log(`   - Total: ${allGames.length} games / ${totalEvents} events`);

    console.log('\n🔄 Next steps:');
    console.log('   1. Run embedding generation: node scripts/generate-embeddings.js');
    console.log('   2. Test search: curl -X POST .../api/copilot/search -d \'{"query":"close nfl games"}\'');

    logger.info('Live data ingestion completed successfully', {
      totalGames: allGames.length,
      totalEvents
    });
  } catch (error) {
    console.error('❌ Ingestion failed:', error);
    logger.error('Live data ingestion failed', { error: error.message }, error);
    throw error;
  } finally {
    await database.close().catch(() => {});
  }
}

// Run if executed directly
ingestLiveData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { ingestLiveData };
