# Blaze Intelligence: CORRECTED Sports Priority Implementation
## Deep South Sports Authority - January 2025

## CRITICAL: Seasonal Reality Check
**Current Date**: January 2025
**Active Sports**: NCAA Football (CFP Championship), NFL Playoffs, NBA, NCAA Basketball
**Inactive Sports**: MLB (starts April), College Baseball (starts February)

## 1. CORRECTED SPORTS PRIORITY ORDER

### Priority 1: NCAA Football (ACTIVE NOW - CFP Season)
- **Why First**: It's January! College Football Playoff is happening RIGHT NOW
- **Key Focus**: 
  - Texas Longhorns (primary)
  - SEC Championship teams
  - CFP Semifinals and Championship Game
  - Bowl Games (especially Texas teams)
- **Data Needed NOW**: Live CFP scores, Texas game results, SEC standings

### Priority 2: MLB - St. Louis Cardinals
- **Season**: April-October (NOT NOW)
- **January Focus**: Off-season moves, spring training prep
- **Key Focus**: Cardinals roster updates, trade rumors

### Priority 3: NFL - Tennessee Titans
- **Season**: Active (Playoffs happening)
- **Key Focus**: Titans season review, playoff games, draft positioning

### Priority 4: NBA - Memphis Grizzlies
- **Season**: Active (mid-season)
- **Key Focus**: Current standings, Ja Morant updates, Western Conference race

### Priority 5: Youth Sports
- **Texas HS Football**: Season ended (state championships in December)
- **Perfect Game Baseball**: Tournament schedule for spring/summer

### Priority 6: College Baseball
- **Season**: Starts February
- **Key Focus**: Texas, LSU, Vanderbilt, Mississippi State

## 2. IMMEDIATE IMPLEMENTATION TASKS

### A. NCAA Football Data Integration (DO THIS TODAY)

```javascript
// NCAA Football MUST be first - it's the active sport!
const SPORTS_PRIORITY = {
  1: 'ncaa-football',  // FIRST - It's January, CFP is NOW!
  2: 'mlb',           // Second but off-season
  3: 'nfl',           // Third, playoffs active
  4: 'nba',           // Fourth, season active
  5: 'youth-sports',  // Fifth
  6: 'college-baseball' // Sixth, starts February
};

// Seasonal awareness
const CURRENT_ACTIVE_SPORTS = {
  'january': ['ncaa-football', 'nfl', 'nba', 'ncaa-basketball'],
  'february': ['nba', 'college-baseball', 'ncaa-basketball'],
  'march': ['nba', 'mlb-spring', 'college-baseball', 'march-madness'],
  'april': ['mlb', 'nba-playoffs', 'college-baseball'],
  'may': ['mlb', 'nba-playoffs', 'college-baseball'],
  'june': ['mlb', 'nba-finals', 'college-baseball-cws'],
  'july': ['mlb', 'perfect-game'],
  'august': ['mlb', 'nfl-preseason', 'texas-hs-football'],
  'september': ['mlb', 'nfl', 'ncaa-football', 'texas-hs-football'],
  'october': ['mlb-playoffs', 'nfl', 'ncaa-football', 'nba'],
  'november': ['nfl', 'ncaa-football', 'nba', 'texas-hs-playoffs'],
  'december': ['nfl', 'ncaa-football-bowls', 'nba', 'texas-hs-championships']
};
```

### B. Real-Time Data Sources for NCAA Football

1. **ESPN CFB API** (Primary)
   - Endpoint: `https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard`
   - Real-time CFP scores
   - Team rankings
   - Game stats

2. **CFP Official Data**
   - Playoff bracket
   - Championship game info
   - Team profiles

3. **Texas Longhorns Specific**
   - Schedule and results
   - Player stats
   - Recruiting updates

### C. API Restructuring Plan

```javascript
// NEW API structure - NCAA Football FIRST
export const API_ENDPOINTS = {
  // Priority 1: NCAA Football (ACTIVE)
  '/api/ncaa-football/live': getNCAAFootballLive,
  '/api/ncaa-football/cfp': getCFPBracket,
  '/api/ncaa-football/texas': getTexasLonghorns,
  '/api/ncaa-football/sec': getSECStandings,
  '/api/ncaa-football/bowls': getBowlGames,
  
  // Priority 2: MLB (OFF-SEASON)
  '/api/mlb/cardinals': getCardinalsOffseason,
  '/api/mlb/transactions': getMLBTransactions,
  
  // Priority 3: NFL (PLAYOFFS)
  '/api/nfl/playoffs': getNFLPlayoffs,
  '/api/nfl/titans': getTitansUpdate,
  
  // Priority 4: NBA (ACTIVE)
  '/api/nba/grizzlies': getGrizzliesLive,
  '/api/nba/standings': getNBAStandings,
  
  // Priority 5: Youth
  '/api/youth/txhs-football': getTexasHSFootball,
  '/api/youth/perfect-game': getPerfectGameSchedule
};
```

