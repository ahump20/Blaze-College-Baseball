'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBaseballLayout } from './BaseLayoutShell';

export type BattingLine = {
  playerId: string;
  playerName: string;
  position?: string;
  atBats: number;
  runs: number;
  hits: number;
  rbi: number;
  walks: number;
  strikeouts: number;
  avg: number | string;
};

export type PitchingLine = {
  playerId: string;
  playerName: string;
  innings: string | number;
  hits: number;
  runs: number;
  earnedRuns: number;
  walks: number;
  strikeouts: number;
  pitches: number;
  era: number | string;
  decision?: string;
};

export type LineScoreTeam = {
  team: {
    name?: string;
    shortName?: string;
  };
  lineScore?: Array<number | null>;
  score?: number | string | null;
  hits?: number | string | null;
  errors?: number | string | null;
  batting?: BattingLine[];
  pitching?: PitchingLine[];
};

export type BoxScorePayload = {
  awayTeam: LineScoreTeam;
  homeTeam: LineScoreTeam;
  lastUpdate?: string;
  gameStatus?: string;
  gameDate?: string;
};

type Props = {
  gameId: string;
};

const REFRESH_INTERVAL = 15_000;

type ActiveTab = 'batting' | 'pitching';

export function BoxScoreClient({ gameId }: Props) {
  const router = useRouter();
  const { setSelectedGameId } = useBaseballLayout();
  const [data, setData] = useState<BoxScorePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('batting');

  const requestUrl = useMemo(() => `/api/college-baseball/boxscore?gameId=${gameId}`, [gameId]);

  const fetchBoxScore = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await fetch(requestUrl, {
          cache: 'no-store',
          signal
        });
        const payload = await response.json();
        if (payload?.success) {
          const nextData = payload.data as Partial<BoxScorePayload>;
          if (nextData?.awayTeam && nextData?.homeTeam) {
            setData(nextData as BoxScorePayload);
            setError(null);
          } else {
            setData(null);
            setError('Box score response was incomplete.');
          }
        } else {
          setError('Unable to load box score.');
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        setError('Unable to load box score.');
      } finally {
        setLoading(false);
      }
    },
    [requestUrl]
  );

  useEffect(() => {
    setSelectedGameId(gameId);
  }, [gameId, setSelectedGameId]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchBoxScore(controller.signal);
    const intervalId = window.setInterval(() => {
      fetchBoxScore();
    }, REFRESH_INTERVAL);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [fetchBoxScore]);

  const innings = useMemo(() => {
    const awayInnings = data?.awayTeam?.lineScore ?? [];
    const homeInnings = data?.homeTeam?.lineScore ?? [];
    return Math.max(awayInnings.length, homeInnings.length);
  }, [data]);

  const parseStat = (value?: number | string) => {
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value;
    }
    return undefined;
  };

  const formatAverage = (value?: number | string) => {
    const numeric = parseStat(value);
    if (typeof numeric !== 'number') {
      return '—';
    }
    return numeric.toFixed(3);
  };

  const formatEra = (value?: number | string) => {
    const numeric = parseStat(value);
    if (typeof numeric !== 'number') {
      return '—';
    }
    return numeric.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/70 bg-surface/80 p-12 text-center shadow-card">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="text-sm text-text-muted">Loading box score...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-crimson/40 bg-surface/80 p-6 text-center text-sm text-crimson shadow-card">
          {error}
        </div>
        <button
          type="button"
          onClick={() => router.push('/baseball/ncaab')}
          className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-accent hover:text-accent"
        >
          Back to scoreboard
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border/70 bg-surface/80 p-12 text-center shadow-card">
        <span className="text-4xl">📭</span>
        <p className="text-sm text-text-muted">No box score data is available for this matchup.</p>
      </div>
    );
  }

  const renderBattingTable = (team: LineScoreTeam) => {
    const shortName = team.team.shortName ?? team.team.name;
    return (
      <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
        <h3 className="font-serif text-lg text-text">{shortName}</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full divide-y divide-border/40 text-sm">
            <thead className="text-text-muted">
              <tr>
                <th className="px-3 py-2 text-left">Player</th>
                <th className="px-3 py-2 text-right">AB</th>
                <th className="px-3 py-2 text-right">R</th>
                <th className="px-3 py-2 text-right">H</th>
                <th className="px-3 py-2 text-right">RBI</th>
                <th className="px-3 py-2 text-right">BB</th>
                <th className="px-3 py-2 text-right">K</th>
                <th className="px-3 py-2 text-right">AVG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {(team.batting ?? []).map((player) => (
                <tr key={player.playerId} className="text-text">
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{player.playerName}</span>
                      {player.position && <span className="text-xs text-text-muted">{player.position}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">{player.atBats}</td>
                  <td className="px-3 py-2 text-right">{player.runs}</td>
                  <td className="px-3 py-2 text-right">{player.hits}</td>
                  <td className="px-3 py-2 text-right">{player.rbi}</td>
                  <td className="px-3 py-2 text-right">{player.walks}</td>
                  <td className="px-3 py-2 text-right">{player.strikeouts}</td>
                  <td className="px-3 py-2 text-right">{formatAverage(player.avg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPitchingTable = (team: LineScoreTeam) => {
    const shortName = team.team.shortName ?? team.team.name;
    return (
      <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
        <h3 className="font-serif text-lg text-text">{shortName}</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full divide-y divide-border/40 text-sm">
            <thead className="text-text-muted">
              <tr>
                <th className="px-3 py-2 text-left">Pitcher</th>
                <th className="px-3 py-2 text-right">IP</th>
                <th className="px-3 py-2 text-right">H</th>
                <th className="px-3 py-2 text-right">R</th>
                <th className="px-3 py-2 text-right">ER</th>
                <th className="px-3 py-2 text-right">BB</th>
                <th className="px-3 py-2 text-right">K</th>
                <th className="px-3 py-2 text-right">PC</th>
                <th className="px-3 py-2 text-right">ERA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {(team.pitching ?? []).map((player) => (
                <tr key={player.playerId} className="text-text">
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{player.playerName}</span>
                      {player.decision && <span className="text-xs text-accent">{player.decision}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">{player.innings}</td>
                  <td className="px-3 py-2 text-right">{player.hits}</td>
                  <td className="px-3 py-2 text-right">{player.runs}</td>
                  <td className="px-3 py-2 text-right">{player.earnedRuns}</td>
                  <td className="px-3 py-2 text-right">{player.walks}</td>
                  <td className="px-3 py-2 text-right">{player.strikeouts}</td>
                  <td className="px-3 py-2 text-right">{player.pitches}</td>
                  <td className="px-3 py-2 text-right">{formatEra(player.era)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl text-text">
            {(data.awayTeam?.team?.name ?? 'Away Team')} at {(data.homeTeam?.team?.name ?? 'Home Team')}
          </h2>
          <p className="text-sm text-text-muted">
            {data.gameStatus ? data.gameStatus : 'Updated'} · {data.lastUpdate ?? 'Live sync'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/baseball/ncaab')}
          className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-accent hover:text-accent"
        >
          ← Back
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-surface/80 shadow-card">
        <table className="min-w-full divide-y divide-border/60 text-sm">
          <thead className="bg-background/60 text-text-muted">
            <tr>
              <th className="px-3 py-3 text-left">Team</th>
              {Array.from({ length: innings }).map((_, index) => (
                <th key={index} className="px-2 py-3 text-center text-xs">
                  {index + 1}
                </th>
              ))}
              <th className="px-2 py-3 text-center text-xs">R</th>
              <th className="px-2 py-3 text-center text-xs">H</th>
              <th className="px-2 py-3 text-center text-xs">E</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {[data.awayTeam, data.homeTeam].map((team, index) => {
              const rowLabel = team.team.shortName ?? team.team.name ?? `Team ${index + 1}`;
              return (
                <tr key={`${rowLabel}-${index}`} className="text-text">
                  <td className="px-3 py-3 font-medium">{rowLabel}</td>
                  {Array.from({ length: innings }).map((_, inningIndex) => (
                    <td key={inningIndex} className="px-2 py-3 text-center text-sm">
                      {team.lineScore?.[inningIndex] ?? '—'}
                    </td>
                  ))}
                  <td className="px-2 py-3 text-center text-sm font-semibold">{team.score ?? '—'}</td>
                  <td className="px-2 py-3 text-center text-sm font-semibold">{team.hits ?? '—'}</td>
                  <td className="px-2 py-3 text-center text-sm font-semibold">{team.errors ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 rounded-full border border-border/60 bg-surface/80 p-2 text-sm text-text">
        <button
          type="button"
          onClick={() => setActiveTab('batting')}
          className={`flex-1 rounded-full px-4 py-2 text-center transition ${
            activeTab === 'batting' ? 'bg-accent text-background font-semibold' : 'hover:bg-background/60'
          }`}
        >
          Batting
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pitching')}
          className={`flex-1 rounded-full px-4 py-2 text-center transition ${
            activeTab === 'pitching' ? 'bg-accent text-background font-semibold' : 'hover:bg-background/60'
          }`}
        >
          Pitching
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {activeTab === 'batting' ? (
          <>
            {renderBattingTable(data.awayTeam)}
            {renderBattingTable(data.homeTeam)}
          </>
        ) : (
          <>
            {renderPitchingTable(data.awayTeam)}
            {renderPitchingTable(data.homeTeam)}
          </>
        )}
      </div>
    </section>
  );
}
