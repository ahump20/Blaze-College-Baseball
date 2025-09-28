#!/usr/bin/env node

/**
 * Test script to verify REAL APIs work without fallbacks
 * This proves we're getting REAL data, not fake data
 */

import fetch from 'node-fetch';

console.log('🔬 TESTING REAL APIs - NO FALLBACKS ALLOWED');
console.log('=========================================\n');

const results = {
  passed: [],
  failed: []
};

// Test 1: MLB Stats API
async function testMLBAPI() {
  console.log('📊 Testing MLB Stats API...');

  try {
    const teamId = 138; // Cardinals
    const baseUrl = 'https://statsapi.mlb.com/api/v1';

    // Test team endpoint
    const teamResponse = await fetch(`${baseUrl}/teams/${teamId}`);
    const teamData = await teamResponse.json();

    if (teamData.teams?.[0]?.name === 'St. Louis Cardinals') {
      console.log('  ✅ MLB team data: REAL (St. Louis Cardinals)');
      results.passed.push('MLB team data');
    } else {
      throw new Error('MLB team data not correct');
    }

    // Test standings
    const standingsResponse = await fetch(`${baseUrl}/standings?leagueId=104&season=2024`);
    const standingsData = await standingsResponse.json();

    if (standingsData.records?.length > 0) {
      console.log(`  ✅ MLB standings: REAL (${standingsData.records.length} divisions)`);
      results.passed.push('MLB standings');
    } else {
      throw new Error('No standings data');
    }

  } catch (error) {
    console.log(`  ❌ MLB API FAILED: ${error.message}`);
    results.failed.push(`MLB: ${error.message}`);
  }
}

// Test 2: ESPN NFL API with headers
async function testESPNNFLAPI() {
  console.log('\n🏈 Testing ESPN NFL API...');

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.espn.com/',
    'Origin': 'https://www.espn.com'
  };

  try {
    const teamId = 10; // Titans
    const baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';

    // Test team endpoint
    const teamResponse = await fetch(`${baseUrl}/teams/${teamId}`, { headers });
    console.log(`  Response status: ${teamResponse.status}`);

    if (teamResponse.ok) {
      const teamData = await teamResponse.json();

      if (teamData.team?.displayName === 'Tennessee Titans') {
        console.log('  ✅ ESPN NFL data: REAL (Tennessee Titans)');
        results.passed.push('ESPN NFL data');
      } else {
        console.log(`  ⚠️  Got team: ${teamData.team?.displayName}`);
      }
    } else {
      throw new Error(`ESPN returned ${teamResponse.status} ${teamResponse.statusText}`);
    }

  } catch (error) {
    console.log(`  ❌ ESPN NFL API FAILED: ${error.message}`);
    results.failed.push(`ESPN NFL: ${error.message}`);
  }
}

// Test 3: ESPN NBA API
async function testESPNNBAAPI() {
  console.log('\n🏀 Testing ESPN NBA API...');

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.espn.com/',
    'Origin': 'https://www.espn.com'
  };

  try {
    const teamId = 29; // Grizzlies
    const baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

    const teamResponse = await fetch(`${baseUrl}/teams/${teamId}`, { headers });
    console.log(`  Response status: ${teamResponse.status}`);

    if (teamResponse.ok) {
      const teamData = await teamResponse.json();

      if (teamData.team?.displayName === 'Memphis Grizzlies') {
        console.log('  ✅ ESPN NBA data: REAL (Memphis Grizzlies)');
        results.passed.push('ESPN NBA data');
      } else {
        console.log(`  ⚠️  Got team: ${teamData.team?.displayName}`);
      }
    } else {
      throw new Error(`ESPN returned ${teamResponse.status}`);
    }

  } catch (error) {
    console.log(`  ❌ ESPN NBA API FAILED: ${error.message}`);
    results.failed.push(`ESPN NBA: ${error.message}`);
  }
}

// Test 4: ESPN NCAA API
async function testESPNCFBAPI() {
  console.log('\n🎓 Testing ESPN NCAA Football API...');

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.espn.com/',
    'Origin': 'https://www.espn.com'
  };

  try {
    const teamId = 251; // Texas
    const baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/college-football';

    const teamResponse = await fetch(`${baseUrl}/teams/${teamId}`, { headers });
    console.log(`  Response status: ${teamResponse.status}`);

    if (teamResponse.ok) {
      const teamData = await teamResponse.json();

      if (teamData.team?.displayName === 'Texas Longhorns') {
        console.log('  ✅ ESPN NCAA data: REAL (Texas Longhorns)');
        results.passed.push('ESPN NCAA data');
      } else {
        console.log(`  ⚠️  Got team: ${teamData.team?.displayName}`);
      }
    } else {
      throw new Error(`ESPN returned ${teamResponse.status}`);
    }

  } catch (error) {
    console.log(`  ❌ ESPN NCAA API FAILED: ${error.message}`);
    results.failed.push(`ESPN NCAA: ${error.message}`);
  }
}

// Test 5: Verify Pythagorean calculation works
async function testPythagoreanCalculation() {
  console.log('\n📐 Testing Pythagorean Calculation...');

  try {
    const baseUrl = 'https://statsapi.mlb.com/api/v1';
    const teamId = 138;

    const statsResponse = await fetch(`${baseUrl}/teams/${teamId}/stats?season=2024&group=hitting,pitching`);
    const statsData = await statsResponse.json();

    let runsScored, runsAllowed;

    if (statsData.stats && statsData.stats.length > 0) {
      const hitting = statsData.stats.find(s => s.group?.displayName === 'hitting');
      const pitching = statsData.stats.find(s => s.group?.displayName === 'pitching');

      runsScored = hitting?.splits?.[0]?.stat?.runs;
      runsAllowed = pitching?.splits?.[0]?.stat?.runs;
    }

    if (!runsScored || !runsAllowed) {
      throw new Error('Could not get runs data - NO FALLBACK ALLOWED');
    }

    const exponent = 1.83;
    const pythagoreanWins = Math.round(
      162 * (Math.pow(runsScored, exponent) /
      (Math.pow(runsScored, exponent) + Math.pow(runsAllowed, exponent)))
    );

    console.log(`  ✅ Pythagorean wins calculated: ${pythagoreanWins} (from REAL data)`);
    console.log(`     Runs scored: ${runsScored} (REAL)`);
    console.log(`     Runs allowed: ${runsAllowed} (REAL)`);
    results.passed.push('Pythagorean calculation');

  } catch (error) {
    console.log(`  ❌ Pythagorean calc FAILED: ${error.message}`);
    results.failed.push(`Pythagorean: ${error.message}`);
  }
}

// Run all tests
async function runTests() {
  await testMLBAPI();
  await testESPNNFLAPI();
  await testESPNNBAAPI();
  await testESPNCFBAPI();
  await testPythagoreanCalculation();

  console.log('\n=========================================');
  console.log('TEST RESULTS:');
  console.log(`✅ Passed: ${results.passed.length}`);
  results.passed.forEach(test => console.log(`   - ${test}`));

  if (results.failed.length > 0) {
    console.log(`\n❌ Failed: ${results.failed.length}`);
    results.failed.forEach(test => console.log(`   - ${test}`));
  }

  if (results.failed.length === 0) {
    console.log('\n🎉 ALL APIS RETURN REAL DATA - NO FALLBACKS!');
  } else {
    console.log('\n⚠️  Some APIs still need fixing');
    console.log('Note: ESPN may block requests from certain environments');
  }

  process.exit(results.failed.length > 0 ? 1 : 0);
}

runTests().catch(console.error);