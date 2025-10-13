import type { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { createCacheKey, getCachedOrHydrate } from '@/lib/cache';
import { getPrismaClient } from '@/lib/db';

const ONE_MINUTE = 60;

const DEFAULT_SPORT = 'baseball';

type GameWithRelations = Prisma.GameGetPayload<{
  include: {
    homeTeam: true;
    awayTeam: true;
    conference: true;
  };
}>;

type GameSummary = ReturnType<typeof mapGame>;

type GamesResponse = {
  data: GameSummary[];
  meta: {
    count: number;
    date: string;
    sport: string;
    conference?: string | null;
  };
};

function mapTeam(team: GameWithRelations['homeTeam']) {
  return {
    id: team.id,
    name: team.name,
    slug: team.slug,
    record: team.record ?? null,
    logoUrl: team.logoUrl ?? null,
  };
}

function mapGame(game: GameWithRelations) {
  return {
    id: game.id,
    sport: game.sport,
    status: game.status,
    startsAt: game.startsAt.toISOString(),
    venue: game.venue ?? null,
    conference: game.conference
      ? {
          id: game.conference.id,
          name: game.conference.name,
          slug: game.conference.slug,
        }
      : null,
    homeTeam: mapTeam(game.homeTeam),
    awayTeam: mapTeam(game.awayTeam),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const dateParam = searchParams.get('date');
  const sport = searchParams.get('sport') ?? DEFAULT_SPORT;
  const conferenceSlug = searchParams.get('conference');

  if (!dateParam) {
    return NextResponse.json(
      { error: 'Missing required "date" query parameter (expected YYYY-MM-DD).' },
      { status: 400 },
    );
  }

  const parsedDate = new Date(`${dateParam}T00:00:00Z`);
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json(
      { error: 'Invalid "date" query parameter (expected YYYY-MM-DD).' },
      { status: 400 },
    );
  }

  const dayStart = parsedDate;
  const dayEnd = new Date(dayStart.getTime() + 86_400_000);

  try {
    const prisma = getPrismaClient();
    const cacheKey = createCacheKey('api:games', {
      date: dateParam,
      sport,
      conference: conferenceSlug,
    });

    const games = await getCachedOrHydrate(cacheKey, ONE_MINUTE, async () =>
      prisma.game.findMany({
        where: {
          sport,
          startsAt: {
            gte: dayStart,
            lt: dayEnd,
          },
          ...(conferenceSlug
            ? {
                conference: {
                  slug: conferenceSlug,
                },
              }
            : {}),
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          conference: true,
        },
        orderBy: {
          startsAt: 'asc',
        },
      }),
    );

    const payload: GamesResponse = {
      data: games.map(mapGame),
      meta: {
        count: games.length,
        date: dateParam,
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
      { error: 'Failed to load games. Please retry shortly.' },
      { status: 500 },
    );
  }
}

export type { GamesResponse };
