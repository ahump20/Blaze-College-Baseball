import type { ReactNode } from 'react';

const cx = (...values: Array<string | false | null | undefined>): string => values.filter(Boolean).join(' ');

export interface ScoreStripGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
  homeRank?: number;
  awayRank?: number;
  homeScore?: number;
  awayScore?: number;
  startTime?: string;
  meta?: ReactNode;
}

export interface ScoreStripProps {
  games: ScoreStripGame[];
  className?: string;
}

export function ScoreStrip({ games, className }: ScoreStripProps) {
  if (!games.length) {
    return null;
  }

  return (
    <section
      className={cx(
        'overflow-hidden rounded-2xl border border-border-strong bg-background-surface shadow-surface',
        className
      )}
      aria-label="Featured college baseball scores"
    >
      <div className="flex items-stretch gap-sm overflow-x-auto px-lg py-sm" role="list">
        {games.map((game) => {
          const homeLeading = isLeading(game.homeScore, game.awayScore);
          const awayLeading = isLeading(game.awayScore, game.homeScore);

          return (
            <article
              key={game.id}
              role="listitem"
              className="min-w-[16rem] flex-1 rounded-xl border border-border-strong/60 bg-background-elevated px-md py-sm"
            >
              <header className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-foreground-muted">
                <span>{game.status}</span>
                {game.startTime ? <span>{game.startTime}</span> : null}
              </header>
              <div className="mt-sm space-y-2xs">
                <TeamRow team={game.awayTeam} rank={game.awayRank} score={game.awayScore} highlight={awayLeading} />
                <TeamRow team={game.homeTeam} rank={game.homeRank} score={game.homeScore} highlight={homeLeading} />
              </div>
              {game.meta ? <footer className="mt-sm text-xs text-foreground-muted">{game.meta}</footer> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

interface TeamRowProps {
  team: string;
  rank?: number;
  score?: number;
  highlight?: boolean;
}

const TeamRow = ({ team, rank, score, highlight }: TeamRowProps) => {
  return (
    <div
      className={cx(
        'flex items-center justify-between rounded-lg border border-transparent px-md py-xs',
        highlight ? 'border-accent-gold/40 bg-background-surface text-foreground' : 'bg-background-muted/40 text-foreground'
      )}
    >
      <div className="flex items-center gap-2xs text-sm">
        {typeof rank === 'number' ? (
          <span className="text-xs font-semibold text-accent-gold">#{rank}</span>
        ) : null}
        <span className="font-medium">{team}</span>
      </div>
      <span className="text-base font-semibold">{typeof score === 'number' ? score : '—'}</span>
    </div>
  );
};

const isLeading = (score?: number, compare?: number) =>
  typeof score === 'number' && typeof compare === 'number' && score > compare;

export type { ScoreStripProps as ScoreStripProperties };
