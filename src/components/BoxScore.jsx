import React, { useState, useEffect } from 'react';
import '../styles/BoxScore.css';

function BoxScore({ game, onBack }) {
  const [activeTab, setActiveTab] = useState('batting');
  const [boxScoreData, setBoxScoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoxScore();
    // Poll for updates if game is live
    if (game.status === 'live') {
      const interval = setInterval(fetchBoxScore, 15000);
      return () => clearInterval(interval);
    }
  }, [game.id]);

  const fetchBoxScore = async () => {
    try {
      const response = await fetch(`/api/college-baseball/boxscore?gameId=${game.id}`);
      const data = await response.json();
      if (data.success) {
        setBoxScoreData(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching box score:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Loading box score...</div>;
  }

  if (!boxScoreData) {
    return <div className="empty-state">No box score data available</div>;
  }

  const renderLineScore = () => {
    const awayLineScore = boxScoreData.awayTeam.lineScore || [];
    const homeLineScore = boxScoreData.homeTeam.lineScore || [];
    const maxInnings = Math.max(awayLineScore.length, homeLineScore.length);
    
    return (
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
                <td key={idx} className="inning-score">{runs || '-'}</td>
              ))}
              <td className="total-score">{boxScoreData.awayTeam.score}</td>
              <td className="total-score">{boxScoreData.awayTeam.hits}</td>
              <td className="total-score">{boxScoreData.awayTeam.errors}</td>
            </tr>
            <tr>
              <td className="team-name">{boxScoreData.homeTeam.team.shortName}</td>
              {homeLineScore.map((runs, idx) => (
                <td key={idx} className="inning-score">{runs || '-'}</td>
              ))}
              <td className="total-score">{boxScoreData.homeTeam.score}</td>
              <td className="total-score">{boxScoreData.homeTeam.hits}</td>
              <td className="total-score">{boxScoreData.homeTeam.errors}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderBattingStats = () => {
    return (
      <div className="batting-stats">
        <div className="team-stats">
          <h3>{boxScoreData.awayTeam.team.shortName}</h3>
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
                {boxScoreData.awayTeam.batting.map((player) => (
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
                    <td className="avg">{player.avg.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="team-stats">
          <h3>{boxScoreData.homeTeam.team.shortName}</h3>
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
                {boxScoreData.homeTeam.batting.map((player) => (
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
                    <td className="avg">{player.avg.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderPitchingStats = () => {
    return (
      <div className="pitching-stats">
        <div className="team-stats">
          <h3>{boxScoreData.awayTeam.team.shortName}</h3>
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
                {boxScoreData.awayTeam.pitching.map((player) => (
                  <tr key={player.playerId} className={player.decision ? 'decision-pitcher' : ''}>
                    <td className="player-col">
                      <span className="player-name">{player.playerName}</span>
                      {player.decision && (
                        <span className="decision">{player.decision}</span>
                      )}
                    </td>
                    <td>{player.innings}</td>
                    <td>{player.hits}</td>
                    <td>{player.runs}</td>
                    <td>{player.earnedRuns}</td>
                    <td>{player.walks}</td>
                    <td>{player.strikeouts}</td>
                    <td>{player.pitches}</td>
                    <td className="era">{player.era.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="team-stats">
          <h3>{boxScoreData.homeTeam.team.shortName}</h3>
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
                {boxScoreData.homeTeam.pitching.map((player) => (
                  <tr key={player.playerId} className={player.decision ? 'decision-pitcher' : ''}>
                    <td className="player-col">
                      <span className="player-name">{player.playerName}</span>
                      {player.decision && (
                        <span className="decision">{player.decision}</span>
                      )}
                    </td>
                    <td>{player.innings}</td>
                    <td>{player.hits}</td>
                    <td>{player.runs}</td>
                    <td>{player.earnedRuns}</td>
                    <td>{player.walks}</td>
                    <td>{player.strikeouts}</td>
                    <td>{player.pitches}</td>
                    <td className="era">{player.era.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="box-score">
      <div className="box-score-header">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="game-info">
          <h2>{boxScoreData.awayTeam.team.name} at {boxScoreData.homeTeam.team.name}</h2>
          <span className="game-date">{game.date || boxScoreData.lastUpdate}</span>
        </div>
      </div>

      {renderLineScore()}

      <div className="stats-tabs">
        <button 
          className={activeTab === 'batting' ? 'active' : ''}
          onClick={() => setActiveTab('batting')}
        >
          Batting
        </button>
        <button 
          className={activeTab === 'pitching' ? 'active' : ''}
          onClick={() => setActiveTab('pitching')}
        >
          Pitching
        </button>
      </div>

      <div className="stats-content">
        {activeTab === 'batting' ? renderBattingStats() : renderPitchingStats()}
      </div>
    </div>
  );
}

export default BoxScore;
