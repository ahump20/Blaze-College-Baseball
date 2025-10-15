'use client';

import Link from 'next/link';
import { useId } from 'react';
import { Card, CardActions, CardBadge, CardHeader, CardMuted, CardTitle } from './Card';
import styles from './GameCard.module.css';
import type { GameSummary } from '../lib/mock-data';

const tierLabels: Record<GameSummary['leverageTier'], string> = {
  low: 'Low leverage',
  moderate: 'Moderate leverage',
  high: 'High leverage',
  critical: 'Critical leverage'
};

const statusText: Record<GameSummary['status'], string> = {
  'in-progress': 'Live',
  final: 'Final',
  scheduled: 'Scheduled'
};

const tierClassName: Record<GameSummary['leverageTier'], string> = {
  low: styles.tierLow,
  moderate: styles.tierModerate,
  high: styles.tierHigh,
  critical: styles.tierCritical
};

export interface GameCardProps {
  game: GameSummary;
}

export function GameCard({ game }: GameCardProps) {
  const titleId = useId();
  const statusId = useId();
  const status = statusText[game.status];
  const showScores = game.status !== 'scheduled';

  return (
    <Card aria-labelledby={titleId} aria-describedby={statusId} className={styles.card}>
      <CardHeader className={styles.cardHeader}>
        <div className={styles.statusGroup}>
          <span id={statusId} className={styles.status} aria-live={game.status === 'in-progress' ? 'polite' : 'off'}>
            {status}
          </span>
          <span className={styles.inning}>{game.inningStatus}</span>
        </div>
        <CardBadge className={tierClassName[game.leverageTier]} aria-label={`Leverage tier: ${tierLabels[game.leverageTier]}`}>
          {tierLabels[game.leverageTier]}
        </CardBadge>
      </CardHeader>

      <CardTitle id={titleId} className={styles.matchup}>
        {game.teams.away.shortName} @ {game.teams.home.shortName}
      </CardTitle>
      <CardMuted className={styles.venue}>{game.venue}</CardMuted>

      <div className={styles.scoreboard}>
        <TeamRow team={game.teams.away} showScores={showScores} />
        <TeamRow team={game.teams.home} showScores={showScores} isHome />
      </div>

      <div className={styles.meta}>
        <p>
          <strong className={styles.metaLabel}>Leverage Index:</strong>
          <meter
            min={0}
            max={10}
            low={2}
            high={5}
            optimum={0}
            value={Math.min(10, Math.max(0, Number(game.leverageIndex.toFixed(1))))}
            aria-label={`Current leverage index ${game.leverageIndex.toFixed(1)}`}
          />
          <span className={styles.leverageValue}>{game.leverageIndex.toFixed(1)}</span>
        </p>
        <p>
          <strong className={styles.metaLabel}>Situation:</strong> {game.situation}
        </p>
        <p>
          <strong className={styles.metaLabel}>Broadcast:</strong> {game.broadcast}
        </p>
      </div>

      <CardActions>
        <Link className={styles.actionLink} href={game.links.boxScore} aria-label={`Open box score for ${game.teams.away.shortName} at ${game.teams.home.shortName}`}>
          View box score
        </Link>
        {game.links.liveGameCenter ? (
          <Link
            className={styles.secondaryLink}
            href={game.links.liveGameCenter}
            aria-label={`Open live game center for ${game.teams.away.shortName} at ${game.teams.home.shortName}`}
          >
            Live game center
          </Link>
        ) : null}
      </CardActions>
    </Card>
  );
}

interface TeamRowProps {
  team: GameSummary['teams']['home'];
  showScores: boolean;
  isHome?: boolean;
}

function TeamRow({ team, showScores, isHome }: TeamRowProps) {
  return (
    <div className={styles.teamRow}>
      <div className={styles.teamInfo}>
        {team.ranking ? <span className={styles.ranking}>#{team.ranking}</span> : null}
        <span className={styles.teamName}>{team.name}</span>
        <span className={styles.teamRecord}>{team.record}</span>
      </div>
      <div className={styles.score} aria-label={`${team.shortName} score`}>
        {showScores && team.runs !== null ? team.runs : '—'}
      </div>
      {showScores ? (
        <div className={styles.teamStats}>
          <span className={styles.stat} aria-label={`${team.shortName} hits`}>
            H {team.hits ?? '—'}
          </span>
          <span className={styles.stat} aria-label={`${team.shortName} errors`}>
            E {team.errors ?? '—'}
          </span>
          {isHome ? <span className={styles.lastAtBat}>Last AB</span> : null}
        </div>
      ) : (
        <div className={styles.teamStats} aria-hidden="true">
          <span className={styles.stat}>H —</span>
          <span className={styles.stat}>E —</span>
        </div>
      )}
    </div>
  );
}
