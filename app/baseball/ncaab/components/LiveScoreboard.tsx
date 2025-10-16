'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBaseballLayout } from './BaseLayoutShell';

export type TeamRecord = {
  wins: number;
  losses: number;
};

export type TeamInfo = {
  name?: string;
  shortName?: string;
  score?: number | null;
  record?: TeamRecord | null;
};

export type GameSituation = {
  outs?: number;
  runners?: string;
};

export type PlayerSummary = {
  name: string;
  pitches?: number;
  era?: number;
  avg?: number;
};

export type GameSummary = {
  id: string | number;
  status: 'live' | 'final' | 'scheduled' | string;
  inning?: {
    half?: string;
    number?: number;
  };
  scheduledTime?: string;
  situation?: GameSituation | null;
  venue?: string;
  currentPitcher?: PlayerSummary | null;
  currentBatter?: PlayerSummary | null;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  date?: string;
};

const REFRESH_INTERVAL = 30_000;

const normalizeStat = (value?: number | string | null) => {
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return typeof value === 'number' ? (Number.isNaN(value) ? undefined : value) : undefined;
};

const formatAverage = (value?: number | string | null) => {
  const numeric = normalizeStat(value);
  if (typeof numeric !== 'number') {
    return '—';
  }
  return numeric.toFixed(3);
};

const formatEra = (value?: number | string | null) => {
  const numeric = normalizeStat(value);
  if (typeof numeric !== 'number') {
    return '—';
  }
  return numeric.toFixed(2);
};

export function LiveScoreboard() {
  const router = useRouter();
  const { conference, setSelectedGameId } = useBaseballLayout();
  const [games, setGames] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (conference !== 'all') {
      params.set('conference', conference.toUpperCase());
    }
    const query = params.toString();
    return `/api/college-baseball/games${query ? `?${query}` : ''}`;
  }, [conference]);

  const fetchGames = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await fetch(requestUrl, {
          cache: 'no-store',
          signal
        });
        const payload = await response.json();
        if (payload?.success) {
          setGames(Array.isArray(payload.data) ? (payload.data as GameSummary[]) : []);
          setError(null);
        } else {
          setGames([]);
          setError('Unable to load games right now.');
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        setGames([]);
        setError('Unable to load games right now.');
      } finally {
        setLoading(false);
      }
    },
    [requestUrl]
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchGames(controller.signal);

    const intervalId = window.setInterval(() => {
      fetchGames();
    }, REFRESH_INTERVAL);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [fetchGames]);

  const getGameStatus = (game: GameSummary) => {
    if (game.status === 'live') {
      const half = game.inning?.half ? game.inning.half.toUpperCase() : '';
      const inning = game.inning?.number ?? '';
      return inning ? `${half} ${inning}`.trim() : 'Live';
    }
    if (game.status === 'final') {
      return 'Final';
    }
    return game.scheduledTime ?? 'Scheduled';
  };

  const getStatusBadgeClasses = (status: GameSummary['status']) => {
    if (status === 'live') {
      return 'bg-crimson/20 text-crimson';
    }
    if (status === 'final') {
      return 'bg-surface-muted text-text-muted';
    }
    return 'bg-surface-muted text-text-muted';
  };

  const renderBody = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/70 bg-surface/80 p-12 text-center shadow-card">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-text-muted">Loading live games...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-crimson/40 bg-surface/80 p-6 text-center text-sm text-crimson shadow-card">
          {error}
        </div>
      );
    }

    if (!games.length) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/70 bg-surface/80 p-12 text-center shadow-card">
          <span className="text-4xl">⚾</span>
          <p className="text-sm text-text-muted">No live games right now. Check back soon.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {games.map((game) => {
          const normalizedId = String(game.id);
          const awayScore = game.awayTeam.score ?? '-';
          const homeScore = game.homeTeam.score ?? '-';
          const awayLeading = Number(game.awayTeam.score ?? 0) > Number(game.homeTeam.score ?? 0);
          const homeLeading = Number(game.homeTeam.score ?? 0) > Number(game.awayTeam.score ?? 0);
          return (
            <button
              key={normalizedId}
              type="button"
              onClick={() => {
                setSelectedGameId(normalizedId);
                router.push(`/baseball/ncaab/box-score/${encodeURIComponent(normalizedId)}`);
              }}
              className="flex h-full flex-col gap-4 rounded-2xl border border-border/70 bg-surface/80 p-4 text-left shadow-card transition hover:border-accent hover:shadow-[0_24px_64px_rgba(15,23,42,0.45)]"
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(game.status)}`}>
                  {getGameStatus(game)}
                </span>
                <span className="text-xs text-text-muted">{game.venue ?? 'Venue TBA'}</span>
              </div>

              <div className="space-y-3">
                {[game.awayTeam, game.homeTeam].map((team, index) => {
                  const score = index === 0 ? awayScore : homeScore;
                  const leading = index === 0 ? awayLeading : homeLeading;
                  return (
                    <div
                      key={team.name ?? team.shortName ?? `${game.id}-${index}`}
                      className={`flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2 ${leading ? 'bg-background/60' : 'bg-surface-muted/60'}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-text">
                          {team.name ?? team.shortName ?? 'TBD'}
                        </span>
                        {team.record && (
                          <span className="text-xs text-text-muted">
                            ({team.record.wins}-{team.record.losses})
                          </span>
                        )}
                      </div>
                      <span className="text-2xl font-semibold text-text">{score}</span>
                    </div>
                  );
                })}
              </div>

              {game.status === 'live' && (game.currentPitcher || game.currentBatter) && (
                <div className="grid gap-3 rounded-xl border border-border/60 bg-background/60 p-3 text-xs text-text-muted sm:grid-cols-2">
                  {game.currentPitcher && (
                    <div className="flex flex-col">
                      <span className="text-text">P: {game.currentPitcher.name}</span>
                      <span>
                        {game.currentPitcher.pitches ?? 0}P · {formatEra(game.currentPitcher.era)} ERA
                      </span>
                    </div>
                  )}
                  {game.currentBatter && (
                    <div className="flex flex-col">
                      <span className="text-text">AB: {game.currentBatter.name}</span>
                      <span>{formatAverage(game.currentBatter.avg)} AVG</span>
                    </div>
                  )}
                  {game.situation && (
                    <div className="flex flex-col sm:col-span-2">
                      <span className="text-text">
                        {game.situation.outs ?? 0} Out · {game.situation.runners ?? 'Bases empty'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-text">Live Scoreboard</h2>
          <p className="text-sm text-text-muted">Games refresh automatically every 30 seconds.</p>
        </div>
      </header>
      {renderBody()}
    </section>
  );
}
