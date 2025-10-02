#!/usr/bin/env node

/**
 * Blaze Sports Intel - Live Standings Fetcher
 * Fetches current standings from ESPN APIs for NFL, NCAA Football (SEC), and MLB
 * Data verified as of October 1, 2025
 */

import https from 'https';
import fs from 'fs';

// ESPN API Base URLs
const ESPN_API = {
  NFL_TEAMS: 'http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams',
  NCAA_TEAMS: 'http://site.api.espn.com/apis/site/v2/sports/football/college-football/teams',
  NCAA_SCOREBOARD: 'http://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard',
  MLB_TEAMS: 'http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams',
  NFL_SCOREBOARD: 'http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
  MLB_SCOREBOARD: 'http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard'
};

// Fetch data from URL
function fetchData(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'BlazeSportsIntel/1.0',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`Failed to parse JSON from ${url}: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed for ${url}: ${error.message}`));
    });

    req.end();
  });
}

// Fetch NFL Standings (All 32 Teams)
async function fetchNFLStandings() {
  console.log('\n🏈 Fetching NFL Standings...\n');

  try {
    const teamsData = await fetchData(ESPN_API.NFL_TEAMS);
    const teams = teamsData.sports?.[0]?.leagues?.[0]?.teams || [];

    const standings = teams.map(teamWrapper => {
      const team = teamWrapper.team;
      const record = team.record?.items?.find(r => r.type === 'total') || {};

      return {
        name: team.displayName,
        abbreviation: team.abbreviation,
        division: team.groups?.conferenceStanding?.name || 'Unknown',
        wins: record.stats?.find(s => s.name === 'wins')?.value || 0,
        losses: record.stats?.find(s => s.name === 'losses')?.value || 0,
        ties: record.stats?.find(s => s.name === 'ties')?.value || 0,
        winPct: record.stats?.find(s => s.name === 'winPercent')?.value || 0,
        pointsFor: record.stats?.find(s => s.name === 'pointsFor')?.value || 0,
        pointsAgainst: record.stats?.find(s => s.name === 'pointsAgainst')?.value || 0,
        streak: record.stats?.find(s => s.name === 'streak')?.displayValue || '-'
      };
    });

    // Sort by division and record
    standings.sort((a, b) => {
      if (a.division !== b.division) return a.division.localeCompare(b.division);
      return b.winPct - a.winPct;
    });

    standings.forEach((team, index) => {
      const record = team.ties > 0 ? `${team.wins}-${team.losses}-${team.ties}` : `${team.wins}-${team.losses}`;
      console.log(`${(index + 1).toString().padStart(2)}. ${team.name.padEnd(30)} ${record.padEnd(8)} ${team.division}`);
    });

    return standings;
  } catch (error) {
    console.error('❌ NFL fetch error:', error.message);
    return [];
  }
}

// Fetch SEC Football Standings (All 16 Teams)
async function fetchSECStandings() {
  console.log('\n🏆 Fetching SEC Football Standings...\n');

  try {
    // Fetch with SEC group filter (group 8 = SEC)
    const url = `${ESPN_API.NCAA_SCOREBOARD}?groups=8&limit=100`;
    const scoreboardData = await fetchData(url);

    // Get all SEC teams from scoreboard
    const teamMap = new Map();

    if (scoreboardData.events) {
      scoreboardData.events.forEach(event => {
        event.competitions?.[0]?.competitors?.forEach(competitor => {
          const team = competitor.team;
          if (team && team.conferenceId === '8') { // SEC conference ID
            if (!teamMap.has(team.id)) {
              teamMap.set(team.id, {
                id: team.id,
                name: team.displayName,
                abbreviation: team.abbreviation,
                overall: competitor.records?.find(r => r.type === 'total')?.summary || '0-0',
                conference: competitor.records?.find(r => r.type === 'vsconf')?.summary || '0-0',
                wins: parseInt(competitor.records?.find(r => r.type === 'total')?.wins || 0),
                losses: parseInt(competitor.records?.find(r => r.type === 'total')?.losses || 0),
                confWins: parseInt(competitor.records?.find(r => r.type === 'vsconf')?.wins || 0),
                confLosses: parseInt(competitor.records?.find(r => r.type === 'vsconf')?.losses || 0)
              });
            }
          }
        });
      });
    }

    const standings = Array.from(teamMap.values());

    // Sort by conference wins, then overall wins
    standings.sort((a, b) => {
      if (b.confWins !== a.confWins) return b.confWins - a.confWins;
      return b.wins - a.wins;
    });

    standings.forEach((team, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${team.name.padEnd(25)} Overall: ${team.overall.padEnd(8)} SEC: ${team.conference}`);
    });

    return standings;
  } catch (error) {
    console.error('❌ SEC fetch error:', error.message);
    return [];
  }
}

// Fetch MLB Standings (All 30 Teams)
async function fetchMLBStandings() {
  console.log('\n⚾ Fetching MLB Standings...\n');

  try {
    const teamsData = await fetchData(ESPN_API.MLB_TEAMS);
    const teams = teamsData.sports?.[0]?.leagues?.[0]?.teams || [];

    const standings = teams.map(teamWrapper => {
      const team = teamWrapper.team;
      const record = team.record?.items?.find(r => r.type === 'total') || {};

      return {
        name: team.displayName,
        abbreviation: team.abbreviation,
        division: team.groups?.divisionStanding?.name || 'Unknown',
        wins: record.stats?.find(s => s.name === 'wins')?.value || 0,
        losses: record.stats?.find(s => s.name === 'losses')?.value || 0,
        winPct: record.stats?.find(s => s.name === 'winPercent')?.value || 0,
        gamesBack: record.stats?.find(s => s.name === 'gamesBehind')?.displayValue || '0.0',
        streak: record.stats?.find(s => s.name === 'streak')?.displayValue || '-',
        runDiff: record.stats?.find(s => s.name === 'differential')?.value || 0
      };
    });

    // Sort by division and record
    standings.sort((a, b) => {
      if (a.division !== b.division) return a.division.localeCompare(b.division);
      return b.winPct - a.winPct;
    });

    standings.forEach((team, index) => {
      const record = `${team.wins}-${team.losses}`;
      console.log(`${(index + 1).toString().padStart(2)}. ${team.name.padEnd(30)} ${record.padEnd(10)} GB: ${team.gamesBack.padEnd(6)} ${team.division}`);
    });

    return standings;
  } catch (error) {
    console.error('❌ MLB fetch error:', error.message);
    return [];
  }
}

// Main execution
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  🔥 BLAZE SPORTS INTEL - LIVE STANDINGS FETCHER');
  console.log('  Data current as of: October 1, 2025');
  console.log('═══════════════════════════════════════════════════════════');

  const results = {
    nfl: await fetchNFLStandings(),
    sec: await fetchSECStandings(),
    mlb: await fetchMLBStandings(),
    timestamp: new Date().toISOString(),
    timezone: 'America/Chicago'
  };

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  ✅ FETCH COMPLETE');
  console.log(`  NFL Teams: ${results.nfl.length}/32`);
  console.log(`  SEC Teams: ${results.sec.length}/16`);
  console.log(`  MLB Teams: ${results.mlb.length}/30`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Write to JSON file for integration
  fs.writeFileSync(
    '/Users/AustinHumphrey/BSI/data/live-standings-2025-10-01.json',
    JSON.stringify(results, null, 2)
  );

  console.log('📊 Data saved to: data/live-standings-2025-10-01.json\n');
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
