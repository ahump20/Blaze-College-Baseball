import { ChangeEvent, FC, useEffect, useState } from 'react';
import { ApiResponse, StandingsData, StandingsEntry } from '../types/baseball';
import '../styles/Standings.css';

type ConferenceOption = 'sec' | 'acc' | 'big12' | 'pac12' | 'big10';

const createEmptyLeaders = (): StandingsData['leaders'] => ({
  batting: [],
  homeruns: [],
  era: [],
  strikeouts: [],
});

const Standings: FC = () => {
  const [conference, setConference] = useState<ConferenceOption>('sec');
  const [standingsData, setStandingsData] = useState<StandingsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStandings = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/college-baseball/standings?conference=${conference.toUpperCase()}`
        );
        const data: ApiResponse<StandingsEntry[]> = await response.json();

        if (data.success && Array.isArray(data.data)) {
          setStandingsData({
            teams: data.data,
            leaders: createEmptyLeaders(),
          });
        } else {
          setStandingsData(null);
        }
      } catch (error) {
        console.error('Error fetching standings:', error);
        setStandingsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [conference]);

  const handleConferenceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setConference(event.target.value as ConferenceOption);
  };

  if (loading) {
    return <div className="loading-state">Loading standings...</div>;
  }

  if (!standingsData) {
    return <div className="empty-state">No standings data available</div>;
  }

  return (
    <div className="standings">
      <div className="standings-header">
        <h2>Conference Standings</h2>
        <select value={conference} onChange={handleConferenceChange} className="conference-select">
          <option value="sec">SEC</option>
          <option value="acc">ACC</option>
          <option value="big12">Big 12</option>
          <option value="pac12">Pac-12</option>
          <option value="big10">Big Ten</option>
        </select>
      </div>

      <div className="standings-table-wrapper">
        <table className="standings-table">
          <thead>
            <tr>
              <th className="rank-col">#</th>
              <th className="team-col">Team</th>
              <th>Conf</th>
              <th>Overall</th>
              <th>RPI</th>
              <th className="hide-mobile">Home</th>
              <th className="hide-mobile">Away</th>
              <th className="hide-mobile">Streak</th>
            </tr>
          </thead>
          <tbody>
            {standingsData.teams.map((team, idx) => {
              const streakValue =
                team.streakType && typeof team.streakCount === 'number'
                  ? `${team.streakType}${team.streakCount}`
                  : '—';
              const streakClass =
                team.streakType === 'W' ? 'win-streak' : team.streakType === 'L' ? 'loss-streak' : '';

              return (
                <tr key={team.team.id} className={idx < 2 ? 'tournament-team' : ''}>
                  <td className="rank-col">{team.rank ?? idx + 1}</td>
                  <td className="team-col">
                    <span className="team-name">{team.team.name}</span>
                  </td>
                  <td className="record">
                    <span className="wins">{team.conferenceRecord.wins}</span>-
                    <span className="losses">{team.conferenceRecord.losses}</span>
                  </td>
                  <td className="record">
                    <span className="wins">{team.overallRecord.wins}</span>-
                    <span className="losses">{team.overallRecord.losses}</span>
                  </td>
                  <td className="rpi">
                    <span className="rpi-value">
                      {typeof team.rpi === 'number' ? team.rpi.toFixed(4) : 'N/A'}
                    </span>
                  </td>
                  <td className="hide-mobile record-small">
                    {team.overallRecord.wins}-{team.overallRecord.losses}
                  </td>
                  <td className="hide-mobile record-small">
                    {team.overallRecord.wins}-{team.overallRecord.losses}
                  </td>
                  <td className="hide-mobile streak">
                    <span className={streakClass}>{streakValue}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="standings-legend">
        <span className="tournament-indicator">■</span> NCAA Tournament Position
      </div>

      {(standingsData.leaders.batting.length > 0 ||
        standingsData.leaders.homeruns.length > 0 ||
        standingsData.leaders.era.length > 0 ||
        standingsData.leaders.strikeouts.length > 0) && (
        <div className="stat-leaders">
          <h3>Conference Leaders</h3>
          <div className="leaders-grid">
            {standingsData.leaders.batting.length > 0 && (
              <div className="leader-category">
                <h4>Batting Average</h4>
                {standingsData.leaders.batting.map((player, idx) => (
                  <div key={idx} className="leader-item">
                    <span className="player-rank">{idx + 1}.</span>
                    <span className="player-name">{player.name}</span>
                    <span className="player-team">{player.team}</span>
                    <span className="player-stat">{player.avg}</span>
                  </div>
                ))}
              </div>
            )}

            {standingsData.leaders.homeruns.length > 0 && (
              <div className="leader-category">
                <h4>Home Runs</h4>
                {standingsData.leaders.homeruns.map((player, idx) => (
                  <div key={idx} className="leader-item">
                    <span className="player-rank">{idx + 1}.</span>
                    <span className="player-name">{player.name}</span>
                    <span className="player-team">{player.team}</span>
                    <span className="player-stat">{player.hr}</span>
                  </div>
                ))}
              </div>
            )}

            {standingsData.leaders.era.length > 0 && (
              <div className="leader-category">
                <h4>ERA</h4>
                {standingsData.leaders.era.map((player, idx) => (
                  <div key={idx} className="leader-item">
                    <span className="player-rank">{idx + 1}.</span>
                    <span className="player-name">{player.name}</span>
                    <span className="player-team">{player.team}</span>
                    <span className="player-stat">{player.era}</span>
                  </div>
                ))}
              </div>
            )}

            {standingsData.leaders.strikeouts.length > 0 && (
              <div className="leader-category">
                <h4>Strikeouts</h4>
                {standingsData.leaders.strikeouts.map((player, idx) => (
                  <div key={idx} className="leader-item">
                    <span className="player-rank">{idx + 1}.</span>
                    <span className="player-name">{player.name}</span>
                    <span className="player-team">{player.team}</span>
                    <span className="player-stat">{player.k}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Standings;
