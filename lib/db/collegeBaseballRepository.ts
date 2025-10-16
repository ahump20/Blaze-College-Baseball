import type { PoolClient } from 'pg';
import { query, withTransaction, getPool } from './pool';

type Nullable<T> = T | null;

export interface UpsertConferenceInput {
  slug: string;
  name: string;
  division?: string | null;
}

export interface UpsertTeamInput {
  slug: string;
  displayName: string;
  shortName?: string | null;
  nickname?: string | null;
  location?: string | null;
  conferenceSlug: string;
}

export interface UpsertGameInput {
  provider: string;
  providerGameId: string;
  sport: string;
  season: number;
  startTime: Date;
  status: string;
  venue?: string | null;
  neutralSite?: boolean;
  conferenceSlug?: string | null;
  homeTeamSlug: string;
  awayTeamSlug: string;
  homeScore?: number;
  awayScore?: number;
  inning?: number | null;
  inningHalf?: string | null;
  lastPlay?: string | null;
  boxscoreHash?: string | null;
}

export interface UpsertGameEventInput {
  gameProviderId: string;
  provider: string;
  sequenceNumber: number;
  description: string;
  eventType: string;
  inning?: number | null;
  inningHalf?: string | null;
}

export interface UpsertStandingInput {
  teamSlug: string;
  season: number;
  sport: string;
  type: string;
  conferenceSlug?: string | null;
  wins: number;
  losses: number;
  ties?: number;
  winPct?: number;
  streak?: string | null;
  lastTen?: string | null;
  provider?: string | null;
  providerId?: string | null;
}

export interface GameFilter {
  date?: string;
  conference?: string;
  status?: string;
  team?: string;
}

export interface StandingFilter {
  conference?: string;
  season?: number;
}

interface GameRow {
  id: string;
  provider: string | null;
  providerGameId: string | null;
  sport: string;
  season: number;
  startTime: Date;
  status: string;
  venue: string | null;
  neutralSite: boolean;
  conferenceSlug: string | null;
  homeTeamId: string;
  homeTeamSlug: string;
  homeDisplayName: string;
  homeShortName: string | null;
  homeNickname: string | null;
  homeLocation: string | null;
  homeScore: number | string;
  awayTeamId: string;
  awayTeamSlug: string;
  awayDisplayName: string;
  awayShortName: string | null;
  awayNickname: string | null;
  awayLocation: string | null;
  awayScore: number | string;
  inning: number | null;
  inningHalf: string | null;
  lastPlay: string | null;
}

export interface LiveGameSummary {
  id: string;
  provider: Nullable<string>;
  providerGameId: Nullable<string>;
  sport: string;
  season: number;
  startTime: string;
  status: string;
  venue: Nullable<string>;
  neutralSite: boolean;
  conferenceSlug: Nullable<string>;
  homeTeam: TeamSummary;
  awayTeam: TeamSummary;
  inning: Nullable<number>;
  inningHalf: Nullable<string>;
  lastPlay: Nullable<string>;
}

export interface TeamSummary {
  id: string;
  slug: string;
  displayName: string;
  shortName: Nullable<string>;
  nickname: Nullable<string>;
  location: Nullable<string>;
  score: number;
}

export interface StandingRow {
  teamSlug: string;
  teamName: string;
  conferenceSlug: Nullable<string>;
  conferenceName: Nullable<string>;
  wins: number;
  losses: number;
  ties: number;
  winPct: string;
  streak: Nullable<string>;
  lastTen: Nullable<string>;
  season: number;
  type: string;
}

function toTimestamp(date: Date): string {
  return date.toISOString();
}

async function resolveTeamId(client: PoolClient, slug: string): Promise<string> {
  const result = await client.query<{ id: string }>(
    'SELECT "id" FROM "Team" WHERE "sport" = $1 AND "slug" = $2',
    ['baseball', slug]
  );

  if (!result.rows.length) {
    throw new Error(`Team with slug ${slug} not found`);
  }

  return result.rows[0].id;
}

