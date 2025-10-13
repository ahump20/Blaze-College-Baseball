# College Baseball Live Tracker

Mobile-first college baseball live game tracker with full box scores - the coverage ESPN refuses to provide.

## Features

- **Live Game Tracking**: Real-time scores, current batter/pitcher, game situation
- **Complete Box Scores**: Full batting and pitching stats with season averages that actually update
- **Conference Standings**: RPI rankings, conference records, stat leaders
- **Mobile-First Design**: Built for how you actually consume sports content
- **SEC Focus** (expandable): Prioritizes SEC games but supports all conferences

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Cloudflare Workers
- **Caching**: Cloudflare KV
- **Database**: Cloudflare D1 (optional, for historical data)
- **Deployment**: Cloudflare Pages + Workers

## Why Cloudflare?

- **Edge deployment**: Sub-100ms response times anywhere
- **Free tier**: Generous limits for early development
- **Integrated stack**: Workers, KV, D1, Pages all work together
- **Simple scaling**: Pay only for what you use

## Quick Start

### Prerequisites

```bash
node >= 18
npm or yarn
wrangler CLI (npm install -g wrangler)
```

### Installation

```bash
# Install dependencies
npm install

# Login to Cloudflare
wrangler login

# Create KV namespace for caching
wrangler kv:namespace create "KV"
# Copy the ID and update wrangler.toml

# Start local dev server
npm run dev

# In another terminal, start the Worker
cd worker
wrangler dev
```

The app will be available at `http://localhost:3000`

## Deployment

### Deploy Backend (Worker)

```bash
cd worker
wrangler deploy
```

### Deploy Frontend (Pages)

```bash
# Build the frontend
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist
```

Or connect your GitHub repo to Cloudflare Pages for automatic deployments.

## Project Structure

```
college-baseball-tracker/
├── src/
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # Global styles
│   ├── main.jsx                # React entry point
│   └── components/
│       ├── LiveGameTracker.jsx # Live games view
│       ├── LiveGameTracker.css
│       ├── BoxScore.jsx        # Detailed box score
│       ├── BoxScore.css
│       ├── Standings.jsx       # Conference standings
│       └── Standings.css
├── worker/
│   ├── index.js                # API endpoints
│   ├── mockData.js             # Mock data structure
│   └── wrangler.toml           # Worker config
├── index.html
├── vite.config.js
└── package.json
```

## Data Integration (Next Steps)

Currently using mock data. Here's how to integrate real data sources:

### NCAA.com Scraping

```javascript
async function scrapeNCAAScoreboard() {
  const response = await fetch('https://www.ncaa.com/scoreboard/baseball/d1');
  const html = await response.text();
  
  // Parse with cheerio or similar
  // Extract: scores, innings, team records, venue
  
  return games;
}
```

### D1Baseball Integration

```javascript
async function scrapeD1Baseball() {
  const response = await fetch('https://d1baseball.com/scores/');
  const html = await response.text();
  
  // Parse live scores and game details
  // D1Baseball has better real-time data than NCAA
  
  return games;
}
```

### Warren Nolan RPI

```javascript
async function fetchRPIData(conference) {
  // Warren Nolan provides RPI rankings
  // https://warrennolan.com/baseball/
  
  return rpiData;
}
```

### Team Athletic Department APIs

Many schools have JSON feeds for their athletic departments:
- `https://texassports.com/sports/baseball/stats`
- `https://lsusports.net/sports/baseball/stats`

### Caching Strategy

```javascript
// Live games: 30 second cache
await env.KV.put('live-games', JSON.stringify(games), {
  expirationTtl: 30
});

// Box scores (live): 15 second cache
await env.KV.put(`boxscore-${gameId}`, data, {
  expirationTtl: 15
});

// Standings: 5 minute cache
await env.KV.put(`standings-${conference}`, data, {
  expirationTtl: 300
});
```

## Mobile Optimization

- Touch-optimized tap targets (minimum 44x44px)
- Horizontal scrolling for tables
- Bottom navigation for thumb access
- Aggressive caching for fast loads
- Service worker for offline support (optional)

## ESPN's Failures (What We're Fixing)

1. **No box scores for college baseball** - We show complete batting/pitching stats
2. **No player stats** - We display season averages that update live
3. **No pitching matchups** - We show starting pitchers and current pitcher/batter
4. **Poor conference coverage** - We prioritize all conferences equally
5. **Desktop-first design** - We're mobile-first where users actually are

## Conference Support Roadmap

- [x] SEC
- [ ] ACC
- [ ] Big 12
- [ ] Pac-12
- [ ] Big Ten
- [ ] Conference USA
- [ ] Sun Belt
- [ ] American Athletic

## Future Features

- [ ] Push notifications for game updates
- [ ] Favorite teams
- [ ] Player stat leaders
- [ ] Historical game data
- [ ] Pitching matchup predictions
- [ ] Live pitch-by-pitch tracking
- [ ] Weather/wind conditions
- [ ] Betting lines integration (optional)
- [ ] Team rosters with player profiles

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Live data updates**: Every 30s
- **API response time**: < 100ms (cached) / < 500ms (uncached)

## Contributing

Data source integration help wanted:
- NCAA.com scraping expertise
- D1Baseball API knowledge
- Conference website parsers
- RPI calculation algorithms

## License

MIT

## Contact

Austin Humphrey - Blaze Sports Intel
Location: Boerne, TX

---

**Note**: This is a working prototype with mock data. Real data integration requires scraping NCAA.com, D1Baseball, and conference websites. The structure is ready - just needs the data pipes connected.
