import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildDefaultAlerts } from '@/lib/users';

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      favorites: true,
      alerts: true,
      subscription: true
    }
  });

  if (!user) {
    return NextResponse.json({
      user: null,
      subscription: { tier: 'FREE', status: 'INACTIVE', isPro: false },
      favorites: [],
      alerts: buildDefaultAlerts()
    });
  }

  const subscription = user.subscription ?? { tier: 'FREE', status: 'INACTIVE' };
  const isPro = subscription.tier === 'PRO' && subscription.status === 'ACTIVE';

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      profile: user.profile
    },
    subscription: {
      tier: subscription.tier,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      isPro
    },
    favorites: user.favorites,
    alerts: user.alerts ?? buildDefaultAlerts()
  });
}
