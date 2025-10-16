#!/usr/bin/env node

/**
 * Blaze Sports Intel - Live Data Ingestion
 * ----------------------------------------
 *
 * Refactored ingestion workflow that relies on the shared
 * DatabaseConnectionService rather than shelling out to Wrangler.
 * The worker ingests game metadata alongside normalized play-by-play
 * feeds and persists everything inside a single transactional boundary.
 */

import DatabaseConnectionService from '../api/database/connection-service.js';
import LoggerService from '../api/services/logger-service.js';
import { insertGameEvents } from '../api/database/game-events-helper.js';

const SPORTSDATA_API_KEY = process.env.SPORTSDATA_API_KEY;
if (!SPORTSDATA_API_KEY) {
  console.error('Error: The SPORTSDATA_API_KEY environment variable must be set.');
  process.exit(1);
}

const DATABASE_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'blaze_sports_intel',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production'
};

const CURRENT_SEASON = {
  NFL: 2024,
  MLB: 2024,
  CFB: 2024,
  CBB: 2024
};

const API_BASE = 'https://api.sportsdata.io/v3';

const API_ENDPOINTS = {
  NFL: {
    games: `/nfl/scores/json/ScoresByWeek/${CURRENT_SEASON.NFL}/5`
  },
  MLB: {
    games: `/mlb/scores/json/Games/${CURRENT_SEASON.MLB}`
  },
  CFB: {
    games: `/cfb/scores/json/Games/${CURRENT_SEASON.CFB}`
  },
  CBB: {
    games: `/cbb/scores/json/Games/${CURRENT_SEASON.CBB}`
  }
};

const PLAY_BY_PLAY_ENDPOINTS = {
  NFL: (game) => {
    if (!game.week || !game.home?.abbreviation) return null;
    // seasonType: 1 = Preseason, 2 = Regular, 3 = Postseason (per SportsDataIO docs)
    return `/nfl/stats/json/PlayByPlay/${game.season}/${game.seasonType === 3 ? 'POST' : 'REG'}/${game.week}/${game.home.abbreviation}`;
  },
  MLB: (game) => `/mlb/stats/json/PlayByPlay/${game.externalId}`,
  CFB: (game) => {
    if (!game.week || !game.home?.abbreviation) return null;
    return `/cfb/stats/json/PlayByPlay/${game.season}/${game.week}/${game.home.abbreviation}`;
  },
  CBB: (game) => `/cbb/stats/json/PlayByPlay/${game.season}/${game.externalId}`
};

const SPORT_METADATA_MAP = {
  NFL: { sport: 'nfl', league: 'NFL' },
  MLB: { sport: 'mlb', league: 'MLB' },
  CFB: { sport: 'ncaa_football', league: 'NCAA' },
  CBB: { sport: 'ncaa_basketball', league: 'NCAA' }
};

const logger = new LoggerService({
  level: process.env.LOG_LEVEL || 'info',
  environment: process.env.NODE_ENV || 'development',
  service: 'live-data-ingestion',
  version: '1.1.0'
});

const database = new DatabaseConnectionService(DATABASE_CONFIG, logger);

function normalizeSeasonType(seasonType) {
  if (seasonType === null || seasonType === undefined) return 'regular';
  const code = Number(seasonType);
  if (code === 3) return 'postseason';
  return 'regular';
}

