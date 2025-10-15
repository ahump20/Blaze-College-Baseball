'use client';

import { useMemo } from 'react';
import type { StandingsRow } from '../types';
import styles from './ui.module.css';

interface StandingsTableProps {
  conferenceName: string;
  rows: StandingsRow[];
}

interface LeaderMetric {
  label: string;
  value: string;
  detail?: string;
}

function pctToDisplay(value?: number) {
  if (typeof value !== 'number') {
    return '—';
  }
  return `${(value * 100).toFixed(1)}%`;
}

function formatRecord({ wins, losses, ties }: { wins: number; losses: number; ties?: number }) {
  if (typeof ties === 'number' && ties > 0) {
    return `${wins}-${losses}-${ties}`;
  }
  return `${wins}-${losses}`;
}

export function StandingsTable({ conferenceName, rows }: StandingsTableProps) {
  const leaders = useMemo<LeaderMetric[]>(() => {
    if (!rows.length) {
      return [];
    }

    const sortedByWinPct = [...rows].sort((a, b) => (b.conference.pct ?? 0) - (a.conference.pct ?? 0));
    const bestConference = sortedByWinPct[0];

    const sortedByRunDiff = [...rows].sort((a, b) => (b.runDifferential ?? -Infinity) - (a.runDifferential ?? -Infinity));
    const runDiffLeader = sortedByRunDiff[0];

    const sortedByLeverage = [...rows].sort((a, b) => (b.leverageRating ?? 0) - (a.leverageRating ?? 0));
    const leverageLeader = sortedByLeverage[0];

    return [
      {
        label: 'Conference leader',
        value: bestConference.team,
        detail: `${formatRecord(bestConference.conference)} · ${pctToDisplay(bestConference.conference.pct)}`,
      },
      {
        label: 'Run differential',
        value: runDiffLeader ? runDiffLeader.team : '—',
        detail:
          typeof runDiffLeader?.runDifferential === 'number'
            ? `${runDiffLeader.runDifferential >= 0 ? '+' : ''}${runDiffLeader.runDifferential}`
            : 'No data',
      },
      {
        label: 'Leverage ready',
        value: leverageLeader ? leverageLeader.team : '—',
        detail:
          typeof leverageLeader?.leverageRating === 'number'
            ? `Index ${leverageLeader.leverageRating.toFixed(2)}`
            : 'Awaiting model',
      },
    ];
  }, [rows]);

  return (
    <section className={styles.tableSection} aria-label={`${conferenceName} baseball standings`}>
      <div className={styles.leadersGrid} role="list" aria-label="Conference leaders">
        {leaders.map((leader) => (
          <article key={leader.label} className={`${styles.card} ${styles.leaderCard}`} role="listitem" tabIndex={0}>
            <span className={styles.microcopy}>{leader.label}</span>
            <span className={styles.leaderValue}>{leader.value}</span>
            {leader.detail && <span className={styles.leaderDetail}>{leader.detail}</span>}
          </article>
        ))}
        {!leaders.length && (
          <article className={`${styles.card} ${styles.leaderCard}`} role="listitem" tabIndex={0}>
            <span className={styles.microcopy}>Leaders</span>
            <span className={styles.leaderValue}>Awaiting data</span>
            <span className={styles.leaderDetail}>We will refresh once standings are available.</span>
          </article>
        )}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>{conferenceName} baseball standings</caption>
          <thead>
            <tr>
              <th scope="col">Team</th>
              <th scope="col">Conf</th>
              <th scope="col">Pct</th>
              <th scope="col" className={styles.desktopOnly}>Overall</th>
              <th scope="col" className={styles.desktopOnly}>Pct</th>
              <th scope="col" className={styles.desktopOnly}>Last 10</th>
              <th scope="col">Streak</th>
              <th scope="col" className={styles.desktopOnly}>Run Diff</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.teamId}>
                <th scope="row" data-label="Team">
                  <span className={styles.teamCellName}>{row.team}</span>
                  {row.shortName && <span className={styles.teamCellSub}>{row.shortName}</span>}
                </th>
                <td data-label="Conference">{formatRecord(row.conference)}</td>
                <td data-label="Conference pct">{pctToDisplay(row.conference.pct)}</td>
                <td data-label="Overall" className={styles.desktopOnly}>
                  {formatRecord(row.overall)}
                </td>
                <td data-label="Overall pct" className={styles.desktopOnly}>
                  {pctToDisplay(row.overall.pct)}
                </td>
                <td data-label="Last 10" className={styles.desktopOnly}>
                  {row.lastTen ? formatRecord(row.lastTen) : '—'}
                </td>
                <td data-label="Streak">{row.streak ?? '—'}</td>
                <td data-label="Run differential" className={styles.desktopOnly}>
                  {typeof row.runDifferential === 'number'
                    ? `${row.runDifferential >= 0 ? '+' : ''}${row.runDifferential}`
                    : '—'}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={8} className={styles.emptyTable}>
                  Standings will populate once data is available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default StandingsTable;
