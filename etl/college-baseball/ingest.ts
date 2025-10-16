import pino from 'pino';
import { z } from 'zod';

import {
  upsertConference,
  upsertGame,
  upsertGameEvent,
  upsertStanding,
  upsertTeam,
  type UpsertGameInput,
  type UpsertStandingInput
} from '../../lib/db/collegeBaseballRepository';
import { getPool } from '../../lib/db/pool';
import { LiveGameCache, type CacheableGame } from '../../lib/cache/liveGameCache';
import { monitoringClient } from '../../observability/metrics';

const logger = pino({ name: 'college-baseball-ingest', level: process.env.LOG_LEVEL || 'info' });


const NormalizedTeam = z.object({
  slug: z.string(),
  displayName: z.string(),
  shortName: z.string().optional(),
  nickname: z.string().optional(),
  location: z.string().optional(),
  conferenceSlug: z.string()
});

type NormalizedTeam = z.infer<typeof NormalizedTeam>;

const FALLBACK_TEAMS: NormalizedTeam[] = [
  { slug: 'lsu', displayName: 'Louisiana State Tigers', shortName: 'LSU', nickname: 'Tigers', location: 'Baton Rouge, LA', conferenceSlug: 'sec' },
  { slug: 'tennessee', displayName: 'Tennessee Volunteers', shortName: 'UT', nickname: 'Volunteers', location: 'Knoxville, TN', conferenceSlug: 'sec' },
  { slug: 'arkansas', displayName: 'Arkansas Razorbacks', shortName: 'ARK', nickname: 'Razorbacks', location: 'Fayetteville, AR', conferenceSlug: 'sec' },
  { slug: 'florida', displayName: 'Florida Gators', shortName: 'UF', nickname: 'Gators', location: 'Gainesville, FL', conferenceSlug: 'sec' },
  { slug: 'vanderbilt', displayName: 'Vanderbilt Commodores', shortName: 'VU', nickname: 'Commodores', location: 'Nashville, TN', conferenceSlug: 'sec' },
  { slug: 'texas', displayName: 'Texas Longhorns', shortName: 'UT', nickname: 'Longhorns', location: 'Austin, TX', conferenceSlug: 'sec' },
  { slug: 'clemson', displayName: 'Clemson Tigers', shortName: 'CLEM', nickname: 'Tigers', location: 'Clemson, SC', conferenceSlug: 'acc' },
  { slug: 'wake-forest', displayName: 'Wake Forest Demon Deacons', shortName: 'WAKE', nickname: 'Demon Deacons', location: 'Winston-Salem, NC', conferenceSlug: 'acc' },
  { slug: 'north-carolina', displayName: 'North Carolina Tar Heels', shortName: 'UNC', nickname: 'Tar Heels', location: 'Chapel Hill, NC', conferenceSlug: 'acc' },
  { slug: 'florida-state', displayName: 'Florida State Seminoles', shortName: 'FSU', nickname: 'Seminoles', location: 'Tallahassee, FL', conferenceSlug: 'acc' },
  { slug: 'duke', displayName: 'Duke Blue Devils', shortName: 'DUKE', nickname: 'Blue Devils', location: 'Durham, NC', conferenceSlug: 'acc' },
  { slug: 'oklahoma-state', displayName: 'Oklahoma State Cowboys', shortName: 'OSU', nickname: 'Cowboys', location: 'Stillwater, OK', conferenceSlug: 'big-12' },
  { slug: 'texas-tech', displayName: 'Texas Tech Red Raiders', shortName: 'TTU', nickname: 'Red Raiders', location: 'Lubbock, TX', conferenceSlug: 'big-12' },
  { slug: 'tcu', displayName: 'TCU Horned Frogs', shortName: 'TCU', nickname: 'Horned Frogs', location: 'Fort Worth, TX', conferenceSlug: 'big-12' },
  { slug: 'west-virginia', displayName: 'West Virginia Mountaineers', shortName: 'WVU', nickname: 'Mountaineers', location: 'Morgantown, WV', conferenceSlug: 'big-12' },
  { slug: 'stanford', displayName: 'Stanford Cardinal', shortName: 'STAN', nickname: 'Cardinal', location: 'Stanford, CA', conferenceSlug: 'pac-12' },
  { slug: 'oregon-state', displayName: 'Oregon State Beavers', shortName: 'OSU', nickname: 'Beavers', location: 'Corvallis, OR', conferenceSlug: 'pac-12' },
  { slug: 'arizona', displayName: 'Arizona Wildcats', shortName: 'ARIZ', nickname: 'Wildcats', location: 'Tucson, AZ', conferenceSlug: 'pac-12' },
  { slug: 'ucla', displayName: 'UCLA Bruins', shortName: 'UCLA', nickname: 'Bruins', location: 'Los Angeles, CA', conferenceSlug: 'pac-12' },
  { slug: 'southern-miss', displayName: 'Southern Miss Golden Eagles', shortName: 'USM', nickname: 'Golden Eagles', location: 'Hattiesburg, MS', conferenceSlug: 'sun-belt' },
  { slug: 'coastal-carolina', displayName: 'Coastal Carolina Chanticleers', shortName: 'CCU', nickname: 'Chanticleers', location: 'Conway, SC', conferenceSlug: 'sun-belt' },
  { slug: 'troy', displayName: 'Troy Trojans', shortName: 'TROY', nickname: 'Trojans', location: 'Troy, AL', conferenceSlug: 'sun-belt' }
];

