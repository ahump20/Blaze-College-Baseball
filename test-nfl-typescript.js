/**
 * NFL TypeScript Implementation Test
 * Demonstrates the new truth-enforced NFL adapter pattern
 */

// Import the TypeScript modules (in a real app, these would be .ts imports)
import { getNflTeam, getNflStandings } from './lib/api/nfl.js';
import { toTeamCardView, toStandingsView } from './lib/adapters/nfl.js';

async function testNflImplementation() {
  console.log('🏈 BLAZE REALITY ENFORCER: NFL TypeScript Implementation Test');
  console.log('=' .repeat(60));

  try {
    // Test team endpoint with TypeScript types
    console.log('\n1. Testing NFL Team API (Titans - ID: 10)');
    const teamData = await getNflTeam('10');
    console.log('✅ Team data retrieved:', JSON.stringify(teamData, null, 2).substring(0, 200) + '...');

    // Test team adapter with truth enforcement
    console.log('\n2. Testing NFL Team Adapter (Truth Enforced)');
    const teamViewModel = toTeamCardView(teamData);
    console.log('✅ Team view model:', JSON.stringify(teamViewModel, null, 2));

    // Test standings endpoint
    console.log('\n3. Testing NFL Standings API');
    const standingsData = await getNflStandings();
    console.log('✅ Standings data retrieved:', JSON.stringify(standingsData, null, 2));

    // Test standings adapter
    console.log('\n4. Testing NFL Standings Adapter');
    const standingsViewModel = toStandingsView(standingsData);
    console.log('✅ Standings view model:', JSON.stringify(standingsViewModel, null, 2));

    console.log('\n🎯 TRUTH ENFORCEMENT VERIFICATION:');
    console.log('- Team Data Source:', teamData.analytics?.dataSource || 'MISSING');
    console.log('- Team Truth Label:', teamData.analytics?.truthLabel || 'MISSING');
    console.log('- Standings Data Source:', standingsData.dataSource || 'MISSING');
    console.log('- Standings Truth Label:', standingsData.truthLabel || 'MISSING');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Error details:', error);
  }

  console.log('\n' + '=' .repeat(60));
  console.log('✅ NFL TypeScript Implementation Test Complete');
}

// Run the test
testNflImplementation().catch(console.error);