async function resolveConferenceId(client: PoolClient, slug: string | undefined | null): Promise<string | null> {
  if (!slug) {
    return null;
  }

  const result = await client.query<{ id: string }>(
    'SELECT "id" FROM "Conference" WHERE "sport" = $1 AND "slug" = $2',
    ['baseball', slug]
  );

  if (!result.rows.length) {
    return null;
  }

  return result.rows[0].id;
}

export async function upsertConference(input: UpsertConferenceInput) {
  await query(
    `INSERT INTO "Conference" ("id", "slug", "name", "division", "sport")
     VALUES (gen_random_uuid(), $1, $2, $3, 'baseball')
     ON CONFLICT ("sport", "slug") DO UPDATE
       SET "name" = EXCLUDED."name",
           "division" = EXCLUDED."division",
           "updatedAt" = CURRENT_TIMESTAMP`,
    [input.slug, input.name, input.division ?? null]
  );
}

export async function upsertTeam(input: UpsertTeamInput) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const conferenceId = await resolveConferenceId(client, input.conferenceSlug);

    await client.query(
      `INSERT INTO "Team" ("id", "slug", "displayName", "shortName", "nickname", "location", "conferenceId", "sport")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'baseball')
       ON CONFLICT ("sport", "slug") DO UPDATE
         SET "displayName" = EXCLUDED."displayName",
             "shortName" = EXCLUDED."shortName",
             "nickname" = EXCLUDED."nickname",
             "location" = EXCLUDED."location",
             "conferenceId" = $6,
             "updatedAt" = CURRENT_TIMESTAMP`,
      [
        input.slug,
        input.displayName,
        input.shortName ?? null,
        input.nickname ?? null,
        input.location ?? null,
        conferenceId
      ]
    );
  } finally {
    client.release();
  }
}

export async function upsertGame(input: UpsertGameInput) {
  return withTransaction(async (client) => {
    const conferenceId = await resolveConferenceId(client, input.conferenceSlug ?? null);
    const homeTeamId = await resolveTeamId(client, input.homeTeamSlug);
    const awayTeamId = await resolveTeamId(client, input.awayTeamSlug);

    const values = [
      input.provider,
      input.providerGameId,
      input.sport,
      input.season,
      input.startTime,
      input.status,
      input.venue ?? null,
      input.neutralSite ?? false,
      conferenceId,
      homeTeamId,
      awayTeamId,
      input.homeScore ?? 0,
      input.awayScore ?? 0,
      input.inning ?? null,
      input.inningHalf ?? null,
      input.lastPlay ?? null,
      input.boxscoreHash ?? null
    ];

    await client.query(
      `INSERT INTO "Game"
        ("id", "provider", "providerGameId", "sport", "season", "startTime", "status", "venue", "neutralSite",
         "conferenceId", "homeTeamId", "awayTeamId", "homeScore", "awayScore", "inning", "inningHalf", "lastPlay", "boxscoreHash")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       ON CONFLICT ("sport", "provider", "providerGameId") DO UPDATE
         SET "startTime" = EXCLUDED."startTime",
             "status" = EXCLUDED."status",
             "venue" = EXCLUDED."venue",
             "neutralSite" = EXCLUDED."neutralSite",
             "conferenceId" = EXCLUDED."conferenceId",
             "homeTeamId" = EXCLUDED."homeTeamId",
             "awayTeamId" = EXCLUDED."awayTeamId",
             "homeScore" = EXCLUDED."homeScore",
             "awayScore" = EXCLUDED."awayScore",
             "inning" = EXCLUDED."inning",
             "inningHalf" = EXCLUDED."inningHalf",
             "lastPlay" = EXCLUDED."lastPlay",
             "boxscoreHash" = EXCLUDED."boxscoreHash",
             "updatedAt" = CURRENT_TIMESTAMP`,
      values
    );
  });
}

