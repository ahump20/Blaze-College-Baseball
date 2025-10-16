'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { Leaders } from '../components/Leaders';
import { PageState } from '../components/PageState';
import { StandingsTable } from '../components/StandingsTable';
import { useBreakpoint } from '../hooks/useBreakpoint';
import type { StandingsResponse, StandingsRow } from '../lib/mock-data';
import styles from './standings.module.css';

const conferences = [
  { id: 'sec', label: 'SEC' },
  { id: 'acc', label: 'ACC' },
  { id: 'big-12', label: 'Big 12' }
] as const;

type ConferenceId = (typeof conferences)[number]['id'];

const fetcher = async (url: string): Promise<StandingsResponse> => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Unable to load standings');
  }
  return res.json();
};

function winPct({ wins, losses }: StandingsRow['conferenceRecord']) {
  const total = wins + losses;
  if (total === 0) return 0;
  return wins / total;
}

function computeLeaders(teams: StandingsRow[]) {
  if (teams.length === 0) return [];
  const topSeed = [...teams].sort((a, b) => winPct(b.conferenceRecord) - winPct(a.conferenceRecord))[0];
  const runDiff = [...teams].sort((a, b) => b.runDifferential - a.runDifferential)[0];
  const hot = [...teams].sort(
    (a, b) =>
      b.lastTen.wins / Math.max(1, b.lastTen.wins + b.lastTen.losses) -
      a.lastTen.wins / Math.max(1, a.lastTen.wins + a.lastTen.losses)
  )[0];

  return [
    {
      label: 'Top seed pace',
      value: topSeed.name,
      subvalue: `${topSeed.conferenceRecord.wins}-${topSeed.conferenceRecord.losses} · ${winPct(topSeed.conferenceRecord)
        .toFixed(3)
        .slice(1)}`
    },
    {
      label: 'Run differential leader',
      value: runDiff.name,
      subvalue: `${runDiff.runDifferential >= 0 ? '+' : ''}${runDiff.runDifferential}`
    },
    {
      label: 'Last 10 heat check',
      value: hot.name,
      subvalue: `${hot.lastTen.wins}-${hot.lastTen.losses}`
    }
  ];
}

export default function BaseballStandingsPage() {
  const [conference, setConference] = useState<ConferenceId>('sec');
  const isMobile = useBreakpoint('sm');
  const { data, error, isLoading } = useSWR<StandingsResponse>(
    `/api/v1/standings/${conference}`,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  );

  const teams = data?.teams ?? [];
  const leaders = useMemo(() => computeLeaders(teams), [teams]);

  return (
    <main className={`di-page ${styles.page}`}>
      <section className="di-section">
        <span className="di-kicker">Diamond Insights · Standings</span>
        <div className={styles.headerRow}>
          <h1 className="di-page-title">Conference Standings Pulse</h1>
          <div className={styles.selectorGroup}>
            <label className={styles.selectorLabel} htmlFor="conference">
              Conference
            </label>
            <select
              id="conference"
              className={styles.select}
              value={conference}
              onChange={(event) => setConference(event.target.value as ConferenceId)}
              aria-label="Select conference"
            >
              {conferences.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="di-page-subtitle">
          Track pace to Hoover, RPI posture, and streak indicators across the Power 5 rotation. Optimized for pocket scouting and
          nightly decisioning.
        </p>
        <div className={styles.metaBar} aria-live="polite">
          {data?.meta?.lastUpdated ? `Standings refreshed ${new Date(data.meta.lastUpdated).toLocaleTimeString()}` : 'Awaiting latest table'}
        </div>

        {leaders.length > 0 ? <Leaders items={leaders} /> : null}

        {isLoading && teams.length === 0 ? (
          <PageState
            state="loading"
            isMobile={isMobile}
            title="Loading standings"
            description="Syncing conference splits from the worker cache."
          />
        ) : null}

        {error ? (
          <PageState
            state="error"
            isMobile={isMobile}
            title="Unable to load standings"
            role="alert"
            description={error instanceof Error ? error.message : 'The standings endpoint is unavailable.'}
          />
        ) : null}

        {!isLoading && !error && teams.length === 0 ? (
          <PageState
            state="empty"
            isMobile={isMobile}
            title="No standings available"
            description="We do not have data for this conference yet. Check back after the next sync window."
          />
        ) : null}

        {teams.length > 0 ? <StandingsTable conference={conferences.find((c) => c.id === conference)?.label ?? conference} teams={teams} isMobile={isMobile} /> : null}
      </section>
    </main>
  );
}
