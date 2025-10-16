import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SubscriptionProvider, type SubscriptionContextValue } from '@/components/subscription-context';
import { DashboardPanels } from '@/components/dashboard-panels';
import { deriveDashboardFeatureState, isProActive } from '@/lib/subscription-helpers';

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    redirect('/auth/sign-in?redirect_url=/baseball/ncaab/dashboard');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      favorites: true,
      alerts: true,
      subscription: true
    }
  });

  const tier = user?.subscription?.tier ?? 'FREE';
  const status = user?.subscription?.status ?? 'INACTIVE';
  const isPro = isProActive(tier, status);

  const featureState = deriveDashboardFeatureState(tier, status);

  const subscriptionValue: SubscriptionContextValue = {
    tier,
    status,
    isPro: featureState.showProAnalytics,
    favorites:
      user?.favorites.map((favorite) => ({
        id: favorite.id,
        teamSlug: favorite.teamSlug,
        teamName: favorite.teamName,
        conference: favorite.conference
      })) ?? [],
    alerts: {
      gameStart: user?.alerts?.gameStart ?? true,
      finalScore: user?.alerts?.finalScore ?? true,
      recruiting: user?.alerts?.recruiting ?? false,
      breakingNews: user?.alerts?.breakingNews ?? false,
      nightlyDigest: user?.alerts?.nightlyDigest ?? false
    }
  };

  const proAnalytics = featureState.showProAnalytics
    ? [
        { title: 'Win Probability Pulse', metric: '+6.4% last 7 days', delta: '↑ 1.2%' },
        { title: 'Pitch Shape Consistency', metric: '92% match vs. scouting baseline' },
        { title: 'Portal Heat Index', metric: '3 high-priority prospects on watchlist' }
      ]
    : [];

  return (
    <main className="di-page">
      <section className="di-section">
        <span className="di-kicker">Diamond Insights · Personalized Dashboard</span>
        <h1 className="di-page-title">Your College Baseball Command Center</h1>
        <p className="di-page-subtitle">
          Tailor live telemetry, recruiting signals, and alert automation around the programs that matter most to your staff.
        </p>
        <SubscriptionProvider value={subscriptionValue}>
          <DashboardPanels favorites={subscriptionValue.favorites} alerts={subscriptionValue.alerts} proAnalytics={proAnalytics} />
        </SubscriptionProvider>
      </section>
    </main>
  );
}
