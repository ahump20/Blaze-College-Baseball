'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBaseballLayout } from './BaseLayoutShell';
import type { ConferenceCode } from '@/styles/theme';

type RecordSummary = {
  wins: number;
  losses: number;
};

type StandingTeam = {
  team: {
    id: string | number;
    name: string;
  };
  rank?: number;
  conferenceRecord: RecordSummary;
  overallRecord: RecordSummary;
  rpi?: number;
  streakType?: 'W' | 'L';
  streakCount?: number;
};

type LeaderEntry = {
  name: string;
  team: string;
  avg?: string;
  hr?: number;
  era?: string;
  k?: number;
};

type StandingsPayload = {
  teams: StandingTeam[];
  leaders?: {
    batting?: LeaderEntry[];
    homeruns?: LeaderEntry[];
    era?: LeaderEntry[];
    strikeouts?: LeaderEntry[];
  };
};

const REFRESH_INTERVAL = 60_000;

export function StandingsBoard() {
  const { conference } = useBaseballLayout();
  const [data, setData] = useState<StandingsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const effectiveConference: ConferenceCode = conference === 'all' ? 'sec' : conference;

  const requestUrl = useMemo(
    () => `/api/college-baseball/standings?conference=${effectiveConference.toUpperCase()}`,
    [effectiveConference]
  );

  const fetchStandings = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await fetch(requestUrl, {
          cache: 'no-store',
          signal
        });
        const payload = await response.json();
        if (payload?.success) {
          setData(payload.data as StandingsPayload);
          setError(null);
        } else {
          setError('Unable to load standings right now.');
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        setError('Unable to load standings right now.');
      } finally {
        setLoading(false);
      }
    },
    [requestUrl]
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchStandings(controller.signal);

    const intervalId = window.setInterval(() => {
      fetchStandings();
    }, REFRESH_INTERVAL);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [fetchStandings]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/70 bg-surface/80 p-12 text-center shadow-card">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="text-sm text-text-muted">Loading standings...</p>
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

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/70 bg-surface/80 p-12 text-center shadow-card">
        <span className="text-4xl">🏆</span>
        <p className="text-sm text-text-muted">Standings unavailable for this conference.</p>
      </div>
    );
  }

  const leaders = data.leaders ?? {};

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="font-serif text-2xl text-text">Conference Standings</h2>
        <p className="text-sm text-text-muted">
          {conference === 'all'
            ? 'Showing SEC standings while an all-conference aggregate is prepared.'
            : `${conference.toUpperCase()} standings refreshed every minute.`}
        </p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-surface/80 shadow-card">
        <table className="min-w-full divide-y divide-border/60 text-sm">
          <thead className="bg-background/60 text-text-muted">
            <tr>
              <th className="px-3 py-3 text-left">#</th>
              <th className="px-3 py-3 text-left">Team</th>
              <th className="px-3 py-3 text-center">Conf</th>
              <th className="px-3 py-3 text-center">Overall</th>
              <th className="px-3 py-3 text-center">RPI</th>
              <th className="px-3 py-3 text-center">Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {data.teams.map((team, index) => {
              const rank = team.rank ?? index + 1;
              const streakIsWin = team.streakType === 'W';
              const streakClasses = team.streakType
                ? streakIsWin
                  ? 'bg-success/20 text-success'
                  : 'bg-crimson/20 text-crimson'
                : 'bg-surface-muted text-text-muted';
              const streakLabel = team.streakType ? `${team.streakType}${team.streakCount ?? 0}` : '–';
              return (
                <tr key={String(team.team.id)} className="text-text">
                  <td className="px-3 py-3 text-left text-sm font-semibold">{rank}</td>
                  <td className="px-3 py-3 text-left text-sm font-medium">{team.team.name}</td>
                  <td className="px-3 py-3 text-center text-sm">
                    {team.conferenceRecord.wins}-{team.conferenceRecord.losses}
                  </td>
                  <td className="px-3 py-3 text-center text-sm">
                    {team.overallRecord.wins}-{team.overallRecord.losses}
                  </td>
                  <td className="px-3 py-3 text-center text-sm">
                    {typeof team.rpi === 'number' ? team.rpi.toFixed(4) : '—'}
                  </td>
                  <td className="px-3 py-3 text-center text-sm">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${streakClasses}`}>{streakLabel}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(leaders.batting?.length || leaders.homeruns?.length || leaders.era?.length || leaders.strikeouts?.length) && (
        <div className="space-y-4">
          <h3 className="font-serif text-xl text-text">Leaders</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {leaders.batting?.length ? (
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Batting Average</h4>
                <ul className="mt-3 space-y-2 text-sm text-text">
                  {leaders.batting.map((player, index) => (
                    <li key={`${player.name}-${index}`} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-xs text-text-muted">{player.team}</p>
                      </div>
                      <span className="text-sm font-semibold">{player.avg ?? '—'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {leaders.homeruns?.length ? (
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Home Runs</h4>
                <ul className="mt-3 space-y-2 text-sm text-text">
                  {leaders.homeruns.map((player, index) => (
                    <li key={`${player.name}-${index}`} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-xs text-text-muted">{player.team}</p>
                      </div>
                      <span className="text-sm font-semibold">{player.hr ?? '—'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {leaders.era?.length ? (
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-text-muted">ERA</h4>
                <ul className="mt-3 space-y-2 text-sm text-text">
                  {leaders.era.map((player, index) => (
                    <li key={`${player.name}-${index}`} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-xs text-text-muted">{player.team}</p>
                      </div>
                      <span className="text-sm font-semibold">{player.era ?? '—'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {leaders.strikeouts?.length ? (
              <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-text-muted">Strikeouts</h4>
                <ul className="mt-3 space-y-2 text-sm text-text">
                  {leaders.strikeouts.map((player, index) => (
                    <li key={`${player.name}-${index}`} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-xs text-text-muted">{player.team}</p>
                      </div>
                      <span className="text-sm font-semibold">{player.k ?? '—'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