const NormalizedGame = z.object({
  provider: z.string(),
  providerGameId: z.string(),
  sport: z.string().default('baseball'),
  season: z.number(),
  startTime: z.string().transform((value) => new Date(value)),
  status: z.string(),
  venue: z.string().optional(),
  neutralSite: z.boolean().optional(),
  conferenceSlug: z.string().optional(),
  homeTeam: NormalizedTeam,
  awayTeam: NormalizedTeam,
  homeScore: z.number().int().nonnegative().default(0),
  awayScore: z.number().int().nonnegative().default(0),
  inning: z.number().optional(),
  inningHalf: z.string().optional(),
  lastPlay: z.string().optional(),
  events: z
    .array(
      z.object({
        sequenceNumber: z.number().int().nonnegative(),
        description: z.string(),
        eventType: z.string(),
        inning: z.number().optional(),
        inningHalf: z.string().optional()
      })
    )
    .optional()
});

type NormalizedGame = z.infer<typeof NormalizedGame>;

const NormalizedStanding = z.object({
  team: NormalizedTeam.pick({ slug: true, conferenceSlug: true }),
  season: z.number(),
  sport: z.string().default('baseball'),
  type: z.string().default('CONFERENCE'),
  wins: z.number().int().nonnegative(),
  losses: z.number().int().nonnegative(),
  ties: z.number().int().nonnegative().optional(),
  winPct: z.number().optional(),
  streak: z.string().optional(),
  lastTen: z.string().optional(),
  provider: z.string().optional(),
  providerId: z.string().optional()
});

type NormalizedStanding = z.infer<typeof NormalizedStanding>;

interface ProviderResult {
  schedule: NormalizedGame[];
  liveGames: NormalizedGame[];
  standings: NormalizedStanding[];
}

interface DataProvider {
  name: string;
  fetchData(date: string): Promise<ProviderResult>;
}

class HighlightlyProvider implements DataProvider {
  name = 'highlightly';

  async fetchData(date: string): Promise<ProviderResult> {
    const baseUrl = process.env.HIGHLIGHTLY_API_BASE_URL;

    if (!baseUrl) {
      return this.fallback(date);
    }

    try {
      const [scheduleResp, liveResp, standingsResp] = await Promise.all([
        this.fetchJson(`${baseUrl}/schedule?date=${date}`),
        this.fetchJson(`${baseUrl}/live?date=${date}`),
        this.fetchJson(`${baseUrl}/standings`)
      ]);

      return {
        schedule: scheduleResp.games.map((game: unknown) => NormalizedGame.parse(game)),
        liveGames: liveResp.games.map((game: unknown) => NormalizedGame.parse(game)),
        standings: standingsResp.records.map((standing: unknown) => NormalizedStanding.parse(standing))
      };
    } catch (error) {
      logger.warn({ err: error }, 'Highlightly fetch failed, using fallback data');
      return this.fallback(date);
    }
  }

