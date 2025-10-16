import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

async function getSubscriptionCopy(userId: string | null) {
  if (!userId) {
    return { statusCopy: 'Sign in to view your Diamond Pro status.', cta: 'Sign in', href: '/auth/sign-in' };
  }

  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  const isActive = subscription?.tier === 'PRO' && subscription?.status === 'ACTIVE';

  if (isActive) {
    return { statusCopy: 'You are an active Diamond Pro member.', cta: 'Manage billing', href: '/account/billing' };
  }

  return { statusCopy: 'Upgrade to unlock win probability models, push automation, and recruiting intel.', cta: 'Upgrade now', href: '/api/v1/billing/create-checkout' };
}

export default async function DiamondProPage() {
  const { userId } = auth();
  const subscriptionCopy = await getSubscriptionCopy(userId);

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      description: 'Scores, standings, and conference dashboards.',
      features: ['Live scoreboard and standings', 'Weekly power ratings', 'Program pages with baseline stats'],
      cta: { label: 'Continue free', href: '/baseball/ncaab/hub' }
    },
    {
      name: 'Diamond Pro',
      price: '$29',
      cadence: 'per month',
      description: 'Advanced analytics, recruiting signals, and custom notifications built for college staffs.',
      features: [
        'Win probability models & bullpen workload tracking',
        'Portal tracker with SMS/push automations',
        'High-definition pitch charts and spray tendencies'
      ],
      cta: { label: subscriptionCopy.cta, href: subscriptionCopy.href }
    }
  ];

  return (
    <main className="di-page">
      <section className="di-section">
        <span className="di-kicker">Diamond Insights · Pricing</span>
        <h1 className="di-page-title">Choose Your Game Plan</h1>
        <p className="di-page-subtitle">{subscriptionCopy.statusCopy}</p>
        <div className="di-card-grid">
          {tiers.map((tier) => (
            <article key={tier.name} className="di-card">
              <h2>{tier.name}</h2>
              <p className="di-text-muted">{tier.description}</p>
              <div>
                <span className="di-title">{tier.price}</span>
                {tier.cadence ? <span className="di-text-muted"> {tier.cadence}</span> : null}
              </div>
              <ul className="di-list">
                {tier.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {tier.name === 'Diamond Pro' ? (
                <form action={tier.cta.href} method="post">
                  <button className="di-action" type="submit">
                    {tier.cta.label}
                  </button>
                </form>
              ) : (
                <Link className="di-action di-action--secondary" href={tier.cta.href}>
                  {tier.cta.label}
                </Link>
              )}
            </article>
          ))}
        </div>
        <div className="di-card">
          <h2>What makes Diamond Pro different?</h2>
          <ul className="di-list">
            <li>Mobile-first visuals tuned for dugout tablets and recruiting travel.</li>
            <li>Feature gating handled server-side to protect premium data.</li>
            <li>Stripe billing with Clerk authentication keeps compliance tight.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