function normalizeStatus(status) {
  if (!status) return 'scheduled';
  const value = status.toLowerCase().replace(/\s+/g, '_');
  if (value.includes('final') || value.includes('completed')) return 'completed';
  if (value.includes('inprogress') || value.includes('in_progress') || value.includes('in-game')) return 'in_progress';
  if (value.includes('postponed')) return 'postponed';
  if (value.includes('cancelled')) return 'canceled';
  return value;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

function normalizeTeam(sportKey, data = {}) {
  const meta = SPORT_METADATA_MAP[sportKey];
  if (!meta) return null;

  const abbreviation = data.key || data.abbreviation || (data.name ? data.name.slice(0, 3) : null);
  const externalId = data.id ?? data.externalId ?? data.key ?? data.name;

  if (!externalId) {
    return null;
  }

  const metadata = {
    ...data.metadata,
    state: data.state || data.metadata?.state || null,
    record: data.record || null
  };

  return {
    externalId: String(externalId),
    name: data.name || data.fullName || data.abbreviation || 'Unknown Team',
    abbreviation: abbreviation
      ? String(abbreviation).toUpperCase()
      : String(externalId).slice(0, 3).toUpperCase(),
    sport: meta.sport,
    league: meta.league,
    location: {
      city: data.city || null,
      state: data.state || null
    },
    division: data.division || null,
    conference: data.conference || null,
    metadata,
    score: toNumber(data.score)
  };
}

function buildNormalizedGame(sportKey, payload) {
  const sportMeta = SPORT_METADATA_MAP[sportKey];
  if (!sportMeta) return null;

  const home = normalizeTeam(sportKey, payload.homeTeam || {});
  const away = normalizeTeam(sportKey, payload.awayTeam || {});

  if (!home || !away) {
    return null;
  }

  const season = Number(payload.season) || CURRENT_SEASON[sportKey];
  const seasonType = normalizeSeasonType(payload.seasonType);
  const status = normalizeStatus(payload.status);
  const gameDate = parseDate(payload.gameDate || payload.startTime);

  if (!payload.externalId || !gameDate) {
    return null;
  }

  const normalized = {
    externalId: String(payload.externalId),
    sport: sportMeta.sport,
    league: sportMeta.league,
    season,
    seasonType,
    week: payload.week !== undefined && payload.week !== null ? Number(payload.week) : null,
    status,
    gameDate,
    venue: {
      name: payload.venueName || null,
      city: payload.venueCity || home.location.city || null,
      state: payload.venueState || home.location.state || null
    },
    weather: payload.weather || null,
    home,
    away,
    metadata: {
      source: 'sportsdataio',
      seasonTypeCode: payload.seasonType,
      statusDetail: payload.status,
      week: payload.week || null,
      ...payload.extraMetadata
    }
  };

  normalized.description = generateGameDescription(normalized);
  return normalized;
}

function normalizeNFLGame(game) {
  return buildNormalizedGame('NFL', {
    externalId: game.GameKey || game.ScoreID,
    season: game.Season,
    seasonType: game.SeasonType,
    week: game.Week,
    gameDate: game.Date || game.DateTime,
    status: game.Status,
    venueName: game.StadiumDetails?.Name || game.Stadium,
    venueCity: game.StadiumDetails?.City,
    venueState: game.StadiumDetails?.State,
    weather: game.ForecastDescription ? {
      summary: game.ForecastDescription,
      temperature: toNumber(game.ForecastTemperature),
      windChill: toNumber(game.ForecastWindChill),
      windSpeed: toNumber(game.ForecastWindSpeed)
    } : null,
    homeTeam: {
      id: game.HomeTeamID,
      key: game.HomeTeam,
      name: game.HomeTeamName || game.HomeTeam,
      score: game.HomeScore,
      city: game.StadiumDetails?.City,
      state: game.StadiumDetails?.State,
      record: game.HomeTeamWins !== undefined && game.HomeTeamLosses !== undefined
        ? `${game.HomeTeamWins}-${game.HomeTeamLosses}`
        : null
    },
    awayTeam: {
      id: game.AwayTeamID,
      key: game.AwayTeam,
      name: game.AwayTeamName || game.AwayTeam,
      score: game.AwayScore,
      city: game.StadiumDetails?.City,
      state: game.StadiumDetails?.State,
      record: game.AwayTeamWins !== undefined && game.AwayTeamLosses !== undefined
        ? `${game.AwayTeamWins}-${game.AwayTeamLosses}`
        : null
    },
    extraMetadata: {
      gameKey: game.GameKey,
      broadcast: game.Channel || null
    }
  });
}

function normalizeMLBGame(game) {
  return buildNormalizedGame('MLB', {
    externalId: game.GameID,
    season: game.Season,
    seasonType: game.SeasonType,
    week: null,
    gameDate: game.Day || game.DateTime,
    status: game.Status,
    venueName: game.StadiumName || game.Stadium,
    venueCity: game.StadiumDetails?.City,
    venueState: game.StadiumDetails?.State,
    weather: game.Weather || null,
    homeTeam: {
      id: game.HomeTeamID,
      key: game.HomeTeam,
      name: game.HomeTeamName || game.HomeTeam,
      score: game.HomeTeamRuns,
      city: game.HomeTeamCity,
      state: game.HomeTeamState,
      division: game.HomeTeamDivision,
      metadata: {
        probablePitcher: game.HomePitcher || null
      }
    },
    awayTeam: {
      id: game.AwayTeamID,
      key: game.AwayTeam,
      name: game.AwayTeamName || game.AwayTeam,
      score: game.AwayTeamRuns,
      city: game.AwayTeamCity,
      state: game.AwayTeamState,
      division: game.AwayTeamDivision,
      metadata: {
        probablePitcher: game.AwayPitcher || null
      }
    },
    extraMetadata: {
      attendance: game.Attendance,
      gameNumber: game.GameNumber,
      doubleHeader: game.IsDoubleHeader || false
    }
  });
}

function normalizeCFBGame(game) {
  return buildNormalizedGame('CFB', {
    externalId: game.GameID,
    season: game.Season,
    seasonType: game.SeasonType,
    week: game.Week,
    gameDate: game.Day || game.DateTime,
    status: game.Status,
    venueName: game.Stadium,
    venueCity: game.StadiumDetails?.City,
    venueState: game.StadiumDetails?.State,
    weather: game.Weather || null,
    homeTeam: {
      id: game.HomeTeamID,
      key: game.HomeTeam,
      name: game.HomeTeamName || game.HomeTeam,
      score: game.HomeTeamScore,
      conference: game.HomeConference,
      metadata: {
        rank: game.HomeRank || null
      }
    },
    awayTeam: {
      id: game.AwayTeamID,
      key: game.AwayTeam,
      name: game.AwayTeamName || game.AwayTeam,
      score: game.AwayTeamScore,
      conference: game.AwayConference,
      metadata: {
        rank: game.AwayRank || null
      }
    },
    extraMetadata: {
      isConferenceGame: Boolean(game.ConferenceGame)
    }
  });
}

function normalizeCBBGame(game) {
  return buildNormalizedGame('CBB', {
    externalId: game.GameID,
    season: game.Season,
    seasonType: game.SeasonType,
    week: null,
    gameDate: game.Day || game.DateTime,
    status: game.Status,
    venueName: game.Stadium,
    venueCity: game.StadiumDetails?.City,
    venueState: game.StadiumDetails?.State,
    homeTeam: {
      id: game.HomeTeamID,
      key: game.HomeTeam,
      name: game.HomeTeamName || game.HomeTeam,
      score: game.HomeTeamScore,
      conference: game.HomeConference,
      metadata: {
        rank: game.HomeRank || null
      }
    },
    awayTeam: {
      id: game.AwayTeamID,
      key: game.AwayTeam,
      name: game.AwayTeamName || game.AwayTeam,
      score: game.AwayTeamScore,
      conference: game.AwayConference,
      metadata: {
        rank: game.AwayRank || null
      }
    },
    extraMetadata: {
      tournament: game.Tournament || null
    }
  });
}

const GAME_NORMALIZERS = {
  NFL: normalizeNFLGame,
  MLB: normalizeMLBGame,
  CFB: normalizeCFBGame,
  CBB: normalizeCBBGame
};

function generateGameDescription(game) {
  const parts = [];

  parts.push(`${game.away.name} at ${game.home.name}`);
  parts.push(`${game.league} ${game.sport.toUpperCase()} game`);

  if (game.home.score !== null && game.away.score !== null) {
    parts.push(`Final score ${game.away.name} ${game.away.score}, ${game.home.name} ${game.home.score}`);
    const margin = Math.abs(game.home.score - game.away.score);
    if (margin <= 3) {
      parts.push('Decided by one possession');
    } else if (margin >= 10 && game.sport === 'mlb') {
      parts.push('Run-rule margin');
    }
  } else if (game.status === 'in_progress') {
    parts.push('In progress with live play-by-play updates');
  } else {
    parts.push(`Status: ${game.status}`);
  }

  if (game.gameDate) {
    parts.push(`Played on ${game.gameDate.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })}`);
  }

  if (game.venue?.name) {
    parts.push(`Venue: ${game.venue.name}`);
  }

  return parts.join('. ');
}

async function fetchAPI(sportKey, endpoint) {
  const url = new URL(`${API_BASE}${endpoint}`);
  if (SPORTSDATA_API_KEY) {
    url.searchParams.set('key', SPORTSDATA_API_KEY);
  }

  logger.debug('Fetching sports data feed', {
    sport: sportKey,
    endpoint: url.pathname,
    query: Object.fromEntries(url.searchParams.entries())
  });

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'BlazeSportsIntel/1.0'
    }
  });

  if (!response.ok) {
    const error = new Error(`API request failed: ${response.status} ${response.statusText}`);
    logger.error('API request failed', { sport: sportKey, endpoint: url.toString(), status: response.status }, error);
    throw error;
  }

  return response.json();
}

