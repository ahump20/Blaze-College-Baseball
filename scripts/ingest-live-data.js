/**
 * Blaze Sports Intel - Live Data Ingestion Script
 *
 * Fetches real, current sports data from SportsDataIO API and populates D1 database.
 * Replaces seed/mock data with live game information for accurate semantic search.
 *
 * Usage:
 *   SPORTSDATA_API_KEY=xxx node scripts/ingest-live-data.js
 *
 * Features:
 * - Fetches recent NFL, MLB, CFB, CBB games
 * - Generates rich, semantic descriptions for each game
 * - Stores in D1 database with proper normalization
 * - Prepares data for embedding generation
 */

const { SPORTSDATA_API_KEY = '', WRANGLER_PATH = '' } = process.env;

if (!SPORTSDATA_API_KEY) {
  console.error(
    'Missing required environment variable: SPORTSDATA_API_KEY. Use API_KEYS_MASTER.js followed by "npm run mcp:sync" to load credentials before running ingest-live-data.'
  );
  process.exit(1);
}

if (!WRANGLER_PATH) {
  console.error(
    'Missing required environment variable: WRANGLER_PATH. Provide the Wrangler CLI path (e.g., via API_KEYS_MASTER.js → npm run mcp:sync or manual export) before running ingest-live-data.'
  );
  process.exit(1);
}
const DATABASE_NAME = 'blazesports-db';

// Current season years
const CURRENT_SEASON = {
  NFL: 2024,    // 2024 season (Sep 2024 - Feb 2025)
  MLB: 2024,    // 2024 season (Apr - Oct 2024)
  CFB: 2024,    // 2024 season (Aug - Jan 2025)
  CBB: 2024     // 2024-2025 season (Nov 2024 - Apr 2025)
};

// API Configuration
const API_BASE = 'https://api.sportsdata.io/v3';
const API_ENDPOINTS = {
  NFL: {
    teams: `/nfl/scores/json/Teams`,
    schedule: `/nfl/scores/json/Schedules/${CURRENT_SEASON.NFL}`,
    scores: `/nfl/scores/json/ScoresByWeek/${CURRENT_SEASON.NFL}/5` // Week 5
  },
  MLB: {
    teams: `/mlb/scores/json/teams`,
    games: `/mlb/scores/json/Games/2024` // Full 2024 season
  },
  CFB: {
    teams: `/cfb/scores/json/Teams`,
    games: `/cfb/scores/json/Games/${CURRENT_SEASON.CFB}`
  },
  CBB: {
    teams: `/cbb/scores/json/Teams`,
    games: `/cbb/scores/json/Games/${CURRENT_SEASON.CBB}`
  }
};

/**
 * Map SportsDataIO season type codes to database values
 * @param {string|number} seasonType - API season type code
 * @returns {string} 'REG' or 'POST'
 */
function mapSeasonType(seasonType) {
  // SportsDataIO codes:
  // 1 = Regular Season
  // 2 = Preseason (treat as REG)
  // 3 = Postseason/Playoffs
  // 4 = All-Star (treat as REG)
  if (!seasonType) return 'REG';

  const code = String(seasonType);
  if (code === '3') return 'POST';

  // Default to REG for all other codes (1, 2, 4, etc.)
  return 'REG';
}

/**
 * Fetch data from SportsDataIO API
 */
