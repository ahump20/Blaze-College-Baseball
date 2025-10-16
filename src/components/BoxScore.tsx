import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { ApiResponse, BoxScoreResponse, BattingLine, LiveGame, PitchingLine } from '../types/baseball';
import '../styles/BoxScore.css';

interface BoxScoreProps {
  game: LiveGame;
  onBack: () => void;
}

const formatBattingAverage = (avg: number | string | null): string => {
  if (typeof avg === 'number') {
    return avg.toFixed(3);
  }
  if (typeof avg === 'string') {
    return avg;
  }
  return '-';
};

const formatEra = (era: number | string | null): string => {
  if (typeof era === 'number') {
    return era.toFixed(2);
  }
  if (typeof era === 'string') {
    return era;
  }
  return '-';
};

const BoxScore: FC<BoxScoreProps> = ({ game, onBack }) => {
  const [activeTab, setActiveTab] = useState<'batting' | 'pitching'>('batting');
  const [boxScoreData, setBoxScoreData] = useState<BoxScoreResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBoxScore = useCallback(async () => {
    try {
      const response = await fetch(`/api/college-baseball/boxscore?gameId=${game.id}`);
      const data: ApiResponse<BoxScoreResponse> = await response.json();

      if (data.success && data.data) {
        setBoxScoreData(data.data);
      } else {
        setBoxScoreData(null);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching box score:', error);
      setBoxScoreData(null);
      setLoading(false);
    }
  }, [game.id]);

  useEffect(() => {
    fetchBoxScore();

    if (game.status === 'live') {
      const intervalId = window.setInterval(fetchBoxScore, 15000);
      return () => window.clearInterval(intervalId);
    }

    return undefined;
  }, [fetchBoxScore, game.status]);

  const awayLineScore = useMemo(() => boxScoreData?.awayTeam.lineScore ?? [], [boxScoreData]);
  const homeLineScore = useMemo(() => boxScoreData?.homeTeam.lineScore ?? [], [boxScoreData]);
  const maxInnings = useMemo(
    () => Math.max(awayLineScore.length, homeLineScore.length, 9),
    [awayLineScore, homeLineScore]
  );

  if (loading) {
    return <div className="loading-state">Loading box score...</div>;
  }

  if (!boxScoreData) {
    return <div className="empty-state">No box score data available</div>;
  }

  const renderLineScore = () => (
    <div className="line-score">
      <table>
        <thead>
          <tr>
            <th className="team-header"></th>
            {Array.from({ length: maxInnings }, (_, idx) => (
              <th key={idx}>{idx + 1}</th>
            ))}
            <th className="total-header">R</th>
            <th className="total-header">H</th>
            <th className="total-header">E</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="team-name">{boxScoreData.awayTeam.team.shortName}</td>
            {awayLineScore.map((runs, idx) => (
              <td key={idx} className="inning-score">
                {runs ?? '-'}
              </td>
            ))}
            <td className="total-score">{boxScoreData.awayTeam.score}</td>
            <td className="total-score">{boxScoreData.awayTeam.hits}</td>
            <td className="total-score">{boxScoreData.awayTeam.errors}</td>
          </tr>
          <tr>
            <td className="team-name">{boxScoreData.homeTeam.team.shortName}</td>
            {homeLineScore.map((runs, idx) => (
              <td key={idx} className="inning-score">
                {runs ?? '-'}
              </td>
            ))}
            <td className="total-score">{boxScoreData.homeTeam.score}</td>
            <td className="total-score">{boxScoreData.homeTeam.hits}</td>
            <td className="total-score">{boxScoreData.homeTeam.errors}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderBattingTable = (players: BattingLine[], teamKey: 'away' | 'home') => (
    <div className="team-stats">
      <h3>
        {teamKey === 'away'
          ? boxScoreData.awayTeam.team.shortName
          : boxScoreData.homeTeam.team.shortName}
      </h3>
      <div className="stats-table-wrapper">
        <table className="stats-table">
          <thead>
            <tr>
              <th className="player-col">Player</th>
              <th>AB</th>
              <th>R</th>
              <th>H</th>
              <th>RBI</th>
              <th>BB</th>
              <th>K</th>
              <th>AVG</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.playerId}>
                <td className="player-col">
                  <span className="player-name">{player.playerName}</span>
                  <span className="player-pos">{player.position}</span>
                </td>
                <td>{player.atBats}</td>
                <td>{player.runs}</td>
                <td>{player.hits}</td>
                <td>{player.rbi}</td>
                <td>{player.walks}</td>
                <td>{player.strikeouts}</td>
                <td className="avg">{formatBattingAverage(player.avg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPitchingTable = (players: PitchingLine[], teamKey: 'away' | 'home') => (
    <div className="team-stats">
      <h3>
        {teamKey === 'away'
          ? boxScoreData.awayTeam.team.shortName
          : boxScoreData.homeTeam.team.shortName}
      </h3>
      <div className="stats-table-wrapper">
        <table className="stats-table">
          <thead>
            <tr>
              <th className="player-col">Pitcher</th>
              <th>IP</th>
              <th>H</th>
              <th>R</th>
              <th>ER</th>
              <th>BB</th>
              <th>K</th>
              <th>PC</th>
              <th>ERA</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.playerId} className={player.decision ? 'decision-pitcher' : ''}>
                <td className="player-col">
                  <span className="player-name">{player.playerName}</span>
                  {player.decision && <span className="decision">{player.decision}</span>}
                </td>
                <td>{player.innings}</td>
                <td>{player.hits}</td>
                <td>{player.runs}</td>
                <td>{player.earnedRuns}</td>
                <td>{player.walks}</td>
                <td>{player.strikeouts}</td>
                <td>{player.pitches}</td>
                <td className="era">{formatEra(player.era)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBattingStats = () => (
    <div className="batting-stats">
      {renderBattingTable(boxScoreData.awayTeam.batting, 'away')}
      {renderBattingTable(boxScoreData.homeTeam.batting, 'home')}
    </div>
  );

  const renderPitchingStats = () => (
    <div className="pitching-stats">
      {renderPitchingTable(boxScoreData.awayTeam.pitching, 'away')}
      {renderPitchingTable(boxScoreData.homeTeam.pitching, 'home')}
    </div>
  );

  return (
    <div className="box-score">
      <div className="box-score-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="game-info">
          <h2>
            {boxScoreData.awayTeam.team.name} at {boxScoreData.homeTeam.team.name}
          </h2>
          <span className="game-date">{game.date ?? boxScoreData.lastUpdate ?? 'Updated'}</span>
        </div>
      </div>

      {renderLineScore()}

      <div className="stats-tabs">
        <button className={activeTab === 'batting' ? 'active' : ''} onClick={() => setActiveTab('batting')}>
          Batting
        </button>
        <button className={activeTab === 'pitching' ? 'active' : ''} onClick={() => setActiveTab('pitching')}>
          Pitching
        </button>
      </div>

      <div className="stats-content">
        {activeTab === 'batting' ? renderBattingStats() : renderPitchingStats()}
      </div>
    </div>
  );
};

export default BoxScore;
