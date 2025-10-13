import type { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { createCacheKey, getCachedOrHydrate } from '@/lib/cache';
import { getPrismaClient } from '@/lib/db';

const ONE_MINUTE = 60;
const DEFAULT_SPORT = 'baseball';
const MAX_LIMIT = 100;

type PlayerRecord = Prisma.PlayerGetPayload<{
  include: {
    team: {
      include: {
        conference: true;
      };
    };
  };
}>;

type PlayerSummary = ReturnType<typeof mapPlayer>;

type PlayersResponse = {
  data: PlayerSummary[];
  meta: {
    count: number;
    sport: string;
    teamId: string;
  };
};

function mapPlayer(player: PlayerRecord) {
  return {
    id: player.id,
    firstName: player.firstName,
    lastName: player.lastName,
    number: player.number ?? null,
    position: player.position,
    classYear: player.classYear ?? null,
    team: {
      id: player.team.id,
      name: player.team.name,
      slug: player.team.slug,
      conference: player.team.conference
        ? {
            id: player.team.conference.id,
            name: player.team.conference.name,
            slug: player.team.conference.slug,
          }
        : null,
    },
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const teamId = searchParams.get('teamId');
  const sport = searchParams.get('sport') ?? DEFAULT_SPORT;
  const limitParam = Number.parseInt(searchParams.get('limit') ?? '50', 10);
  const limit = Number.isNaN(limitParam)
    ? 50
    : Math.min(Math.max(limitParam, 1), MAX_LIMIT);

  if (!teamId) {
    return NextResponse.json(
      { error: 'Missing required "teamId" query parameter.' },
      { status: 400 },
    );
  }

  try {
    const prisma = getPrismaClient();
    const cacheKey = createCacheKey('api:players', {
      teamId,
      sport,
      limit,
    });

    const players = await getCachedOrHydrate(cacheKey, ONE_MINUTE, async () =>
      prisma.player.findMany({
        where: {
          teamId,
          sport,
        },
        take: limit,
        include: {
          team: {
            include: {
              conference: true,
            },
          },
        },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      }),
    );

    const payload: PlayersResponse = {
      data: players.map(mapPlayer),
      meta: {
        count: players.length,
        sport,
        teamId,
      },
    };

    return NextResponse.json(payload, {
      headers: {
        'cache-control': `public, max-age=${ONE_MINUTE}`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load players. Please retry shortly.' },
      { status: 500 },
    );
  }
}

export type { PlayersResponse };
