const DEFAULT_LIVE_GAMES_PATH = '/v1/college-baseball/games/live';
const DEFAULT_BOX_SCORE_PATH = (gameId) => `/v1/college-baseball/games/${gameId}/boxscore`;
const DEFAULT_STANDINGS_PATH = (conference) => `/v1/college-baseball/standings/${conference}`;

const DEFAULT_STANDINGS_TTL = 55; // seconds
const DEFAULT_LIVE_GAMES_TTL = 45;
const DEFAULT_BOX_SCORE_TTL = 30;

function buildBaseUrl(env, key, fallback) {
  const value = env?.[key];
  if (!value && fallback) {
    return fallback;
  }
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function logError(message, error, context = {}) {
  console.error(
    JSON.stringify({
      level: 'error',
      message,
      context,
      error: error
        ? { message: error.message, stack: error.stack }
        : undefined,
      timestamp: new Date().toISOString(),
    })
  );
}

async function withCache(env, key, ttl, fn) {
  if (!env?.KV) {
    return fn();
  }

  try {
    const cached = await env.KV.get(key, 'json');
    if (cached) {
      return cached;
    }
  } catch (error) {
    logError('KV get failed', error, { key });
  }

  const fresh = await fn();

  try {
    await env.KV.put(key, JSON.stringify(fresh), {
      expirationTtl: ttl,
    });
  } catch (error) {
    logError('KV put failed', error, { key, ttl });
  }

  return fresh;
}

function formatPct(wins, losses) {
  const total = wins + losses;
  if (!total) return '.000';
  return (wins / total).toFixed(3).replace('0.', '.');
}

function formatDecimal(value) {
  if (value === null || value === undefined) {
    return null;
  }
  return Number.parseFloat(value).toFixed(4);
}

function normalizeTeamRecord(record = {}) {
  const { wins = 0, losses = 0 } = record;
  return { wins, losses };
}

function normalizeGameTeam(team = {}) {
  const conferenceRecordSource = team.conferenceRecord || team.conference?.record;
  const overallRecordSource = team.overallRecord || team.overall?.record || team.record;
  const conferenceRecord = conferenceRecordSource || {};
  const overallRecord = overallRecordSource || {};
  const recordParts = [];

  if (
    overallRecordSource &&
    overallRecord.wins !== undefined &&
    overallRecord.losses !== undefined
  ) {
    recordParts.push(`${overallRecord.wins}-${overallRecord.losses}`);
  }

  if (
    conferenceRecordSource &&
    conferenceRecord.wins !== undefined &&
    conferenceRecord.losses !== undefined
  ) {
    const conferenceLabel = team.conference || team.conferenceName || '';
    const conferenceRecordString = `${conferenceRecord.wins}-${conferenceRecord.losses}${
      conferenceLabel ? ` ${conferenceLabel}` : ''
    }`;
    recordParts.push(conferenceRecordString);
  }

  return {
    id: team.id || team.teamId || team.code,
    name: team.name || team.displayName || team.teamName,
    abbreviation: team.abbreviation || team.shortName || team.code,
    conference: team.conference || team.conferenceName || conferenceRecord.name || null,
    record: recordParts.length > 0 ? recordParts.join(', ') : team.recordSummary || null,
    score: team.score ?? team.runs ?? team.points ?? 0,
  };
}

function normalizeInning(inning = {}) {
  if (!inning) return null;
  const number = inning.number ?? inning.inning ?? null;
  const half = inning.half || inning.side;
  if (!number && !half) return null;
  return {
    number,
    half: half ? half.charAt(0).toUpperCase() + half.slice(1).toLowerCase() : null,
  };
}

function normalizeSituation(situation = {}) {
  if (!situation) return null;
  return {
    outs: situation.outs ?? situation.outsCount ?? null,
    runners:
      situation.runnersOn ??
      situation.runnersDescription ??
      situation.baseState ??
      null,
  };
}

function normalizePerson(person = {}) {
  if (!person || (!person.name && !person.displayName)) {
    return null;
  }
  return {
    name: person.name || person.displayName,
    number: person.number || person.jersey,
    pitches: person.pitchCount ?? person.pitches ?? null,
    era: person.era ?? person.seasonEra ?? null,
    avg: person.avg ?? person.battingAverage ?? person.average ?? null,
  };
}

function normalizeLiveGame(game) {
  return {
    id: game.id || game.gameId,
    status: game.status === 'in_progress' ? 'live' : game.status === 'final' ? 'final' : game.status,
    date: game.date || game.startDate || game.start_time?.split('T')[0] || null,
    scheduledTime: game.scheduledTime || game.startTime || game.start_time || null,
    venue: game.venue?.name || game.venue || null,
    inning: normalizeInning(game.inning || game.currentInning),
    situation: normalizeSituation(game.situation || game.baseState),
    awayTeam: normalizeGameTeam(game.awayTeam || game.away || game.teams?.away),
    homeTeam: normalizeGameTeam(game.homeTeam || game.home || game.teams?.home),
    currentPitcher: normalizePerson(
      game.currentPitcher || game.pitchers?.current || game.pitching?.current
    ),
    currentBatter: normalizePerson(
      game.currentBatter || game.batters?.current || game.batting?.current
    ),
  };
}

function normalizeLineScoreSide(side = {}) {
  return {
    innings: side.innings || side.line || side.inningRuns || [],
    runs: side.runs ?? side.score ?? 0,
    hits: side.hits ?? 0,
    errors: side.errors ?? 0,
  };
}

function normalizePlayerLine(player = {}) {
  return {
    id: player.id || player.playerId,
    name: player.name || `${player.firstName ?? ''} ${player.lastName ?? ''}`.trim(),
    position: player.position || player.pos || null,
    ab: player.ab ?? player.atBats ?? null,
    r: player.r ?? player.runs ?? null,
    h: player.h ?? player.hits ?? null,
    rbi: player.rbi ?? null,
    bb: player.bb ?? player.walks ?? null,
    k: player.k ?? player.strikeouts ?? null,
    seasonAvg: player.seasonAvg || player.avg || player.average || null,
  };
}

function normalizePitchingLine(player = {}) {
  return {
    id: player.id || player.playerId,
    name: player.name || `${player.firstName ?? ''} ${player.lastName ?? ''}`.trim(),
    ip: player.ip ?? player.inningsPitched ?? null,
    h: player.h ?? player.hits ?? null,
    r: player.r ?? player.runs ?? null,
    er: player.er ?? player.earnedRuns ?? null,
    bb: player.bb ?? player.walks ?? null,
    k: player.k ?? player.strikeouts ?? null,
    hr: player.hr ?? player.homeRuns ?? null,
    era: player.era ?? player.seasonEra ?? null,
  };
}

function normalizeBoxScore(boxScore = {}) {
  const batting = boxScore.batting || {};
  const pitching = boxScore.pitching || {};

  return {
    lineScore: {
      innings:
        boxScore.lineScore?.innings ||
        boxScore.lineScore?.inningNumbers ||
        Array.from({ length: 9 }, (_, i) => i + 1),
      away: normalizeLineScoreSide(boxScore.lineScore?.away || boxScore.away),
      home: normalizeLineScoreSide(boxScore.lineScore?.home || boxScore.home),
    },
    batting: {
      away: (batting.away || batting.visitor || []).map(normalizePlayerLine),
      home: (batting.home || batting.host || []).map(normalizePlayerLine),
    },
    pitching: {
      away: (pitching.away || pitching.visitor || []).map(normalizePitchingLine),
      home: (pitching.home || pitching.host || []).map(normalizePitchingLine),
    },
  };
}

function normalizeStandingsTeam(team = {}) {
  const confRecord = normalizeTeamRecord(team.conference || team.conferenceRecord);
  const overallRecord = normalizeTeamRecord(team.overall || team.overallRecord);
  const homeRecord = normalizeTeamRecord(team.home || team.records?.home);
  const awayRecord = normalizeTeamRecord(team.away || team.records?.away);
  const rpi = team.rpi || {};

  return {
    id: team.id || team.teamId || team.code,
    name: team.name || team.displayName,
    confWins: confRecord.wins,
    confLosses: confRecord.losses,
    confPct: team.conferencePct || formatPct(confRecord.wins, confRecord.losses),
    overallWins: overallRecord.wins,
    overallLosses: overallRecord.losses,
    overallPct: team.overallPct || formatPct(overallRecord.wins, overallRecord.losses),
    homeWins: homeRecord.wins,
    homeLosses: homeRecord.losses,
    awayWins: awayRecord.wins,
    awayLosses: awayRecord.losses,
    rpiRank: rpi.rank ?? team.rpiRank ?? null,
    rpiValue: formatDecimal(rpi.value ?? team.rpiValue ?? null),
    streak: team.streak || team.currentStreak || null,
  };
}

function normalizeStandings(response = {}, conference) {
  return {
    conference: response.conference || conference,
    teams: (response.teams || response.entries || []).map(normalizeStandingsTeam),
  };
}

async function highlightlyRequest(env, path, init = {}) {
  const baseUrl = buildBaseUrl(env, 'HIGHLIGHTLY_API_BASE_URL', 'https://api.highlightly.com');
  const apiKey = env?.HIGHLIGHTLY_API_KEY;

  const url = new URL(path, baseUrl).toString();

  const headers = new Headers(init.headers || {});
  if (apiKey) {
    headers.set('Authorization', `Bearer ${apiKey}`);
  }
  headers.set('Accept', 'application/json');

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Highlightly request failed (${response.status}): ${await response.text()}`);
  }

  return response.json();
}

async function ncaaRequest(env, path) {
  const baseUrl = buildBaseUrl(env, 'NCAA_API_BASE_URL', 'https://data.ncaa.com');
  const apiKey = env?.NCAA_API_KEY;
  const url = new URL(path, baseUrl).toString();

  const headers = new Headers({ Accept: 'application/json' });
  if (apiKey) {
    headers.set('x-api-key', apiKey);
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`NCAA request failed (${response.status}): ${await response.text()}`);
  }
  return response.json();
}

export async function getLiveGames(env) {
  return withCache(env, 'ncaa:games:live', DEFAULT_LIVE_GAMES_TTL, async () => {
    try {
      const data = await highlightlyRequest(env, DEFAULT_LIVE_GAMES_PATH);
      const games = data.games || data.data || [];
      return games.map(normalizeLiveGame);
    } catch (error) {
      logError('Failed to fetch live games', error);
      throw error;
    }
  });
}

export async function getGameBoxScore(gameId, env) {
  const cacheKey = `ncaa:boxscore:${gameId}`;
  return withCache(env, cacheKey, DEFAULT_BOX_SCORE_TTL, async () => {
    try {
      const data = await highlightlyRequest(env, DEFAULT_BOX_SCORE_PATH(gameId));
      return normalizeBoxScore(data.boxScore || data);
    } catch (error) {
      logError('Failed to fetch box score', error, { gameId });
      throw error;
    }
  });
}

export async function getConferenceStandings(conference, env) {
  const normalizedConference = conference.toUpperCase();
  const cacheKey = `ncaa:standings:${normalizedConference}`;

  return withCache(env, cacheKey, DEFAULT_STANDINGS_TTL, async () => {
    try {
      const data = await highlightlyRequest(env, DEFAULT_STANDINGS_PATH(normalizedConference));
      if (data?.teams?.length) {
        return normalizeStandings(data, normalizedConference);
      }
    } catch (error) {
      logError('Highlightly standings fetch failed, falling back to NCAA', error, {
        conference: normalizedConference,
      });
    }

    try {
      const path = `/casablanca/standings/baseball/d1/${normalizedConference.toLowerCase()}.json`;
      const data = await ncaaRequest(env, path);
      return normalizeStandings(data, normalizedConference);
    } catch (error) {
      logError('Failed to fetch standings', error, { conference: normalizedConference });
      throw error;
    }
  });
}

export default {
  getLiveGames,
  getGameBoxScore,
  getConferenceStandings,
};