async function fetchPlayByPlay(sportKey, game) {
  const buildEndpoint = PLAY_BY_PLAY_ENDPOINTS[sportKey];
  if (!buildEndpoint) {
    return null;
  }

  const endpoint = buildEndpoint(game);
  if (!endpoint) {
    logger.debug('Play-by-play endpoint unavailable for game', {
      sport: sportKey,
      externalId: game.externalId
    });
    return null;
  }

  try {
    return await fetchAPI(sportKey, endpoint);
  } catch (error) {
    logger.warn('Failed to fetch play-by-play feed', {
      sport: sportKey,
      externalId: game.externalId,
      message: error.message
    });
    return null;
  }
}

function normalizePlayByPlay(sportKey, feed, game) {
  if (!feed) return [];

  const rawPlays = Array.isArray(feed)
    ? feed
    : feed.plays || feed.Plays || feed.events || feed.Events || [];

  if (!Array.isArray(rawPlays)) return [];

  return rawPlays.map((play, index) => {
    const sequence = toNumber(play.Sequence) || index + 1;
    const description = (play.Description || play.EventDescription || play.text || '').trim();
    const homeScore = toNumber(play.HomeScore ?? play.homeScore ?? play.score?.home);
    const awayScore = toNumber(play.AwayScore ?? play.awayScore ?? play.score?.away);

    return {
      externalEventId: String(play.PlayID || play.EventID || play.Id || `${game.externalId}-${sequence}`),
      sequence,
      period: play.Quarter || play.Inning || play.Period || play.period || null,
      clock: play.TimeRemaining || play.Clock || play.clock || null,
      homeScore,
      awayScore,
      description,
      metadata: {
        sport: sportKey,
        type: play.Type || play.playType || null,
        participants: play.Participants || play.players || null,
        raw: sanitizeForJson(play)
      }
    };
  }).sort((a, b) => a.sequence - b.sequence);
}

