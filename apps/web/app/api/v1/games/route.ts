import { NextResponse } from 'next/server';
import { buildGamesResponse } from '../../../baseball/ncaab/lib/mock-data';

export const revalidate = 0;

export async function GET() {
  const payload = buildGamesResponse();
  return NextResponse.json(payload, {
    headers: {
      'cache-control': 'no-store'
    }
  });
}