export async function upsertGameEvent(input: UpsertGameEventInput) {
  await query(
    `INSERT INTO "GameEvent" ("id", "gameId", "sequenceNumber", "description", "eventType", "inning", "inningHalf")
     SELECT gen_random_uuid(), g."id", $3, $4, $5, $6, $7
     FROM "Game" g
     WHERE g."sport" = 'baseball' AND g."provider" = $1 AND g."providerGameId" = $2
     ON CONFLICT ("gameId", "sequenceNumber") DO UPDATE
       SET "description" = EXCLUDED."description",
           "eventType" = EXCLUDED."eventType",
           "inning" = EXCLUDED."inning",
           "inningHalf" = EXCLUDED."inningHalf",
           "updatedAt" = CURRENT_TIMESTAMP`,
    [
      input.provider,
      input.gameProviderId,
      input.sequenceNumber,
      input.description,
      input.eventType,
      input.inning ?? null,
      input.inningHalf ?? null
    ]
  );
}

export async function upsertStanding(input: UpsertStandingInput) {
  return withTransaction(async (client) => {
    const teamId = await resolveTeamId(client, input.teamSlug);
    const conferenceId = await resolveConferenceId(client, input.conferenceSlug ?? null);

    await client.query(
      `INSERT INTO "Standing"
        ("id", "sport", "season", "type", "teamId", "conferenceId", "wins", "losses", "ties", "winPct", "streak", "lastTen", "provider", "providerId")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT ("sport", "season", "type", "teamId") DO UPDATE
         SET "conferenceId" = EXCLUDED."conferenceId",
             "wins" = EXCLUDED."wins",
             "losses" = EXCLUDED."losses",
             "ties" = EXCLUDED."ties",
             "winPct" = EXCLUDED."winPct",
             "streak" = EXCLUDED."streak",
             "lastTen" = EXCLUDED."lastTen",
             "provider" = EXCLUDED."provider",
             "providerId" = EXCLUDED."providerId",
             "updatedAt" = CURRENT_TIMESTAMP,
             "fetchedAt" = CURRENT_TIMESTAMP`,
      [
        input.sport,
        input.season,
        input.type,
        teamId,
        conferenceId,
        input.wins,
        input.losses,
        input.ties ?? 0,
        input.winPct ?? 0,
        input.streak ?? null,
        input.lastTen ?? null,
        input.provider ?? null,
        input.providerId ?? null
      ]
    );
  });
}