function sanitizeForJson(value) {
  if (!value || typeof value !== 'object') {
    return value ?? null;
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    return null;
  }
}

function createGameStats(game) {
  const stats = [];

  if (game.home.score !== null) {
    stats.push({
      teamExternalId: game.home.externalId,
      statType: 'team_score',
      statValue: game.home.score,
      statCategory: 'score'
    });
  }

  if (game.away.score !== null) {
    stats.push({
      teamExternalId: game.away.externalId,
      statType: 'team_score',
      statValue: game.away.score,
      statCategory: 'score'
    });
  }

  return stats;
}

async function ensureTeam(client, team) {
  const existing = await client.query(
    'SELECT id FROM teams WHERE external_id = $1',
    [team.externalId]
  );

  if (existing.rowCount > 0) {
    return existing.rows[0].id;
  }

  const result = await client.query(`
    INSERT INTO teams (
      external_id, name, abbreviation, city, sport, league, division, conference, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (external_id) DO UPDATE SET
      name = EXCLUDED.name,
      abbreviation = EXCLUDED.abbreviation,
      city = COALESCE(EXCLUDED.city, teams.city),
      sport = EXCLUDED.sport,
      league = COALESCE(EXCLUDED.league, teams.league),
      division = COALESCE(EXCLUDED.division, teams.division),
      conference = COALESCE(EXCLUDED.conference, teams.conference),
      metadata = teams.metadata || EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING id
  `, [
    team.externalId,
    team.name,
    team.abbreviation,
    team.location.city,
    team.sport,
    team.league,
    team.division || null,
    team.conference || null,
    JSON.stringify(team.metadata || {})
  ]);

  logger.debug('Team record upserted', {
    externalId: team.externalId,
    name: team.name
  });

  return result.rows[0].id;
}

