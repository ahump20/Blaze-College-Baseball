import type { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { createCacheKey, getCachedOrHydrate } from '@/lib/cache';
import { getPrismaClient } from '@/lib/db';

const ONE_MINUTE = 60;
const DEFAULT_SPORT = 'baseball';
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 50;

type RankingRecord = Prisma.RankingGetPayload<{
  include: {
    team: {
      include: {
        conference: true;
      };
    };
  };
}>;

type RankingsResponse = {
  data: ReturnType<typeof mapRanking>[];
  meta: {
    count: number;
    poll: string;
    week?: number;
    season?: number;
    sport: string;
  };
};

function mapRanking(ranking: RankingRecord) {
  return {
    id: ranking.id,
    poll: ranking.poll,
    week: ranking.week,
    season: ranking.season,
    rank: ranking.rank,
    points: ranking.points ?? null,
    team: {
      id: ranking.team.id,
      name: ranking.team.name,
      slug: ranking.team.slug,
      sport: ranking.team.sport,
      record: ranking.team.record ?? null,
      conference: ranking.team.conference
        ? {
            id: ranking.team.conference.id,
            name: ranking.team.conference.name,
            slug: ranking.team.conference.slug,
          }
        : null,
    },
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const poll = searchParams.get('poll');
  const sport = searchParams.get('sport') ?? DEFAULT_SPORT;
  const weekParam = searchParams.get('week');
  const seasonParam = searchParams.get('season');
  const limitParam = Number.parseInt(searchParams.get('limit') ?? `${DEFAULT_LIMIT}`, 10);
  const limit = Number.isNaN(limitParam)
    ? DEFAULT_LIMIT
    : Math.min(Math.max(limitParam, 1), MAX_LIMIT);

  if (!poll) {
    return NextResponse.json(
      { error: 'Missing required "poll" query parameter.' },
      { status: 400 },
    );
  }

  const week = weekParam ? Number.parseInt(weekParam, 10) : undefined;
  if (weekParam && Number.isNaN(week)) {
    return NextResponse.json(
      { error: 'Invalid "week" query parameter (expected integer).' },
      { status: 400 },
    );
  }

  const season = seasonParam ? Number.parseInt(seasonParam, 10) : undefined;
  if (seasonParam && Number.isNaN(season)) {
    return NextResponse.json(
      { error: 'Invalid "season" query parameter (expected integer).' },
      { status: 400 },
    );
  }

  try {
    const prisma = getPrismaClient();
    const cacheKey = createCacheKey('api:rankings', {
      poll,
      week,
      season,
      sport,
      limit,
    });

    const rankings = await getCachedOrHydrate(cacheKey, ONE_MINUTE, async () =>
      prisma.ranking.findMany({
        where: {
          poll,
          sport,
          ...(week !== undefined ? { week } : {}),
          ...(season !== undefined ? { season } : {}),
        },
        include: {
          team: {
            include: {
              conference: true,
            },
          },
        },
        orderBy: {
          rank: 'asc',
        },
        take: limit,
      }),
    );

    const payload: RankingsResponse = {
      data: rankings.map(mapRanking),
      meta: {
        count: rankings.length,
        poll,
        week,
        season,
        sport,
      },
    };

    return NextResponse.json(payload, {
      headers: {
        'cache-control': `public, max-age=${ONE_MINUTE}`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load rankings. Please retry shortly.' },
      { status: 500 },
    );
  }
}

export type { RankingsResponse };
