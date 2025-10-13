import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = { sport: 'baseball' };
    
    if (status) {
      where.status = status.toUpperCase();
    }
    
    if (date) {
      const d0 = new Date(date);
      const d1 = new Date(d0);
      d1.setDate(d0.getDate() + 1);
      where.scheduledAt = { gte: d0, lt: d1 };
    }

    const games = await db.game.findMany({
      where,
      take: limit,
      orderBy: [{ scheduledAt: 'asc' }],
      include: {
        homeTeam: true,
        awayTeam: true
      }
    });

    return NextResponse.json({ 
      success: true,
      games, 
      total: games.length 
    });
  } catch (error: any) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