function determineWinningTeamId(game, homeTeamId, awayTeamId) {
  if (game.home.score === null || game.away.score === null) return null;
  if (game.home.score > game.away.score) return homeTeamId;
  if (game.away.score > game.home.score) return awayTeamId;
  return null;
}

async function persistGamePackage(gamePackage) {
  return database.transaction(async (client) => {
    const { game, events, stats } = gamePackage;

    const homeTeamId = await ensureTeam(client, game.home);
    const awayTeamId = await ensureTeam(client, game.away);
    const winningTeamId = determineWinningTeamId(game, homeTeamId, awayTeamId);

    const metadata = {
      ...game.metadata,
      description: game.description,
      playByPlayIngestedAt: new Date().toISOString(),
      eventsIngested: events.length
    };

    const upsertResult = await client.query(`
      INSERT INTO games (
        external_id, home_team_id, away_team_id, game_date, season, week, game_type,
        status, home_score, away_score, sport, venue, weather, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (external_id) DO UPDATE SET
        home_team_id = EXCLUDED.home_team_id,
        away_team_id = EXCLUDED.away_team_id,
        game_date = EXCLUDED.game_date,
        season = EXCLUDED.season,
        week = EXCLUDED.week,
        game_type = EXCLUDED.game_type,
        status = EXCLUDED.status,
        home_score = EXCLUDED.home_score,
        away_score = EXCLUDED.away_score,
        sport = EXCLUDED.sport,
        venue = EXCLUDED.venue,
        weather = COALESCE(EXCLUDED.weather, games.weather),
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING id
    `, [
      game.externalId,
      homeTeamId,
      awayTeamId,
      game.gameDate,
      game.season,
      game.week,
      game.seasonType,
      game.status,
      game.home.score,
      game.away.score,
      game.sport,
      game.venue?.name || null,
      game.weather ? JSON.stringify(game.weather) : null,
      JSON.stringify(metadata)
    ]);

    const gameId = upsertResult.rows[0].id;

    if (stats.length > 0) {
      await client.query('DELETE FROM game_stats WHERE game_id = $1 AND stat_category = $2', [gameId, 'score']);

      const teamIdMap = new Map([
        [game.home.externalId, homeTeamId],
        [game.away.externalId, awayTeamId]
      ]);

      const params = [];
      const insertValues = [];

      stats.forEach((stat) => {
        const teamId = teamIdMap.get(stat.teamExternalId);
        if (!teamId) {
          logger.warn('Skipping stat without resolved team', {
            externalId: game.externalId,
            teamExternalId: stat.teamExternalId
          });
          return;
        }

        const baseIndex = params.length;
        params.push(
          gameId,
          teamId,
          null,
          stat.statType,
          stat.statValue,
          stat.statCategory,
          null
        );

        const placeholders = Array.from({ length: 7 }, (_, offset) => `$${baseIndex + offset + 1}`);
        insertValues.push(`(${placeholders.join(', ')})`);
      });

      if (insertValues.length > 0) {
        await client.query(`
          INSERT INTO game_stats (game_id, team_id, player_id, stat_type, stat_value, stat_category, period)
          VALUES ${insertValues.join(', ')}
        `, params);
      }
    }

    await insertGameEvents(client, gameId, events, logger, { chunkSize: 200 });

    logger.info('Game ingestion committed', {
      externalId: game.externalId,
      events: events.length,
      stats: stats.length
    });

    return { gameId, externalId: game.externalId, eventCount: events.length };
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry(task, { maxAttempts = 3, baseDelayMs = 750, identifier }) {
  let attempt = 0;
  let lastError = null;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      logger.info('Attempting transactional ingest', { identifier, attempt });
      const result = await task(attempt);
      return result;
    } catch (error) {
      lastError = error;
      logger.warn('Transactional ingest attempt failed', {
        identifier,
        attempt,
        remaining: maxAttempts - attempt,
        message: error.message
      });

      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }

  logger.error('All ingestion attempts failed', { identifier }, lastError);
  throw lastError;
}

async function buildGamePackages(sportKey, rawGames) {
  const normalizer = GAME_NORMALIZERS[sportKey];
  if (!normalizer) return [];

  const filtered = rawGames.filter((game) => {
    if (!game.Status) return false;
    return ['Final', 'Completed', 'InProgress', 'In Progress'].includes(game.Status);
  });

  const normalizedGames = filtered
    .map(normalizer)
    .filter(Boolean);

  const packages = [];
  for (const game of normalizedGames) {
    const playByPlayFeed = await fetchPlayByPlay(sportKey, game);
    const events = normalizePlayByPlay(sportKey, playByPlayFeed, game);
    const stats = createGameStats(game);
    packages.push({ game, events, stats });
  }

  return packages;
}

async function ingestLiveData() {
  logger.info('Starting live data ingestion worker');

  await database.testConnection();

  const allPackages = [];

  try {
    logger.info('Fetching NFL scoreboard');
    const nflGames = await fetchAPI('NFL', API_ENDPOINTS.NFL.games);
    allPackages.push(...await buildGamePackages('NFL', nflGames));
  } catch (error) {
    logger.warn('NFL feed unavailable', { message: error.message });
  }

  try {
    logger.info('Fetching MLB scoreboard');
    const mlbGames = await fetchAPI('MLB', API_ENDPOINTS.MLB.games);
    const recentGames = mlbGames
      .filter((game) => game.Status === 'Final' || game.Status === 'Completed')
      .slice(-50);
    allPackages.push(...await buildGamePackages('MLB', recentGames));
  } catch (error) {
    logger.warn('MLB feed unavailable', { message: error.message });
  }

  try {
    logger.info('Fetching CFB scoreboard');
    const cfbGames = await fetchAPI('CFB', API_ENDPOINTS.CFB.games);
    allPackages.push(...await buildGamePackages('CFB', cfbGames));
  } catch (error) {
    logger.warn('CFB feed unavailable', { message: error.message });
  }

  try {
    logger.info('Fetching CBB scoreboard');
    const cbbGames = await fetchAPI('CBB', API_ENDPOINTS.CBB.games);
    allPackages.push(...await buildGamePackages('CBB', cbbGames));
  } catch (error) {
    logger.warn('CBB feed unavailable', { message: error.message });
  }

  logger.info('Prepared game packages', { count: allPackages.length });

  for (const gamePackage of allPackages) {
    await withRetry(
      () => persistGamePackage(gamePackage),
      {
        identifier: gamePackage.game.externalId,
        maxAttempts: 3,
        baseDelayMs: 1000
      }
    );
  }

  logger.info('Live data ingestion completed', {
    gamesProcessed: allPackages.length
  });
}

ingestLiveData()
  .catch((error) => {
    logger.error('Fatal ingestion error', {}, error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.close();
  });

export { ingestLiveData };