async function fetchAPI(sport, endpoint) {
  const url = `${API_BASE}${endpoint}?key=${SPORTSDATA_API_KEY}`;
  console.log(`Fetching: ${sport} - ${endpoint}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Generate rich semantic description for game (for better embeddings)
 */
function generateGameDescription(game, sport) {
  const parts = [];

  // Basic matchup
  parts.push(`${game.away_team_name} at ${game.home_team_name}`);

  // Add sport context
  parts.push(`${sport} game`);

  // Score and outcome
  if (game.status === 'Final' || game.status === 'Completed') {
    const margin = Math.abs(game.home_score - game.away_score);
    const winner = game.home_score > game.away_score ? game.home_team_name : game.away_team_name;

    parts.push(`Final score: ${game.away_team_name} ${game.away_score}, ${game.home_team_name} ${game.home_score}`);
    parts.push(`${winner} won by ${margin} ${sport === 'NFL' || sport === 'CFB' ? 'points' : 'runs'}`);

    // Categorize game
    if (margin <= 3 && (sport === 'NFL' || sport === 'CFB')) {
      parts.push('close game');
      parts.push('one-possession game');
    } else if (margin <= 2 && (sport === 'MLB' || sport === 'CBB')) {
      parts.push('close game');
      parts.push('tight contest');
    } else if (margin >= 20 && (sport === 'NFL' || sport === 'CFB')) {
      parts.push('blowout');
      parts.push('dominant victory');
    } else if (margin >= 10 && (sport === 'MLB' || sport === 'CBB')) {
      parts.push('decisive win');
      parts.push('comfortable margin');
    }
  } else {
    parts.push(`Status: ${game.status}`);
  }

  // Date and venue
  const gameDate = new Date(game.game_date);
  const month = gameDate.toLocaleDateString('en-US', { month: 'long' });
  const day = gameDate.getDate();
  const year = gameDate.getFullYear();

  parts.push(`played on ${month} ${day}, ${year}`);

  if (game.stadium_name) {
    parts.push(`at ${game.stadium_name}`);
  }

  // Week context for football
  if (game.week && (sport === 'NFL' || sport === 'CFB')) {
    parts.push(`Week ${game.week}`);
  }

  // Season context
  parts.push(`${game.season} season`);

  return parts.join('. ');
}

/**
 * Normalize NFL game data from SportsDataIO
 */
function normalizeNFLGame(game) {
  return {
    sport: 'NFL',
    game_id: game.GameKey || game.ScoreID,
    season: game.Season,
    season_type: mapSeasonType(game.SeasonType),
    week: game.Week,
    game_date: game.Date || game.DateTime,
    game_time: game.DateTime ? new Date(game.DateTime).toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: '2-digit', minute: '2-digit' }) : null,
    status: game.Status,
    home_team_id: game.HomeTeamID,
    home_team_key: game.HomeTeam,
    home_team_name: game.HomeTeamName || `${game.HomeTeam}`,
    home_score: game.HomeScore,
    away_team_id: game.AwayTeamID,
    away_team_key: game.AwayTeam,
    away_team_name: game.AwayTeamName || `${game.AwayTeam}`,
    away_score: game.AwayScore,
    stadium_name: game.StadiumDetails?.Name || game.Stadium,
    winning_team_id: game.HomeScore > game.AwayScore ? game.HomeTeamID : game.AwayTeamID
  };
}

/**
 * Normalize MLB game data from SportsDataIO
 */
function normalizeMLBGame(game) {
  return {
    sport: 'MLB',
    game_id: game.GameID,
    season: game.Season,
    season_type: mapSeasonType(game.SeasonType),
    week: null,
    game_date: game.Day || game.DateTime,
    game_time: game.DateTime ? new Date(game.DateTime).toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: '2-digit', minute: '2-digit' }) : null,
    status: game.Status,
    home_team_id: game.HomeTeamID,
    home_team_key: game.HomeTeam,
    home_team_name: game.HomeTeamName || `${game.HomeTeam}`,
    home_score: game.HomeTeamRuns,
    away_team_id: game.AwayTeamID,
    away_team_key: game.AwayTeam,
    away_team_name: game.AwayTeamName || `${game.AwayTeam}`,
    away_score: game.AwayTeamRuns,
    stadium_name: game.StadiumName || game.Stadium,
    winning_team_id: game.HomeTeamRuns > game.AwayTeamRuns ? game.HomeTeamID : game.AwayTeamID
  };
}

/**
 * Normalize CFB game data from SportsDataIO
 */
function normalizeCFBGame(game) {
  return {
    sport: 'CFB',
    game_id: game.GameID,
    season: game.Season,
    season_type: mapSeasonType(game.SeasonType),
    week: game.Week,
    game_date: game.Day || game.DateTime,
    game_time: game.DateTime ? new Date(game.DateTime).toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: '2-digit', minute: '2-digit' }) : null,
    status: game.Status,
    home_team_id: game.HomeTeamID,
    home_team_key: game.HomeTeam,
    home_team_name: game.HomeTeamName || game.HomeTeam,
    home_score: game.HomeTeamScore,
    away_team_id: game.AwayTeamID,
    away_team_key: game.AwayTeam,
    away_team_name: game.AwayTeamName || game.AwayTeam,
    away_score: game.AwayTeamScore,
    stadium_name: game.Stadium,
    winning_team_id: game.HomeTeamScore > game.AwayTeamScore ? game.HomeTeamID : game.AwayTeamID
  };
}

/**
 * Normalize CBB game data from SportsDataIO
 */
function normalizeCBBGame(game) {
  return {
    sport: 'CBB',
    game_id: game.GameID,
    season: game.Season,
    season_type: mapSeasonType(game.SeasonType),
    week: null,
    game_date: game.Day || game.DateTime,
    game_time: game.DateTime ? new Date(game.DateTime).toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: '2-digit', minute: '2-digit' }) : null,
    status: game.Status,
    home_team_id: game.HomeTeamID,
    home_team_key: game.HomeTeam,
    home_team_name: game.HomeTeamName || game.HomeTeam,
    home_score: game.HomeTeamScore,
    away_team_id: game.AwayTeamID,
    away_team_key: game.AwayTeam,
    away_team_name: game.AwayTeamName || game.AwayTeam,
    away_score: game.AwayTeamScore,
    stadium_name: game.Stadium,
    winning_team_id: game.HomeTeamScore > game.AwayTeamScore ? game.HomeTeamID : game.AwayTeamID
  };
}

/**
 * Execute SQL command via wrangler
 */
async function executeSQL(sql) {
  const { execSync } = await import('child_process');

  // Escape SQL for shell
  const escapedSQL = sql.replace(/'/g, "'\\''");

  const command = `${WRANGLER_PATH} d1 execute ${DATABASE_NAME} --remote --command='${escapedSQL}'`;

  try {
    const output = execSync(command, { encoding: 'utf-8' });
    return output;
  } catch (error) {
    console.error('SQL execution failed:', error.message);
    throw error;
  }
}

/**
 * Insert games in batches (D1 has query limits)
 */
async function insertGames(games) {
  const BATCH_SIZE = 10; // Reduced for wrangler command length limits

  for (let i = 0; i < games.length; i += BATCH_SIZE) {
    const batch = games.slice(i, i + BATCH_SIZE);

    const values = batch.map(game => {
      const description = generateGameDescription(game, game.sport);

      // Ensure stadium_name is a string before processing
      const stadiumName = game.stadium_name && typeof game.stadium_name === 'string'
        ? game.stadium_name.replace(/'/g, "''")
        : null;

      return `(
        '${game.sport}',
        '${game.game_id}',
        ${game.season},
        '${game.season_type}',
        ${game.week || 'NULL'},
        '${game.game_date}',
        ${game.game_time ? `'${game.game_time}'` : 'NULL'},
        '${game.status}',
        ${game.home_team_id},
        '${game.home_team_key}',
        '${game.home_team_name.replace(/'/g, "''")}',
        ${game.home_score || 'NULL'},
        ${game.away_team_id},
        '${game.away_team_key}',
        '${game.away_team_name.replace(/'/g, "''")}',
        ${game.away_score || 'NULL'},
        ${stadiumName ? `'${stadiumName}'` : 'NULL'},
        ${game.winning_team_id || 'NULL'},
        '${description.replace(/'/g, "''")}'
      )`;
    }).join(',\n');

    const sql = `
      INSERT INTO games (
        sport, game_id, season, season_type, week,
        game_date, game_time, status,
        home_team_id, home_team_key, home_team_name, home_score,
        away_team_id, away_team_key, away_team_name, away_score,
        stadium_name, winning_team_id, description
      ) VALUES ${values};
    `;

    console.log(`Inserting batch ${i / BATCH_SIZE + 1} (${batch.length} games)...`);
    await executeSQL(sql);
  }
}

/**
 * Main ingestion workflow
 */
async function ingestLiveData() {
  console.log('🔥 Blaze Sports Intel - Live Data Ingestion\n');

  const allGames = [];

  try {
    // 1. Note: Skipping delete since table is already empty
    console.log('📊 Starting fresh data ingestion...\n');

    // 2. Fetch and normalize NFL data (Week 5 games)
    console.log('🏈 Fetching NFL data...');
    const nflGames = await fetchAPI('NFL', API_ENDPOINTS.NFL.scores);
    const normalizedNFL = nflGames
      .filter(game => game.Status === 'Final' || game.Status === 'InProgress')
      .map(normalizeNFLGame);

    console.log(`✅ Found ${normalizedNFL.length} NFL games\n`);
    allGames.push(...normalizedNFL);

    // 3. Fetch and normalize MLB data (recent games)
    console.log('⚾ Fetching MLB data...');
    const mlbGames = await fetchAPI('MLB', API_ENDPOINTS.MLB.games);
    const normalizedMLB = mlbGames
      .filter(game => game.Status === 'Final' && game.Day >= '2024-09-01') // September games
      .slice(0, 100) // Limit to 100 most recent
      .map(normalizeMLBGame);

    console.log(`✅ Found ${normalizedMLB.length} MLB games\n`);
    allGames.push(...normalizedMLB);

    // 4. Fetch and normalize CFB data
    console.log('🏈 Fetching CFB data...');
    try {
      const cfbGames = await fetchAPI('CFB', API_ENDPOINTS.CFB.games);
      const normalizedCFB = cfbGames
        .filter(game => game.Status === 'Final' && game.Week <= 7) // Up to Week 7
        .slice(0, 50) // Limit to 50 games
        .map(normalizeCFBGame);

      console.log(`✅ Found ${normalizedCFB.length} CFB games\n`);
      allGames.push(...normalizedCFB);
    } catch (error) {
      console.warn('⚠️  CFB data unavailable:', error.message);
    }

    // 5. Fetch and normalize CBB data
    console.log('🏀 Fetching CBB data...');
    try {
      const cbbGames = await fetchAPI('CBB', API_ENDPOINTS.CBB.games);
      const normalizedCBB = cbbGames
        .filter(game => game.Status === 'Final')
        .slice(0, 50) // Limit to 50 games
        .map(normalizeCBBGame);

      console.log(`✅ Found ${normalizedCBB.length} CBB games\n`);
      allGames.push(...normalizedCBB);
    } catch (error) {
      console.warn('⚠️  CBB data unavailable (season hasn\'t started):', error.message);
    }

    // 6. Insert all games into database
    console.log(`📊 Inserting ${allGames.length} total games into database...`);
    await insertGames(allGames);

    console.log('\n✅ Live data ingestion complete!');
    console.log(`\n📈 Summary:`);
    console.log(`   - NFL: ${normalizedNFL.length} games`);
    console.log(`   - MLB: ${normalizedMLB.length} games`);
    console.log(`   - CFB: ${allGames.filter(g => g.sport === 'CFB').length} games`);
    console.log(`   - CBB: ${allGames.filter(g => g.sport === 'CBB').length} games`);
    console.log(`   - Total: ${allGames.length} games`);

    console.log('\n🔄 Next steps:');
    console.log('   1. Run embedding generation: node scripts/generate-embeddings.js');
    console.log('   2. Test search: curl -X POST .../api/copilot/search -d \'{"query":"close nfl games"}\'');

  } catch (error) {
    console.error('❌ Ingestion failed:', error);
    throw error;
  }
}

// Run if executed directly
ingestLiveData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { ingestLiveData };
