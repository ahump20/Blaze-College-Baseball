import type { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { createCacheKey, getCachedOrHydrate } from '@/lib/cache';
import { getPrismaClient } from '@/lib/db';

const ONE_MINUTE = 60;
const DEFAULT_SPORT = 'baseball';
const MAX_LIMIT = 100;

type TeamWithConference = Prisma.TeamGetPayload<{
  include: {
    conference: true;
  };
}>;

type TeamSummary = ReturnType<typeof mapTeam>;

type TeamsResponse = {
  data: TeamSummary[];
  meta: {
    count: number;
    sport: string;
    conference?: string | null;
  };
};

function mapTeam(team: TeamWithConference) {
  return {
    id: team.id,
    name: team.name,
    slug: team.slug,
    sport: team.sport,
    record: team.record ?? null,
    logoUrl: team.logoUrl ?? null,
    conference: team.conference
      ? {
          id: team.conference.id,
          name: team.conference.name,
          slug: team.conference.slug,
        }
      : null,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sport = searchParams.get('sport') ?? DEFAULT_SPORT;
  const conferenceSlug = searchParams.get('conference');
  const limitParam = Number.parseInt(searchParams.get('limit') ?? '50', 10);
  const limit = Number.isNaN(limitParam)
    ? 50
    : Math.min(Math.max(limitParam, 1), MAX_LIMIT);

  try {
    const prisma = getPrismaClient();
    const cacheKey = createCacheKey('api:teams', {
      sport,
      conference: conferenceSlug,
      limit,
    });

    const teams = await getCachedOrHydrate(cacheKey, ONE_MINUTE, async () =>
      prisma.team.findMany({
        where: {
          sport,
          ...(conferenceSlug
            ? {
                conference: {
                  slug: conferenceSlug,
                },
              }
            : {}),
        },
        take: limit,
        include: {
          conference: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
    );

    const payload: TeamsResponse = {
      data: teams.map(mapTeam),
      meta: {
        count: teams.length,
        sport,
        conference: conferenceSlug,
      },
    };

    return NextResponse.json(payload, {
      headers: {
        'cache-control': `public, max-age=${ONE_MINUTE}`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load teams. Please retry shortly.' },
      { status: 500 },
    );
  }
}

export type { TeamsResponse };
