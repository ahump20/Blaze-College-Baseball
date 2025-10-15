# College Baseball Live - The App ESPN Won't Build

## Overview

College Baseball Live is a mobile-first web application designed to provide comprehensive coverage of college baseball - a sport that has been embarrassingly neglected by major sports platforms like ESPN. While ESPN provides full box scores and updated player stats for women's college ping pong, college baseball fans are left with just game scores and innings, with no previews or recaps.

This app addresses that gap by providing:

✅ **Full Box Scores** - Complete batting and pitching statistics for every game  
✅ **Live Game Tracking** - Real-time updates with current pitcher, batter, and game situation  
✅ **Conference Standings** - Up-to-date standings with RPI rankings  
✅ **Mobile-First Design** - Optimized for on-the-go consumption on phones  
✅ **SEC Focus** - Special attention to Texas, LSU, and other SEC powerhouses  

## Why This Matters

College baseball is one of only three sports that can break even or profit for athletic departments (along with football and basketball). Yet it receives almost no digital coverage compared to other sports. When ESPN does cover college baseball, it's typically just one highlight clip from LSU or Texas making a flashy play.

This app is built for fans who are tired of:
- No game previews or recaps
- Limited player statistics
- No comprehensive standings or team information
- Being ignored by major sports platforms

## Features

### 📱 Mobile-First Experience
- Designed primarily for mobile devices where most sports content is consumed
- Touch-optimized interface with bottom navigation
- Responsive design that works on tablets and desktop too
- PWA support for app-like experience

### ⚾ Complete Game Coverage

#### Live Game Tracker
- Real-time score updates every 30 seconds
- Current inning and game situation (outs, runners on base)
- Current pitcher and batter information with stats
- Conference filtering (SEC, ACC, Big 12, Pac-12, Big Ten)
- Game venue and TV network information

#### Full Box Scores
- **Line Score**: Inning-by-inning scoring breakdown
- **Batting Stats**: Complete player statistics including:
  - At-bats (AB), Runs (R), Hits (H), RBI
  - Walks (BB), Strikeouts (K)
  - Season batting average
- **Pitching Stats**: Complete pitcher statistics including:
  - Innings Pitched (IP), Hits (H), Runs (R), Earned Runs (ER)
  - Walks (BB), Strikeouts (K), Pitch Count
  - Season ERA
  - Win/Loss/Save decisions

#### Conference Standings
- Real-time conference and overall records
- RPI (Rating Percentage Index) rankings
- Win/loss streaks
- Home and away records
- Conference leaders in key statistical categories

## Technical Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Mobile-First CSS** - Optimized for small screens first
- **PWA Ready** - Installable web app with manifest.json

### Backend
- **Cloudflare Pages** - Fast, global CDN hosting
- **Cloudflare Workers** - Serverless API functions
- **Cloudflare KV** - Caching layer for performance
- **API Structure**: `/api/college-baseball/*`
  - `/games` - Live and scheduled games
  - `/boxscore` - Detailed game statistics
  - `/standings` - Conference standings

### Performance Optimizations
- **Smart Caching**:
  - Live games: 30 second cache
  - Final games: 1 hour cache
  - Standings: 5 minute cache
- **Lazy Loading**: Components load on demand
- **Optimized Polling**: Only updates when necessary

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment

```bash
# Deploy to Cloudflare Pages
npm run deploy
```

## Project Structure

```
/
├── src/
│   ├── components/          # React components
│   │   ├── LiveGameTracker.jsx
│   │   ├── BoxScore.jsx
│   │   └── Standings.jsx
│   ├── styles/              # CSS modules
│   │   ├── App.css
│   │   ├── LiveGameTracker.css
│   │   ├── BoxScore.css
│   │   └── Standings.css
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── functions/
│   └── api/
│       └── college-baseball/  # API endpoints
│           ├── games.js
│           ├── boxscore.js
│           └── standings.js
├── public/
│   └── manifest.json        # PWA manifest
└── index.html               # HTML template
```

## API Endpoints

### Get Games
```
GET /api/college-baseball/games
Query Parameters:
  - date: YYYY-MM-DD (optional, defaults to today)
  - conference: SEC|ACC|BIG12|PAC12|BIG10 (optional)
  - status: live|scheduled|final (optional)
  - team: team-id (optional)
```

### Get Box Score
```
GET /api/college-baseball/boxscore?gameId={game-id}
Returns: Complete batting and pitching statistics
```

### Get Standings
```
GET /api/college-baseball/standings?conference={conference}
Query Parameters:
  - conference: SEC|ACC|BIG12|PAC12|BIG10 (defaults to SEC)
  - division: D1|D2|D3 (defaults to D1)
```

## Conference Coverage

The app provides comprehensive coverage of all major conferences:

- **SEC** - Including Texas, LSU, Tennessee, Vanderbilt, Arkansas, Florida, and more
- **ACC** - North Carolina, Virginia, Louisville, etc.
- **Big 12** - Oklahoma State, TCU, Texas Tech, etc.
- **Pac-12** - Stanford, Oregon State, UCLA, etc.
- **Big Ten** - Maryland, Nebraska, Indiana, etc.

## Roadmap

### Phase 1 (Current) - MVP Features
- [x] Live game tracking
- [x] Full box scores
- [x] Conference standings
- [x] Mobile-first responsive design
- [x] Conference filtering

### Phase 2 - Enhanced Features
- [ ] Game previews and recaps
- [ ] Player profiles and season stats
- [ ] Team pages with roster information
- [ ] Push notifications for game updates
- [ ] Favorite teams feature
- [ ] Historical game data

### Phase 3 - Advanced Analytics
- [ ] Advanced statistics (OPS, WHIP, etc.)
- [ ] Pitch-by-pitch data
- [ ] Video highlights integration
- [ ] Predictive analytics
- [ ] Fantasy baseball integration

### Phase 4 - Community Features
- [ ] Comment sections
- [ ] User predictions and polls
- [ ] Social sharing
- [ ] Live chat during games

## Why Mobile-First?

Sports content consumption has shifted dramatically to mobile devices. People check scores:
- On the go
- Between classes
- During work breaks
- At other sporting events
- While watching games on TV

This app is optimized for how people actually consume sports content today - primarily on their phones through apps like Twitter and ESPN, but with the comprehensive coverage that ESPN refuses to provide for college baseball.

## Contributing

This project is focused on giving college baseball the coverage it deserves. If you're passionate about college baseball and want to help improve this app, contributions are welcome!

Areas where help is needed:
- Additional data sources and scrapers
- Enhanced statistics and analytics
- Design improvements
- Performance optimizations
- Documentation

## License

MIT License - See LICENSE file for details

## Support

For questions, feedback, or to report issues:
- Create an issue in the GitHub repository
- Focus areas: SEC, Big 12, ACC, Pac-12, Big Ten coverage

---

**Built by fans, for fans. Because college baseball deserves better coverage than ESPN is willing to provide.**
