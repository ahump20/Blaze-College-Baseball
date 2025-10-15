'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { LiveGame } from '../types';
import styles from './ui.module.css';

interface GameCardProps {
  game: LiveGame;
}

function formatStartTime(isoString: string) {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  } catch (error) {
    return isoString;
  }
}

function describeStatus(game: LiveGame) {
  if (game.status === 'live') {
    if (game.inning && game.inningHalf) {
      return `${game.inningHalf} ${game.inning}`;
    }
    return 'Live';
  }

  if (game.status === 'scheduled') {
    return `First pitch ${formatStartTime(game.startTime)}`;
  }

  if (game.status === 'final') {
    return 'Final';
  }

  if (game.status === 'delayed') {
    return 'In Delay';
  }

  if (game.status === 'postponed') {
    return 'Postponed';
  }

  return game.status;
}

function formatLeverage(leverage?: number) {
  if (typeof leverage !== 'number') {
    return 'N/A';
  }
  if (leverage >= 3.5) {
    return `${leverage.toFixed(1)} · Extreme leverage`;
  }
  if (leverage >= 2.0) {
    return `${leverage.toFixed(1)} · High leverage`;
  }
  if (leverage >= 1.2) {
    return `${leverage.toFixed(1)} · Moderate leverage`;
  }
  return `${leverage.toFixed(1)} · Routine`;
}

function formatRecord(record?: string) {
  return record ? record : '—';
}

function deriveBoxScoreHref(game: LiveGame) {
  if (game.boxScorePath) {
    return game.boxScorePath;
  }
  return `/baseball/ncaab/games/${game.id}`;
}

export function GameCard({ game }: GameCardProps) {
  const statusLabel = useMemo(() => describeStatus(game), [game]);
  const leverageLabel = useMemo(() => formatLeverage(game.leverageIndex), [game.leverageIndex]);
  const scheduledLabel = useMemo(() => formatStartTime(game.startTime), [game.startTime]);

  return (
    <article className={`${styles.card} ${styles.gameCard}`} role="listitem">
      <header className={styles.cardHeader}>
        <div className={styles.statusGroup}>
          <span className={styles.statusBadge} data-state={game.status} aria-label={`Game status: ${statusLabel}`}>
            {statusLabel}
          </span>
          {game.status !== 'live' && (
            <span className={styles.statusMeta}>{scheduledLabel}</span>
          )}
        </div>
        <div className={styles.leverage}>
          <span className={styles.microcopy}>Leverage index</span>
          <strong aria-live="polite">{leverageLabel}</strong>
        </div>
      </header>

      <div className={styles.scoreboard} aria-live="polite" aria-atomic="true">
        <div className={styles.teamRow}>
          <div className={styles.teamDetails}>
            {typeof game.away.rank === 'number' && <span className={styles.rank}>#{game.away.rank}</span>}
            <span className={styles.teamName}>{game.away.name}</span>
            <span className={styles.teamRecord}>{formatRecord(game.away.record)}</span>
          </div>
          <span className={styles.teamScore} aria-label={`Away score ${game.away.score}`}>
            {game.away.score}
          </span>
        </div>
        <div className={styles.teamRow}>
          <div className={styles.teamDetails}>
            {typeof game.home.rank === 'number' && <span className={styles.rank}>#{game.home.rank}</span>}
            <span className={styles.teamName}>{game.home.name}</span>
            <span className={styles.teamRecord}>{formatRecord(game.home.record)}</span>
          </div>
          <span className={styles.teamScore} aria-label={`Home score ${game.home.score}`}>
            {game.home.score}
          </span>
        </div>
      </div>

      <dl className={styles.gameMeta}>
        {game.venue && (
          <div>
            <dt>Venue</dt>
            <dd>{game.venue}</dd>
          </div>
        )}
        {game.lastPlay && (
          <div>
            <dt>Last impact play</dt>
            <dd>{game.lastPlay}</dd>
          </div>
        )}
        {game.broadcast && (
          <div>
            <dt>Coverage</dt>
            <dd>{game.broadcast}</dd>
          </div>
        )}
      </dl>

      <footer className={styles.cardFooter}>
        <Link
          href={deriveBoxScoreHref(game)}
          className={styles.boxScoreLink}
          aria-label={`View box score for ${game.away.name} vs ${game.home.name}`}
        >
          View Box Score
        </Link>
      </footer>
    </article>
  );
}

export default GameCard;
