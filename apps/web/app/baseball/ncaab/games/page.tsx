'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { CardGrid } from '../components/Card';
import { GameCard } from '../components/GameCard';
import { PageState } from '../components/PageState';
import { useBreakpoint } from '../hooks/useBreakpoint';
import type { GameSummary, GamesResponse } from '../lib/mock-data';
import styles from './games.module.css';

const fetcher = async (url: string): Promise<GamesResponse> => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Unable to load games');
  }
  return res.json();
};

const statusOrder: Record<GameSummary['status'], number> = {
  'in-progress': 0,
  scheduled: 1,
  final: 2
};

function sortGames(games: GameSummary[]): GameSummary[] {
  return [...games].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
}

function formatUpdated(value?: string) {
  if (!value) return '';
  try {
    const ts = new Date(value);
    return ts.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return '';
  }
}

export default function BaseballGamesPage() {
  const isMobile = useBreakpoint('sm');
  const { data, error, isLoading, mutate } = useSWR<GamesResponse>('/api/v1/games', fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  });

  const games = useMemo(() => (data ? sortGames(data.games) : []), [data]);
  const updated = formatUpdated(data?.meta?.lastUpdated);

  return (
    <main className={`di-page ${styles.page}`}>
      <section className="di-section">
        <span className="di-kicker">Diamond Insights · Games</span>
        <div className={styles.headerRow}>
          <h1 className="di-page-title">Live Games &amp; Scoreboard</h1>
          <button
            type="button"
            className={styles.refreshButton}
            onClick={() => mutate()}
            aria-label="Refresh live games"
          >
            Refresh
          </button>
        </div>
        <p className="di-page-subtitle">
          Live NCAA Division I baseball from the worker feed with 30-second refresh, leverage alerts, and box score entry
          points tuned for mobile command.
        </p>
        <div className={styles.metaBar}>
          {updated ? (
            <span aria-live="polite">Last updated {updated}</span>
          ) : (
            <span aria-live="polite">Awaiting first update</span>
          )}
          <span>Auto refresh · 30s cadence</span>
        </div>

        {isLoading && games.length === 0 ? (
          <PageState
            state="loading"
            isMobile={isMobile}
            title="Loading live games"
            description="Dialing the worker feed for leverage moments."
          />
        ) : null}

        {error ? (
          <PageState
            state="error"
            isMobile={isMobile}
            title="Unable to load games"
            role="alert"
            description={error instanceof Error ? error.message : 'Something went wrong contacting the feed.'}
          />
        ) : null}

        {!isLoading && !error && games.length === 0 ? (
          <PageState
            state="empty"
            isMobile={isMobile}
            title="No live games right now"
            description={
              <>
                <span>Check back closer to first pitch or explore the latest standings below.</span>
                <Link className={styles.statusLink} href="/baseball/ncaab/standings">
                  View standings
                </Link>
              </>
            }
          />
        ) : null}

        {games.length > 0 ? (
          <CardGrid aria-live="polite" aria-busy={isLoading ? 'true' : 'false'}>
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </CardGrid>
        ) : null}
      </section>
    </main>
  );
}