## 3. HOMEPAGE RESTRUCTURE

### Current Problem:
- MLB is featured first (IT'S NOT EVEN IN SEASON!)
- No CFP championship coverage
- Missing Texas Longhorns prominence

### New Structure:

```html
<!-- HERO SECTION: What's happening NOW -->
<section id="active-now">
  <h1>🏈 CFP CHAMPIONSHIP WEEK</h1>
  <div id="cfp-bracket-live"></div>
  <div id="texas-longhorns-spotlight"></div>
</section>

<!-- LIVE SCORES: Only active sports -->
<section id="live-scores">
  <div id="ncaa-football-games"></div>
  <div id="nfl-playoffs"></div>
  <div id="nba-games"></div>
</section>

<!-- OFF-SEASON UPDATES: Lower priority -->
<section id="offseason">
  <div id="mlb-cardinals-news"></div>
  <div id="spring-preview"></div>
</section>
```

## 4. TEXAS & SEC FOCUS IMPLEMENTATION

### Primary Texas Teams (Year-Round Coverage)
1. **Texas Longhorns** (All sports)
2. **Texas A&M Aggies**
3. **Texas Tech Red Raiders**
4. **TCU Horned Frogs**
5. **Baylor Bears**
6. **Houston Cougars**
7. **SMU Mustangs**

### SEC Power Teams
1. **Alabama Crimson Tide**
2. **Georgia Bulldogs**
3. **LSU Tigers**
4. **Tennessee Volunteers**
5. **Auburn Tigers**
6. **Ole Miss Rebels**
7. **Texas A&M** (SEC member)

### Texas High School Coverage
- UIL 6A through 2A classifications
- Dallas/Houston/San Antonio/Austin metro focus
- State championship tracking

## 5. SEASONAL ROTATION LOGIC

```javascript
class SeasonalSportsManager {
  constructor() {
    this.currentMonth = new Date().toLocaleString('en-US', { 
      month: 'long', 
      timeZone: 'America/Chicago' 
    }).toLowerCase();
  }
  
  getActiveSports() {
    // January 2025 - Return what's ACTUALLY happening
    return {
      featured: 'ncaa-football', // CFP Championship!
      active: [
        { sport: 'ncaa-football', priority: 1, event: 'CFP Championship' },
        { sport: 'nfl', priority: 2, event: 'Playoffs' },
        { sport: 'nba', priority: 3, event: 'Regular Season' },
        { sport: 'ncaa-basketball', priority: 4, event: 'Conference Play' }
      ],
      upcoming: [
        { sport: 'college-baseball', startsIn: '3 weeks' },
        { sport: 'mlb', startsIn: '3 months' }
      ],
      offseason: ['mlb', 'texas-hs-football']
    };
  }
  
  getDataUpdateFrequency(sport) {
    const frequencies = {
      'ncaa-football': this.currentMonth === 'january' ? '30 seconds' : '5 minutes',
      'nfl': '1 minute',
      'nba': '2 minutes',
      'mlb': this.currentMonth >= 'april' && this.currentMonth <= 'october' ? '1 minute' : '1 hour',
      'youth-sports': '30 minutes'
    };
    return frequencies[sport] || '15 minutes';
  }
}
```

## 6. REALITY ENFORCER AGENT FIX

### Current Problem:
- Agent thinks MLB is priority #1
- No seasonal awareness
- Missing CFP focus

### Fixed Configuration:

```javascript
const BLAZE_REALITY_ENFORCER = {
  name: 'Deep South Sports Authority Reality Enforcer',
  version: '2.0.0',
  lastUpdated: '2025-01-28',
  
  priorities: {
    seasonal_awareness: true,
    current_season: 'winter',
    
    sports_hierarchy: [
      {
        rank: 1,
        sport: 'NCAA Football',
        reason: 'CFP Championship happening NOW (January 2025)',
        focus: ['Texas Longhorns', 'SEC Teams', 'CFP Games'],
        data_refresh: '30 seconds during games'
      },
      {
        rank: 2,
        sport: 'MLB',
        reason: 'Off-season but Cardinals focus when active',
        focus: ['St. Louis Cardinals'],
        data_refresh: '1 hour (off-season)'
      },
      {
        rank: 3,
        sport: 'NFL',
        reason: 'Playoffs active',
        focus: ['Tennessee Titans', 'Playoff Teams'],
        data_refresh: '1 minute during games'
      },
      {
        rank: 4,
        sport: 'NBA',
        reason: 'Mid-season',
        focus: ['Memphis Grizzlies'],
        data_refresh: '2 minutes during games'
      }
    ]
  },
  
  validation_rules: [
    'NEVER show MLB as #1 priority in January',
    'ALWAYS check current date for seasonal relevance',
    'ALWAYS feature active championships/playoffs',
    'Texas teams get priority within each sport',
    'SEC teams get secondary priority'
  ],
  
  reality_checks: {
    january: {
      must_feature: ['CFP Championship', 'NFL Playoffs', 'NBA'],
      cannot_feature_prominently: ['MLB regular season', 'HS Football regular season'],
      acceptable_preview: ['MLB spring training', 'College baseball']
    }
  }
};
```

## 7. IMMEDIATE ACTION ITEMS

### Today (Priority 1)
1. ✅ Create NCAA Football real-time data integration
2. ✅ Fetch current CFP bracket and scores
3. ✅ Feature Texas Longhorns prominently
4. ✅ Update homepage hero section

### Tomorrow (Priority 2)
1. ⬜ Implement seasonal rotation logic
2. ⬜ Add NFL playoff tracker
3. ⬜ Integrate NBA live scores
4. ⬜ Move MLB to off-season section

### This Week
1. ⬜ Complete Texas/SEC team profiles
2. ⬜ Add recruiting tracker
3. ⬜ Implement Perfect Game tournament calendar
4. ⬜ Create spring sports preview

## 8. SUCCESS METRICS

### Immediate Success (24 hours)
- CFP Championship data live on homepage
- Texas Longhorns featured prominently
- Seasonal accuracy (January = Football focus)

### Week 1 Success
- All active sports have real-time data
- Texas/SEC teams properly prioritized
- Off-season sports in appropriate sections

### Month 1 Success
- Seamless seasonal transitions
- Comprehensive Texas coverage
- Youth sports pipeline tracked
- User engagement with relevant content up 50%

## 9. TECHNICAL DEBT TO ADDRESS

1. **Remove hardcoded MLB-first logic**
2. **Add date-aware content rotation**
3. **Implement proper caching for each sport**
4. **Create sport-specific data validators**
5. **Add fallback for off-season periods**

## 10. REPOSITORY STRUCTURE FIX

```bash
/Users/AustinHumphrey/BSI/
├── api/
│   ├── ncaa-football/     # FIRST PRIORITY
│   │   ├── cfp.js
│   │   ├── texas.js
│   │   ├── sec.js
│   │   └── live-scores.js
│   ├── mlb/              # Second (but off-season)
│   │   ├── cardinals.js
│   │   └── transactions.js
│   ├── nfl/              # Third
│   │   ├── titans.js
│   │   └── playoffs.js
│   ├── nba/              # Fourth
│   │   └── grizzlies.js
│   ├── youth-sports/     # Fifth
│   │   ├── texas-hs.js
│   │   └── perfect-game.js
│   └── college-baseball/ # Sixth
│       ├── texas.js
│       └── sec.js
├── components/
│   ├── CFPBracket.js     # New - featured component
│   ├── TexasSpotlight.js # New - primary focus
│   └── SeasonalRotator.js # New - smart content
└── data/
    └── seasonal-config.json # Sport priorities by month
```

---

## CONCLUSION

The fundamental issue is that we're showing MLB (off-season) as the primary sport in January when CFP Championship games are happening RIGHT NOW. This plan corrects that by:

1. **Putting NCAA Football FIRST** (it's actually being played now!)
2. **Featuring Texas Longhorns** as the primary team
3. **Adding seasonal awareness** to prevent this mistake
4. **Focusing on Deep South** regional pride
5. **Showing what fans care about NOW**, not in 3 months

This isn't just a reordering - it's about showing REALITY. Fans visiting in January want CFP scores, not MLB stats from last October!