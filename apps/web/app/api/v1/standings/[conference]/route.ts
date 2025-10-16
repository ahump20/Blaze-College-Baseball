import { NextResponse } from 'next/server';
import { getStandings } from '../../../../baseball/ncaab/lib/mock-data';

export const revalidate = 0;

interface RouteContext {
  params: Promise<{ conference: string }>;
}

export async function GET(_req: Request, context: RouteContext) {
  const { conference } = await context.params;
  const payload = getStandings(conference);

  if (!payload) {
    return NextResponse.json(
      { error: `Conference ${conference} not found` },
      {
        status: 404,
        headers: {
          'cache-control': 'no-store'
        }
      }
    );
  }

  return NextResponse.json(payload, {
    headers: {
      'cache-control': 'no-store'
    }
  });
}
