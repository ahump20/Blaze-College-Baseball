import type { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { createCacheKey, getCachedOrHydrate } from '@/lib/cache';
import { getPrismaClient } from '@/lib/db';

const ONE_MINUTE = 60;
const DEFAULT_SPORT = 'baseball';

type ConferenceRecord = Prisma.ConferenceGetPayload<{}>;

type ConferencesResponse = {
  data: ReturnType<typeof mapConference>[];
  meta: {
    count: number;
    sport: string;
  };
};

function mapConference(conference: ConferenceRecord) {
  return {
    id: conference.id,
    name: conference.name,
    slug: conference.slug,
    sport: conference.sport,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sport = searchParams.get('sport') ?? DEFAULT_SPORT;

  try {
    const prisma = getPrismaClient();
    const cacheKey = createCacheKey('api:conferences', { sport });

    const conferences = await getCachedOrHydrate(cacheKey, ONE_MINUTE, async () =>
      prisma.conference.findMany({
        where: { sport },
        orderBy: {
          name: 'asc',
        },
      }),
    );

    const payload: ConferencesResponse = {
      data: conferences.map(mapConference),
      meta: {
        count: conferences.length,
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
      { error: 'Failed to load conferences. Please retry shortly.' },
      { status: 500 },
    );
  }
}

export type { ConferencesResponse };
