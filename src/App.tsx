import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import BoxScore from './components/BoxScore';
import LiveGameTracker from './components/LiveGameTracker';
import Standings from './components/Standings';
import { ApiResponse, LiveGame } from './types/baseball';
import './styles/App.css';

type ActiveView = 'live' | 'boxscore' | 'standings';
type ConferenceFilter = 'all' | 'sec' | 'acc' | 'big12' | 'pac12' | 'big10';

const App = (): JSX.Element => {
  const [activeView, setActiveView] = useState<ActiveView>('live');
  const [selectedGame, setSelectedGame] = useState<LiveGame | null>(null);
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedConference, setSelectedConference] = useState<ConferenceFilter>('all');

  const fetchLiveGames = useCallback(async () => {
    try {
      const conferenceParam =
        selectedConference !== 'all' ? `&conference=${selectedConference.toUpperCase()}` : '';
      const response = await fetch(`/api/college-baseball/games${conferenceParam}`);
      const data: ApiResponse<LiveGame[]> = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setLiveGames(data.data);
      } else {
        setLiveGames([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching live games:', error);
      setLiveGames([]);
      setLoading(false);
    }
  }, [selectedConference]);

  useEffect(() => {
    fetchLiveGames();
    const intervalId = window.setInterval(fetchLiveGames, 30000);
    return () => window.clearInterval(intervalId);
  }, [fetchLiveGames]);

  const handleConferenceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedConference(event.target.value as ConferenceFilter);
    setLoading(true);
  };

  const handleGameSelect = useCallback((game: LiveGame) => {
    setSelectedGame(game);
    setActiveView('boxscore');
  }, []);

  const activeViewContent = useMemo(() => {
    switch (activeView) {
      case 'live':
        return (
          <LiveGameTracker games={liveGames} loading={loading} onGameSelect={handleGameSelect} />
        );
      case 'boxscore':
        return selectedGame ? (
          <BoxScore game={selectedGame} onBack={() => setActiveView('live')} />
        ) : (
          <div className="empty-state">Select a game to view details</div>
        );
      case 'standings':
        return <Standings />;
      default:
        return null;
    }
  }, [activeView, liveGames, loading, selectedGame, handleGameSelect]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>College Baseball Live</h1>
          <a href="college-baseball.html" className="info-link">
            ℹ️ Why Blaze? See what makes us different
          </a>
        </div>
        <div className="conference-filter">
          <select value={selectedConference} onChange={handleConferenceChange}>
            <option value="all">All Conferences</option>
            <option value="sec">SEC</option>
            <option value="acc">ACC</option>
            <option value="big12">Big 12</option>
            <option value="pac12">Pac-12</option>
            <option value="big10">Big Ten</option>
          </select>
        </div>
      </header>

      <nav className="bottom-nav">
        <button
          className={activeView === 'live' ? 'active' : ''}
          onClick={() => setActiveView('live')}
        >
          <span className="nav-icon">⚾</span>
          Live
        </button>
        <button
          className={activeView === 'boxscore' ? 'active' : ''}
          onClick={() => setActiveView('boxscore')}
        >
          <span className="nav-icon">📊</span>
          Box Score
        </button>
        <button
          className={activeView === 'standings' ? 'active' : ''}
          onClick={() => setActiveView('standings')}
        >
          <span className="nav-icon">🏆</span>
          Standings
        </button>
      </nav>

      <main className="app-content">{activeViewContent}</main>
    </div>
  );
};

export default App;
