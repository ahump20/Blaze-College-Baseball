import React, { useState, useEffect } from 'react';
import LiveGameTracker from './components/LiveGameTracker';
import BoxScore from './components/BoxScore';
import Standings from './components/Standings';
import ParticleBackground from './components/ParticleBackground';
import './styles/App.css';

function App() {
  const [activeView, setActiveView] = useState('live');
  const [selectedGame, setSelectedGame] = useState(null);
  const [liveGames, setLiveGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConference, setSelectedConference] = useState('all');

  useEffect(() => {
    // Fetch games on mount and set up polling
    fetchLiveGames();
    const interval = setInterval(fetchLiveGames, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [selectedConference]);

  const fetchLiveGames = async () => {
    try {
      // Fetch all games (live, scheduled, and recent final games)
      const conferenceParam = selectedConference !== 'all' ? `&conference=${selectedConference.toUpperCase()}` : '';
      const response = await fetch(`/api/college-baseball/games${conferenceParam}`);
      const data = await response.json();
      setLiveGames(data.success ? data.data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching live games:', error);
      setLoading(false);
    }
  };

  const handleConferenceChange = (e) => {
    setSelectedConference(e.target.value);
    setLoading(true);
  };

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    setActiveView('boxscore');
  };

  const renderView = () => {
    switch (activeView) {
      case 'live':
        return (
          <LiveGameTracker 
            games={liveGames} 
            onGameSelect={handleGameSelect}
            loading={loading}
          />
        );
      case 'boxscore':
        return selectedGame ? (
          <BoxScore 
            game={selectedGame} 
            onBack={() => setActiveView('live')}
          />
        ) : (
          <div className="empty-state">Select a game to view details</div>
        );
      case 'standings':
        return <Standings />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <ParticleBackground />
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>🔥 BLAZE SPORTS INTEL</h1>
            <p className="tagline">Practice to Play. Blaze Data Wins the Day.</p>
            <p className="subtitle">Deep South Sports Authority • College Baseball</p>
          </div>
          <a href="college-baseball.html" className="info-link">
            ℹ️ Why Blaze?
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

      <main className="app-content">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