  private async fetchJson(url: string) {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.DATA_PROVIDER_API_KEY ? `Bearer ${process.env.DATA_PROVIDER_API_KEY}` : ''
      }
    });

    if (!response.ok) {
      throw new Error(`Request to ${url} failed with status ${response.status}`);
    }

    return response.json();
  }

  private async fallback(date: string): Promise<ProviderResult> {
    const season = this.determineSeason(date);

    const normalizedStandings = FALLBACK_TEAMS.map((team) =>
      NormalizedStanding.parse({
        team: { slug: team.slug, conferenceSlug: team.conferenceSlug },
        season,
        sport: 'baseball',
        type: 'CONFERENCE',
        wins: 0,
        losses: 0,
        ties: 0,
        winPct: 0,
        streak: 'W0',
        lastTen: '0-0',
        provider: 'fallback',
        providerId: team.slug
      })
    );

    const sampleGames = [
      {
        provider: 'fallback',
        providerGameId: `fallback-${date}-001`,
        sport: 'baseball',
        season,
        startTime: `${date}T18:00:00Z`,
        status: 'LIVE',
        venue: 'Alex Box Stadium',
        neutralSite: false,
        conferenceSlug: 'sec',
        homeTeam: this.getTeam('lsu'),
        awayTeam: this.getTeam('tennessee'),
        homeScore: 4,
        awayScore: 3,
        inning: 6,
        inningHalf: 'BOTTOM',
        lastPlay: 'Thompson singled to left, Crews scored.',
        events: [
          { sequenceNumber: 1, description: 'Crews doubled to left center.', eventType: 'hit', inning: 1, inningHalf: 'BOTTOM' },
          { sequenceNumber: 2, description: 'White homered to left, Crews scored.', eventType: 'home_run', inning: 1, inningHalf: 'BOTTOM' }
        ]
      },
      {
        provider: 'fallback',
        providerGameId: `fallback-${date}-002`,
        sport: 'baseball',
        season,
        startTime: `${date}T23:00:00Z`,
        status: 'SCHEDULED',
        venue: 'Hawkins Field',
        neutralSite: false,
        conferenceSlug: 'sec',
        homeTeam: this.getTeam('vanderbilt'),
        awayTeam: this.getTeam('florida'),
        homeScore: 0,
        awayScore: 0
      }
    ].map((game) => NormalizedGame.parse(game));

    return {
      schedule: sampleGames,
      liveGames: sampleGames.filter((game) => game.status === 'LIVE'),
      standings: normalizedStandings
    };
  }

  private determineSeason(date: string): number {
    const parsed = new Date(date);
    const year = parsed.getUTCFullYear();
    return parsed.getUTCMonth() >= 6 ? year + 1 : year;
  }

  private getTeam(slug: string): NormalizedTeam {
    const team = FALLBACK_TEAMS.find((item) => item.slug === slug);
    if (!team) {
      throw new Error(`Fallback team ${slug} not configured`);
    }
    return team;
  }
}

function selectProvider(): DataProvider {
  const providerName = (process.env.DATA_PROVIDER ?? 'highlightly').toLowerCase();

  switch (providerName) {
    case 'highlightly':
    case 'd1':
    case 'd1baseball':
      return new HighlightlyProvider();
    case 'ncaa':
      return new HighlightlyProvider();
    default:
      logger.warn({ providerName }, 'Unknown provider configured, falling back to Highlightly');
      return new HighlightlyProvider();
  }
}

function normalizeStatus(status: string): string {
  const normalized = status.toUpperCase();
  if (['LIVE', 'FINAL', 'SCHEDULED', 'POSTPONED', 'CANCELLED'].includes(normalized)) {
    return normalized;
  }
  return 'SCHEDULED';
}

function toGameInput(game: NormalizedGame): UpsertGameInput {
  return {
    provider: game.provider,
    providerGameId: game.providerGameId,
    sport: game.sport,
    season: game.season,
    startTime: game.startTime,
    status: normalizeStatus(game.status),
    venue: game.venue,
    neutralSite: game.neutralSite ?? false,
    conferenceSlug: game.conferenceSlug ?? game.homeTeam.conferenceSlug,
    homeTeamSlug: game.homeTeam.slug,
    awayTeamSlug: game.awayTeam.slug,
    homeScore: game.homeScore,
    awayScore: game.awayScore,
    inning: game.inning,
    inningHalf: game.inningHalf,
    lastPlay: game.lastPlay,
    boxscoreHash: game.events ? JSON.stringify(game.events).slice(0, 256) : undefined
  };
}

