import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const division = searchParams.get('division') || 'D1';

    const teams = await db.team.findMany({
      where: { sport: 'baseball', division },
      orderBy: [{ name: 'asc' }],
      include: { conference: true }
    });

    return NextResponse.json({ 
      success: true,
      teams, 
      total: teams.length 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
