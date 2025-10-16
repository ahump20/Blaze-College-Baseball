import { FC, useMemo } from 'react';
import { LiveGame } from '../types/baseball';
import '../styles/LiveGameTracker.css';

interface LiveGameTrackerProps {
  games: LiveGame[];
  onGameSelect: (game: LiveGame) => void;
  loading: boolean;
}

const getGameStatus = (game: LiveGame): string => {
  if (game.status === 'live' && game.inning) {
    return `${game.inning.half} ${game.inning.number}`;
  }

  if (game.status === 'final') {
    return 'Final';
  }

  return game.scheduledTime ?? 'TBD';
};

const getGameStatusClass = (status: LiveGame['status']): string => {
  if (status === 'live') return 'status-live';
  if (status === 'final') return 'status-final';
  return 'status-scheduled';
};

const formatScore = (score?: number): string =>
  typeof score === 'number' ? score.toString() : '-';

const formatRecord = (wins?: number, losses?: number): string => {
  if (typeof wins !== 'number' || typeof losses !== 'number') {
    return '';
  }
  return `(${wins}-${losses})`;
};

const formatAverage = (avg?: number | string): string => {
  if (typeof avg === 'number') {
    return avg.toFixed(3);
  }
  if (typeof avg === 'string') {
    return avg;
  }
  return '-';
};

const formatEra = (era?: number | string): string => {
  if (typeof era === 'number') {
    return era.toFixed(2);
  }
  if (typeof era === 'string') {
    return era;
  }
  return '-';
};

const LiveGameTracker: FC<LiveGameTrackerProps> = ({ games, onGameSelect, loading }) => {
  const hasGames = useMemo(() => games.length > 0, [games]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading live games...</p>
      </div>
    );
  }

  if (!hasGames) {
    return (
      <div className="empty-state">
        <p>No live games right now</p>
        <span className="empty-icon">⚾</span>
      </div>
    );
  }

  return (
    <div className="live-game-tracker">
      <div className="games-header">
        <h2>Live Games</h2>
        <span className="live-indicator">● LIVE</span>
      </div>

      <div className="games-list">
        {games.map((game) => {
          const awayRecord = formatRecord(game.awayTeam.record?.wins, game.awayTeam.record?.losses);
          const homeRecord = formatRecord(game.homeTeam.record?.wins, game.homeTeam.record?.losses);

          return (
            <div
              key={game.id}
              className={`game-card ${getGameStatusClass(game.status)}`}
              onClick={() => onGameSelect(game)}
            >
              <div className="game-status">
                <span className="status-text">{getGameStatus(game)}</span>
                {game.status === 'live' && game.situation && (
                  <span className="situation">
                    {game.situation.outs} Out · {game.situation.runners}
                  </span>
                )}
              </div>

              <div className="game-teams">
                <div
                  className={`team ${
                    (game.awayTeam.score ?? 0) > (game.homeTeam.score ?? 0) ? 'leading' : ''
                  }`}
                >
                  <div className="team-info">
                    <span className="team-name">
                      {game.awayTeam.name ?? game.awayTeam.shortName ?? 'Away'}
                    </span>
                    <span className="team-record">{awayRecord}</span>
                  </div>
                  <span className="team-score">{formatScore(game.awayTeam.score)}</span>
                </div>

                <div
                  className={`team ${
                    (game.homeTeam.score ?? 0) > (game.awayTeam.score ?? 0) ? 'leading' : ''
                  }`}
                >
                  <div className="team-info">
                    <span className="team-name">
                      {game.homeTeam.name ?? game.homeTeam.shortName ?? 'Home'}
                    </span>
                    <span className="team-record">{homeRecord}</span>
                  </div>
                  <span className="team-score">{formatScore(game.homeTeam.score)}</span>
                </div>
              </div>

              {game.status === 'live' && game.currentPitcher && (
                <div className="pitcher-info">
                  <span className="label">P:</span>
                  <span className="pitcher-name">{game.currentPitcher.name}</span>
                  <span className="pitcher-stats">
                    {game.currentPitcher.pitches}P · {formatEra(game.currentPitcher.era)} ERA
                  </span>
                </div>
              )}

              {game.status === 'live' && game.currentBatter && (
                <div className="batter-info">
                  <span className="label">AB:</span>
                  <span className="batter-name">{game.currentBatter.name}</span>
                  <span className="batter-stats">{formatAverage(game.currentBatter.avg)} AVG</span>
                </div>
              )}

              <div className="game-venue">
                <span>{game.venue ?? 'Venue TBD'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveGameTracker;
