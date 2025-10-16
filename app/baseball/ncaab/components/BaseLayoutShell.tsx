'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode
} from 'react';
import type { ConferenceCode } from '@/styles/theme';

const NAVIGATION_HEIGHT = 72;

const CONFERENCE_OPTIONS: { label: string; value: ConferenceCode }[] = [
  { label: 'All D-I', value: 'all' },
  { label: 'SEC', value: 'sec' },
  { label: 'ACC', value: 'acc' },
  { label: 'Big 12', value: 'big12' },
  { label: 'Pac-12', value: 'pac12' },
  { label: 'Big Ten', value: 'big10' }
];

type BaseballLayoutState = {
  conference: ConferenceCode;
  setConference: (conference: ConferenceCode) => void;
  selectedGameId: string | null;
  setSelectedGameId: (gameId: string | null) => void;
};

const BaseballLayoutContext = createContext<BaseballLayoutState | undefined>(undefined);

export const useBaseballLayout = () => {
  const context = useContext(BaseballLayoutContext);
  if (!context) {
    throw new Error('useBaseballLayout must be used within the BaseballLayoutShell');
  }
  return context;
};

export function BaseballLayoutShell({ children }: { children: ReactNode }) {
  const [conference, setConference] = useState<ConferenceCode>('all');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const providerValue = useMemo(
    () => ({ conference, setConference, selectedGameId, setSelectedGameId }),
    [conference, selectedGameId]
  );

  const handleNavigate = (target: 'scoreboard' | 'box' | 'standings') => {
    if (target === 'scoreboard') {
      router.push('/baseball/ncaab');
      return;
    }

    if (target === 'standings') {
      router.push('/baseball/ncaab/standings');
      return;
    }

    if (target === 'box') {
      const fallback = '/baseball/ncaab/box-score';
      router.push(selectedGameId ? `/baseball/ncaab/box-score/${selectedGameId}` : fallback);
    }
  };

  const isActive = (key: 'scoreboard' | 'box' | 'standings') => {
    if (key === 'scoreboard') {
      return pathname === '/baseball/ncaab' || pathname === '/baseball/ncaab/';
    }
    if (key === 'box') {
      return pathname?.startsWith('/baseball/ncaab/box-score');
    }
    return pathname?.startsWith('/baseball/ncaab/standings');
  };

  return (
    <BaseballLayoutContext.Provider value={providerValue}>
      <div className="relative min-h-screen bg-background text-text">
        <div
          className="mx-auto flex min-h-screen w-full max-w-5xl flex-col pb-[--bottom-nav-height]"
          style={{ '--bottom-nav-height': `${NAVIGATION_HEIGHT}px` } as CSSProperties}
        >
          <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">BlazeSportsIntel</p>
                <h1 className="mt-1 font-serif text-2xl text-text">College Baseball Live</h1>
              </div>
              <Link
                href="/college-baseball.html"
                className="hidden rounded-full border border-border px-4 py-2 text-xs font-medium text-text-muted transition hover:border-accent hover:text-accent sm:inline-flex"
              >
                Why Blaze?
              </Link>
            </div>
            <div className="px-4 pb-4">
              <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-surface/80 p-4 shadow-card backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-text-muted">Filter by conference to tighten the live feed and standings context.</p>
                </div>
                <label className="flex items-center gap-2 text-sm text-text-muted">
                  <span className="font-medium text-text">Conference</span>
                  <select
                    className="rounded-full border border-border bg-surface-muted px-3 py-2 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                    value={conference}
                    onChange={(event) => setConference(event.target.value as ConferenceCode)}
                  >
                    {CONFERENCE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pb-6 pt-4 sm:px-6">{children}</main>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-around px-2 py-3 text-xs font-medium text-text-muted">
            <button
              type="button"
              onClick={() => handleNavigate('scoreboard')}
              className={clsx(
                'flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 transition',
                isActive('scoreboard') ? 'bg-surface text-text shadow-card' : 'hover:bg-surface-muted'
              )}
            >
              <span className="text-lg">⚾</span>
              Live
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('box')}
              className={clsx(
                'flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 transition',
                isActive('box') ? 'bg-surface text-text shadow-card' : 'hover:bg-surface-muted'
              )}
            >
              <span className="text-lg">📊</span>
              Box Score
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('standings')}
              className={clsx(
                'flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 transition',
                isActive('standings') ? 'bg-surface text-text shadow-card' : 'hover:bg-surface-muted'
              )}
            >
              <span className="text-lg">🏆</span>
              Standings
            </button>
          </div>
        </nav>
      </div>
    </BaseballLayoutContext.Provider>
  );
}
