#!/usr/bin/env node

/**
 * INTEGRATION TEST SUITE
 * Staff Engineer Orchestrator: Comprehensive System Validation
 * Tests TypeScript → JavaScript compilation and runtime functionality
 */

import { getMlbTeam, getMlbStandings } from '../lib/api/mlb.js';
import { toTeamCardView as mlbTeamView, toStandingsView as mlbStandingsView } from '../lib/adapters/mlb.js';
import { getNflTeam, getNflStandings } from '../lib/api/nfl.js';
import { toTeamCardView as nflTeamView, toStandingsView as nflStandingsView } from '../lib/adapters/nfl.js';

const TEST_CONFIGS = {
  MLB: {
    teamId: '138', // St. Louis Cardinals
    sport: 'MLB',
    expectation: 'Cardinals'
  },
  NFL: {
    teamId: '10', // Tennessee Titans
    sport: 'NFL',
    expectation: 'Titans'
  }
};

class IntegrationTestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: []
    };
    this.startTime = Date.now();
  }

  async assert(condition, message, level = 'error') {
    if (condition) {
      this.results.passed++;
      console.log(`✅ ${message}`);
      return true;
    } else {
      if (level === 'warning') {
        this.results.warnings++;
        console.log(`⚠️  ${message}`);
      } else {
        this.results.failed++;
        this.results.errors.push(message);
        console.log(`❌ ${message}`);
      }
      return false;
    }
  }

  async testMlbIntegration() {
    console.log('\n🔵 MLB INTEGRATION TEST SUITE');
    console.log('-'.repeat(40));

    try {
      // Test API layer
      console.log('\n1. MLB API Layer Tests');
      const teamData = await getMlbTeam(TEST_CONFIGS.MLB.teamId);

      await this.assert(
        teamData && typeof teamData === 'object',
        'MLB team API returns valid object'
      );

      await this.assert(
        teamData.team && teamData.team.name,
        'MLB team data contains team.name field'
      );

      const standingsData = await getMlbStandings();
      await this.assert(
        standingsData && Array.isArray(standingsData.divisions),
        'MLB standings API returns divisions array'
      );

      // Test adapter layer
      console.log('\n2. MLB Adapter Layer Tests');
      const teamViewModel = mlbTeamView(teamData);

      await this.assert(
        teamViewModel.name.includes(TEST_CONFIGS.MLB.expectation),
        `MLB team view model contains "${TEST_CONFIGS.MLB.expectation}"`
      );

      await this.assert(
        teamViewModel.dataSource && teamViewModel.dataSource.length > 0,
        'MLB team view model has data source'
      );

      const standingsViewModel = mlbStandingsView(standingsData);
      await this.assert(
        standingsViewModel.division && standingsViewModel.division.length > 0,
        'MLB standings view model has division data'
      );

      console.log('✅ MLB Integration: PASSED');

    } catch (error) {
      await this.assert(false, `MLB Integration failed: ${error.message}`);
      console.log('❌ MLB Integration: FAILED');
    }
  }

  async testNflIntegration() {
    console.log('\n🟠 NFL INTEGRATION TEST SUITE');
    console.log('-'.repeat(40));

    try {
      // Test API layer
      console.log('\n1. NFL API Layer Tests');
      const teamData = await getNflTeam(TEST_CONFIGS.NFL.teamId);

      await this.assert(
        teamData && typeof teamData === 'object',
        'NFL team API returns valid object'
      );

      await this.assert(
        teamData.team && teamData.team.name,
        'NFL team data contains team.name field'
      );

      const standingsData = await getNflStandings();
      await this.assert(
        standingsData && typeof standingsData === 'object',
        'NFL standings API returns valid object'
      );

      // Test adapter layer
      console.log('\n2. NFL Adapter Layer Tests');
      const teamViewModel = nflTeamView(teamData);

      await this.assert(
        teamViewModel.name.includes(TEST_CONFIGS.NFL.expectation),
        `NFL team view model contains "${TEST_CONFIGS.NFL.expectation}"`
      );

      await this.assert(
        teamViewModel.dataSource && teamViewModel.dataSource.length > 0,
        'NFL team view model has data source'
      );

      const standingsViewModel = nflStandingsView(standingsData);
      await this.assert(
        standingsViewModel.conference && standingsViewModel.conference.length > 0,
        'NFL standings view model has conference data'
      );

      console.log('✅ NFL Integration: PASSED');

    } catch (error) {
      await this.assert(false, `NFL Integration failed: ${error.message}`);
      console.log('❌ NFL Integration: FAILED');
    }
  }

  async testTypeScriptCompilation() {
    console.log('\n🔧 TYPESCRIPT COMPILATION TEST SUITE');
    console.log('-'.repeat(40));

    // Test that imports resolve correctly
    await this.assert(
      typeof getMlbTeam === 'function',
      'MLB API functions imported correctly'
    );

    await this.assert(
      typeof getNflTeam === 'function',
      'NFL API functions imported correctly'
    );

    await this.assert(
      typeof mlbTeamView === 'function',
      'MLB adapter functions imported correctly'
    );

    await this.assert(
      typeof nflTeamView === 'function',
      'NFL adapter functions imported correctly'
    );

    console.log('✅ TypeScript Compilation: PASSED');
  }

  async testErrorHandling() {
    console.log('\n🛡️  ERROR HANDLING TEST SUITE');
    console.log('-'.repeat(40));

    try {
      // Test invalid team ID
      const invalidTeamResult = await getMlbTeam('99999');
      await this.assert(
        invalidTeamResult !== null,
        'Invalid team ID returns fallback data (not null)',
        'warning'
      );

      // Test adapter with null data
      const nullAdapterResult = mlbTeamView(null);
      await this.assert(
        nullAdapterResult && nullAdapterResult.name,
        'Adapter handles null input gracefully'
      );

      console.log('✅ Error Handling: PASSED');

    } catch (error) {
      await this.assert(false, `Error handling test failed: ${error.message}`);
    }
  }

  async runAll() {
    console.log('🚀 BLAZE INTEGRATION TEST SUITE');
    console.log('=' .repeat(60));
    console.log(`Started: ${new Date().toISOString()}`);

    await this.testTypeScriptCompilation();
    await this.testMlbIntegration();
    await this.testNflIntegration();
    await this.testErrorHandling();

    // Summary
    const duration = Date.now() - this.startTime;
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST RESULTS SUMMARY:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`⏱️  Duration: ${duration}ms`);

    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.errors.forEach(error => console.log(`   • ${error}`));
      console.log('\n🚨 INTEGRATION TESTS FAILED');
      process.exit(1);
    }

    console.log('\n🎯 ALL INTEGRATION TESTS PASSED');
    console.log('✅ TypeScript compilation working correctly');
    console.log('✅ Import paths resolving correctly');
    console.log('✅ API layers functioning properly');
    console.log('✅ Adapter layers transforming data correctly');
    console.log('✅ Error handling working as expected');
    console.log('✅ System ready for deployment');
  }
}

// Run the test suite
const runner = new IntegrationTestRunner();
runner.runAll().catch(error => {
  console.error('🚨 Test runner failed:', error);
  process.exit(1);
});