function toStandingInput(standing: NormalizedStanding): UpsertStandingInput {
  return {
    teamSlug: standing.team.slug,
    season: standing.season,
    sport: standing.sport,
    type: standing.type,
    conferenceSlug: standing.team.conferenceSlug,
    wins: standing.wins,
    losses: standing.losses,
    ties: standing.ties ?? 0,
    winPct: standing.winPct,
    streak: standing.streak,
    lastTen: standing.lastTen,
    provider: standing.provider,
    providerId: standing.providerId
  };
}

async function hydrateTeams(games: NormalizedGame[], standings: NormalizedStanding[]) {
  const teams = new Map<string, NormalizedTeam>();

  for (const standing of standings) {
    teams.set(standing.team.slug, {
      slug: standing.team.slug,
      displayName: standing.team.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      conferenceSlug: standing.team.conferenceSlug
    } as NormalizedTeam);
  }

  for (const game of games) {
    teams.set(game.homeTeam.slug, game.homeTeam);
    teams.set(game.awayTeam.slug, game.awayTeam);
  }

  for (const team of teams.values()) {
    await upsertConference({
      slug: team.conferenceSlug,
      name: team.conferenceSlug.toUpperCase().replace(/-/g, ' ')
    });

    await upsertTeam({
      slug: team.slug,
      displayName: team.displayName ?? team.slug,
      shortName: team.shortName,
      nickname: team.nickname,
      location: team.location,
      conferenceSlug: team.conferenceSlug
    });
  }
}

async function ingestGames(games: NormalizedGame[], cache: LiveGameCache) {
  const cacheKey = 'college-baseball:games:live';
  const cacheableGames: CacheableGame[] = games.map((game) => ({
    id: `${game.provider}:${game.providerGameId}`,
    status: normalizeStatus(game.status),
    startTime: game.startTime.toISOString(),
    homeTeam: { slug: game.homeTeam.slug, score: game.homeScore },
    awayTeam: { slug: game.awayTeam.slug, score: game.awayScore },
    updatedAt: new Date().toISOString()
  }));

  const invalidated = await cache.invalidateIfScoreChanged(cacheKey, cacheableGames);

  for (const game of games) {
    const gameInput = toGameInput(game);
    await upsertGame(gameInput);

    if (game.events) {
      for (const event of game.events) {
        await upsertGameEvent({
          provider: game.provider,
          gameProviderId: game.providerGameId,
          sequenceNumber: event.sequenceNumber,
          description: event.description,
          eventType: event.eventType,
          inning: event.inning,
          inningHalf: event.inningHalf
        });
      }
    }
  }

  if (invalidated || !(await cache.read(cacheKey))) {
    await cache.write(cacheKey, cacheableGames, DEFAULT_LIVE_TTL);
  }
}

async function ingestStandings(standings: NormalizedStanding[]) {
  for (const standing of standings) {
    await upsertStanding(toStandingInput(standing));
  }
}

const DEFAULT_LIVE_TTL = 60;

export async function runIngestion(date = new Date().toISOString().split('T')[0]) {
  const provider = selectProvider();
  const startedAt = Date.now();

  logger.info({ provider: provider.name, date }, 'starting ingestion run');

  const { schedule, liveGames, standings } = await provider.fetchData(date);

  await hydrateTeams([...schedule, ...liveGames], standings);

  const cache = new LiveGameCache();
  await ingestGames([...schedule, ...liveGames], cache);
  await ingestStandings(standings);

  const durationMs = Date.now() - startedAt;

  await monitoringClient.emitMetric({
    name: 'ingest.duration_ms',
    value: durationMs,
    tags: { provider: provider.name }
  });

  await monitoringClient.emitMetric({
    name: 'ingest.games.count',
    value: schedule.length + liveGames.length,
    tags: { provider: provider.name }
  });

  await monitoringClient.emitMetric({
    name: 'ingest.standings.count',
    value: standings.length,
    tags: { provider: provider.name }
  });

  monitoringClient.log({
    message: 'ingestion run complete',
    context: {
      provider: provider.name,
      durationMs,
      games: schedule.length + liveGames.length,
      standings: standings.length
    }
  });
}

if (require.main === module) {
  const pool = getPool();
  runIngestion()
    .catch((error) => {
      logger.error({ err: error }, 'ingestion failed');
      monitoringClient.log({ message: 'ingestion failed', level: 'error', context: { error: error.message } });
      process.exitCode = 1;
    })
    .finally(async () => {
      await pool.end();
    });
}
