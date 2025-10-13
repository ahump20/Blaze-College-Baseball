#!/usr/bin/env node

/**
 * College Baseball API Endpoints Test Suite
 * Tests college baseball API endpoints for functionality and data integrity
 */

const API_BASE = process.env.API_BASE || 'https://blazesportsintel.com';

class CollegeBaseballTester {
  constructor() {
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  async test(name, testFunction) {
    this.totalTests++;
    try {
      const result = await testFunction();
      if (result) {
        console.log(`✅ ${name}`);
        this.passedTests++;
      } else {
        console.log(`❌ ${name} - Test returned false`);
        this.failedTests++;
      }
    } catch (error) {
      console.log(`❌ ${name} - ${error.message}`);
      this.failedTests++;
    }
  }

  async runAllTests() {
    console.log('⚾ Starting College Baseball API Tests');
    console.log('='.repeat(60));
    console.log(`Testing against: ${API_BASE}`);
    console.log('');

    await this.testStandingsEndpoint();
    await this.testTeamsEndpoint();
    await this.testTeamsWithConferenceFilter();
    await this.testSpecificTeamEndpoint();
    await this.testResponseStructure();

    this.printSummary();
  }

  async testStandingsEndpoint() {
    await this.test('GET /api/college-baseball/standings', async () => {
      const response = await fetch(`${API_BASE}/api/college-baseball/standings`);
      return response.ok;
    });

    await this.test('GET /api/college-baseball/standings?conference=SEC', async () => {
      const response = await fetch(`${API_BASE}/api/college-baseball/standings?conference=SEC`);
      const data = await response.json();
      return response.ok && data.conference === 'SEC';
    });

    await this.test('Standings include season year', async () => {
      const response = await fetch(`${API_BASE}/api/college-baseball/standings`);
      const data = await response.json();
      return data.season && typeof data.season === 'number';
    });

    await this.test('Standings include teams array', async () => {
      const response = await fetch(`${API_BASE}/api/college-baseball/standings`);
      const data = await response.json();
      return Array.isArray(data.teams);
    });
  }

  async testTeamsEndpoint() {
    await this.test('GET /api/college-baseball/teams', async () => {
      const response = await fetch(`${API_BASE}/api/college-baseball/teams`);
      const data = await response.json();
      return response.ok && data.count > 0 && Array.isArray(data.teams);
    });
  }

  async testTeamsWithConferenceFilter() {
    await this.test('GET /api/college-baseball/teams?conference=SEC', async () => {
      const response = await fetch(`${API_BASE}/api/college-baseball/teams?conference=SEC`);
      const data = await response.json();
      
      if (!response.ok || !Array.isArray(data.teams)) {
        return false;
      }

      // All teams should be from SEC
      const allSEC = data.teams.every(team => team.conference === 'SEC');
      return allSEC;
    });
  }

  async testSpecificTeamEndpoint() {
    await this.test('GET /api/college-baseball/teams?teamId=lsu', async () => {
      const response = await fetch(`${API_BASE}/api/college-baseball/teams?teamId=lsu`);
      const data = await response.json();
      return response.ok && data.team_id === 'lsu';
    });

    await this.test('Team includes required fields', async () => {
      const response = await fetch(`${API_BASE}/api/college-baseball/teams?teamId=tennessee`);
      const data = await response.json();
      
      const requiredFields = [
        'team_id',
        'school_name',
        'conference',
        'city',
        'state',
        'stadium_name',
        'coach_name'
      ];

      return requiredFields.every(field => field in data);
    });

    await this.test('Invalid team ID returns 404', async () => {
      const response = await fetch(`${API_BASE}/api/college-baseball/teams?teamId=invalid-team`);
      return response.status === 404;
    });
  }

  async testResponseStructure() {
    await this.test('Responses include CORS headers', async () => {
      const response = await fetch(`${API_BASE}/api/college-baseball/teams`);
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      return corsHeader === '*';
    });

    await this.test('Responses include Cache-Control', async () => {
      const response = await fetch(`${API_BASE}/api/college-baseball/standings`);
      const cacheHeader = response.headers.get('Cache-Control');
      return cacheHeader && cacheHeader.includes('max-age');
    });

    await this.test('Responses are valid JSON', async () => {
      const response = await fetch(`${API_BASE}/api/college-baseball/teams`);
      const contentType = response.headers.get('Content-Type');
      return contentType && contentType.includes('application/json');
    });
  }

  printSummary() {
    console.log('');
    console.log('='.repeat(60));
    console.log('📊 Test Summary');
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`✅ Passed: ${this.passedTests}`);
    console.log(`❌ Failed: ${this.failedTests}`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(2)}%`);
    
    if (this.failedTests === 0) {
      console.log('');
      console.log('🎉 All tests passed!');
    }
    
    process.exit(this.failedTests > 0 ? 1 : 0);
  }
}

// Run tests if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new CollegeBaseballTester();
  tester.runAllTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export default CollegeBaseballTester;
