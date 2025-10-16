'use client';

import { useMemo, useState } from 'react';
import { DataStateMessage } from '../components/DataState';
import ConferenceSelector, { type ConferenceOption } from '../components/ConferenceSelector';
import StandingsTable from '../components/StandingsTable';
import { useConferenceStandings } from '../components/data-hooks';
import styles from '../components/ui.module.css';

const conferenceOptions: ConferenceOption[] = [
  {
    value: 'sec',
    label: 'SEC',
    description: 'Southeastern Conference · 14 teams · 10-week gauntlet',
  },
  {
    value: 'acc',
    label: 'ACC',
    description: 'Atlantic Coast Conference · 12-team pods · relentless travel',
  },
  {
    value: 'big12',
    label: 'Big 12',
    description: 'Big 12 Conference · New-look alignment with Houston and UCF',
  },
  {
    value: 'pac12',
    label: 'Pac-12',
    description: 'Pac-12 Conference · West Coast balance of power',
  },
];

function formatTimestamp(iso?: string) {
  if (!iso) return null;
  try {
    const date = new Date(iso);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
    }).format(date);
  } catch (error) {
    return null;
  }
}

export default function BaseballStandingsPage() {
  const [conference, setConference] = useState<string>(conferenceOptions[0]?.value ?? 'sec');
  const { data, error, isLoading, mutate } = useConferenceStandings(conference);
  const rows = data?.rows ?? [];

  const activeOption = useMemo(
    () => conferenceOptions.find((option) => option.value === conference),
    [conference]
  );

  const displayName = data?.displayName ?? activeOption?.label ?? conference.toUpperCase();
  const updatedLabel = useMemo(() => formatTimestamp(data?.lastUpdated), [data?.lastUpdated]);

  return (
    <main className="di-page">
      <section className="di-section" aria-labelledby="ncaab-standings-heading">
        <span className="di-kicker">Diamond Insights · Standings</span>
        <h1 id="ncaab-standings-heading" className="di-page-title">
          Standings & Form Tracker
        </h1>
        <p className="di-page-subtitle">
          Monitor conference races, leverage readiness, and ten-game form without leaving dark mode. Pick a league and we will
          stream standings direct from the worker cache.
        </p>

        <ConferenceSelector value={conference} onChange={setConference} options={conferenceOptions} />
        {updatedLabel && (
          <p className="di-microcopy" aria-live="polite">
            Updated {updatedLabel}
          </p>
        )}

        {isLoading && (
          <div className={styles.grid} role="presentation">
            <DataStateMessage
              state="loading"
              heading={`Loading ${displayName} standings`}
              description="Syncing the latest conference table and streak indicators."
              asListItem={false}
            />
          </div>
        )}

        {!isLoading && error && (
          <div className={styles.grid} role="presentation">
            <DataStateMessage
              state="error"
              heading="Standings request failed"
              description={error.message || 'We could not fetch the conference table. Try again in a moment.'}
              actionLabel="Retry standings"
              onAction={() => void mutate()}
              asListItem={false}
            />
          </div>
        )}

        {!isLoading && !error && rows.length === 0 && (
          <div className={styles.grid} role="presentation">
            <DataStateMessage
              state="empty"
              heading="No standings available"
              description="Once the season begins or data populates for this conference, standings will render instantly."
              asListItem={false}
            />
          </div>
        )}

        {!isLoading && !error && rows.length > 0 && (
          <StandingsTable conferenceName={`${displayName} Baseball`} rows={rows} />
        )}
      </section>
    </main>
  );
}
