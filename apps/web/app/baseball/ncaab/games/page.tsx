'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { DataStateMessage } from '../components/DataState';
import GameCard from '../components/GameCard';
import { useLiveGames } from '../components/data-hooks';
import styles from '../components/ui.module.css';

const plannerLinks = [
  { href: '/baseball/ncaab/hub', label: 'Return to Hub' },
  { href: '/baseball/ncaab/standings', label: 'Check Standings' },
  { href: '/baseball/ncaab/news', label: 'Latest Briefings' }
];

function formatTimestamp(iso?: string) {
  if (!iso) return null;
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
    }).format(date);
  } catch (error) {
    return null;
  }
}

export default function BaseballGamesPage() {
  const { data, error, isLoading, mutate } = useLiveGames();
  const games = data?.games ?? [];
  const lastUpdated = useMemo(() => formatTimestamp(data?.lastUpdated), [data?.lastUpdated]);

  return (
    <main className="di-page">
      <section className="di-section" aria-labelledby="ncaab-games-heading">
        <span className="di-kicker">Diamond Insights · Games</span>
        <h1 id="ncaab-games-heading" className="di-page-title">
          Live Games & Scoreboard
        </h1>
        <p className="di-page-subtitle">
          Track every pitch with leverage context, inning status, and quick pivots into full box scores. Data refreshes every
          45 seconds straight from the BlazeSportsIntel worker.
        </p>
        {lastUpdated && (
          <p className="di-microcopy" aria-live="polite">
            Last synced at {lastUpdated}
          </p>
        )}

        <div className={styles.grid} role="list" aria-label="NCAA Division I live games">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
          {isLoading && (
            <DataStateMessage
              state="loading"
              heading="Loading live games"
              description="Grabbing the latest situations from around the country."
            />
          )}
          {!isLoading && !error && games.length === 0 && (
            <DataStateMessage
              state="empty"
              heading="No games on the slate"
              description="Once first pitch is scheduled, live cards and leverage alerts will populate automatically."
            />
          )}
          {error && (
            <DataStateMessage
              state="error"
              heading="Scoreboard unavailable"
              description={error.message || 'We could not retrieve the live games just yet. Try again shortly.'}
              actionLabel="Retry refresh"
              onAction={() => void mutate()}
            />
          )}
        </div>

        <aside aria-label="NCAA baseball quick navigation" className={styles.grid} style={{ marginTop: '2.5rem' }}>
          <div className={styles.card} role="listitem">
            <h2 className={styles.dataStateTitle}>Quick hops</h2>
            <p className={styles.dataStateDescription}>
              Jump into complementary NCAA baseball surfaces while our models keep the scoreboard flowing.
            </p>
            <ul className="di-list">
              {plannerLinks.map((link) => (
                <li key={link.href}>
                  <Link className="di-inline-link" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