export async function listGames(filters: GameFilter = {}): Promise<LiveGameSummary[]> {
  const conditions: string[] = ['g."sport" = $1'];
  const values: any[] = ['baseball'];

  if (filters.date) {
    conditions.push('DATE(g."startTime") = $' + (values.length + 1));
    values.push(filters.date);
  }

  if (filters.conference) {
    conditions.push('c."slug" = $' + (values.length + 1));
    values.push(filters.conference);
  }

  if (filters.status) {
    conditions.push('g."status" = $' + (values.length + 1));
    values.push(filters.status.toUpperCase());
  }

  if (filters.team) {
    conditions.push('(home_team."slug" = $' + (values.length + 1) + ' OR away_team."slug" = $' + (values.length + 1) + ')');
    values.push(filters.team);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query<GameRow>(
    `SELECT
        g."id",
        g."provider",
        g."providerGameId",
        g."sport",
        g."season",
        g."startTime",
        g."status",
        g."venue",
        g."neutralSite",
        c."slug" AS "conferenceSlug",
        home_team."id" AS "homeTeamId",
        home_team."slug" AS "homeTeamSlug",
        home_team."displayName" AS "homeDisplayName",
        home_team."shortName" AS "homeShortName",
        home_team."nickname" AS "homeNickname",
        home_team."location" AS "homeLocation",
        g."homeScore",
        away_team."id" AS "awayTeamId",
        away_team."slug" AS "awayTeamSlug",
        away_team."displayName" AS "awayDisplayName",
        away_team."shortName" AS "awayShortName",
        away_team."nickname" AS "awayNickname",
        away_team."location" AS "awayLocation",
        g."awayScore",
        g."inning",
        g."inningHalf",
        g."lastPlay"
     FROM "Game" g
     INNER JOIN "Team" home_team ON home_team."id" = g."homeTeamId"
     INNER JOIN "Team" away_team ON away_team."id" = g."awayTeamId"
     LEFT JOIN "Conference" c ON c."id" = g."conferenceId"
     ${whereClause}
     ORDER BY g."startTime" ASC`,
    values
  );

  return result.rows.map((row: GameRow) => ({
    id: row.id,
    provider: row.provider,
    providerGameId: row.providerGameId,
    sport: row.sport,
    season: row.season,
    startTime: toTimestamp(new Date(row.startTime)),
    status: row.status,
    venue: row.venue,
    neutralSite: row.neutralSite,
    conferenceSlug: row.conferenceSlug,
    homeTeam: {
      id: row.homeTeamId,
      slug: row.homeTeamSlug,
      displayName: row.homeDisplayName,
      shortName: row.homeShortName,
      nickname: row.homeNickname,
      location: row.homeLocation,
      score: Number(row.homeScore)
    },
    awayTeam: {
      id: row.awayTeamId,
      slug: row.awayTeamSlug,
      displayName: row.awayDisplayName,
      shortName: row.awayShortName,
      nickname: row.awayNickname,
      location: row.awayLocation,
      score: Number(row.awayScore)
    },
    inning: row.inning,
    inningHalf: row.inningHalf,
    lastPlay: row.lastPlay
  }));
}

export async function getGameBoxscore(gameId: string) {
  const result = await query(
    `SELECT
        g."id",
        g."provider",
        g."providerGameId",
        g."startTime",
        g."status",
        g."homeScore",
        g."awayScore",
        g."inning",
        g."inningHalf",
        g."lastPlay",
        g."boxscoreHash",
        home_team."displayName" AS "homeDisplayName",
        away_team."displayName" AS "awayDisplayName"
     FROM "Game" g
     INNER JOIN "Team" home_team ON home_team."id" = g."homeTeamId"
     INNER JOIN "Team" away_team ON away_team."id" = g."awayTeamId"
     WHERE g."id" = $1`,
    [gameId]
  );

  if (!result.rows.length) {
    return null;
  }

  const events = await query(
    `SELECT "sequenceNumber", "description", "eventType", "inning", "inningHalf", "createdAt"
     FROM "GameEvent"
     WHERE "gameId" = $1
     ORDER BY "sequenceNumber" ASC`,
    [gameId]
  );

  return {
    game: result.rows[0],
    events: events.rows
  };
}

export async function listStandings(filters: StandingFilter = {}): Promise<StandingRow[]> {
  const conditions: string[] = ['s."sport" = $1'];
  const values: any[] = ['baseball'];

  if (filters.conference) {
    conditions.push('c."slug" = $' + (values.length + 1));
    values.push(filters.conference);
  }

  if (filters.season) {
    conditions.push('s."season" = $' + (values.length + 1));
    values.push(filters.season);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query<StandingRow>(
    `SELECT
        t."slug" AS "teamSlug",
        t."displayName" AS "teamName",
        c."slug" AS "conferenceSlug",
        c."name" AS "conferenceName",
        s."wins",
        s."losses",
        s."ties",
        s."winPct",
        s."streak",
        s."lastTen",
        s."season",
        s."type"
     FROM "Standing" s
     INNER JOIN "Team" t ON t."id" = s."teamId"
     LEFT JOIN "Conference" c ON c."id" = s."conferenceId"
     ${whereClause}
     ORDER BY c."slug" NULLS LAST, s."winPct" DESC, s."wins" DESC`,
    values
  );

  return result.rows;
}
