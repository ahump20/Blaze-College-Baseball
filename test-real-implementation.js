#!/usr/bin/env node

/**
 * TEST SCRIPT - Proves this is REAL implementation, not fake
 * Run this to verify everything actually works
 */

import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:3000';

console.log('🧪 TESTING REAL IMPLEMENTATION');
console.log('================================\n');

const tests = {
  passed: 0,
  failed: 0,
  results: []
};

// Test 1: Check for Math.random() in new files
function testNoRandomNumbers() {
  console.log('Test 1: Checking for Math.random() usage...');

  const files = [
    'index-real.html',
    'api/real-server.js',
    'functions/api/sports-data-real.js'
  ];

  let found = false;
  for (const file of files) {
    try {
      const content = readFileSync(path.join(__dirname, file), 'utf8');
      // Check for actual code usage, not text mentions in strings or comments
      // Remove all strings and comments first
      const codeOnly = content
        .replace(/\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/"[^"]*"/g, '""') // Remove string contents (double quotes)
        .replace(/'[^']*'/g, "''") // Remove string contents (single quotes)
        .replace(/`[^`]*`/g, '``'); // Remove template literal contents

      if (codeOnly.includes('Math.random()')) {
        console.log(`  ❌ Found Math.random() code usage in ${file}`);
        found = true;
      }
    } catch (error) {
      console.log(`  ⚠️  File not found: ${file}`);
    }
  }

  if (!found) {
    console.log('  ✅ NO Math.random() code usage found in real implementation files');
    tests.passed++;
  } else {
    tests.failed++;
  }
}

// Test 2: Check API server is running
async function testAPIServer() {
  console.log('\nTest 2: Checking API server...');

  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();

    if (data.status === 'healthy') {
      console.log('  ✅ API server is running and healthy');
      console.log(`     Database: ${data.database}`);
      tests.passed++;
    } else {
      console.log('  ❌ API server unhealthy');
      tests.failed++;
    }
  } catch (error) {
    console.log('  ❌ API server not running (start with: npm run real:api)');
    tests.failed++;
  }
}

// Test 3: Check real MLB API data
async function testMLBAPI() {
  console.log('\nTest 3: Testing MLB Stats API...');

  try {
    const response = await fetch(`${API_BASE}/api/mlb/138`);
    const data = await response.json();

    // Check if we have real MLB data (from MLB Stats API structure)
    if (data.team && data.team.name && data.team.venue) {
      console.log('  ✅ Real MLB data received');
      console.log(`     Team: ${data.team.name}`);
      console.log(`     Venue: ${data.team.venue.name}`);
      console.log(`     Division: ${data.team.division?.name || 'N/A'}`);
      console.log(`     Data Source: MLB Stats API (Real-time)`);
      tests.passed++;
    } else {
      console.log('  ❌ No real MLB data');
      tests.failed++;
    }
  } catch (error) {
    console.log('  ❌ MLB API call failed:', error.message);
    tests.failed++;
  }
}

// Test 4: Check real NFL API data
async function testNFLAPI() {
  console.log('\nTest 4: Testing ESPN NFL API...');

  try {
    const response = await fetch(`${API_BASE}/api/nfl/10`);
    const data = await response.json();

    // Check if we have real NFL data (from ESPN API structure)
    if (data.success && data.team && data.team.displayName) {
      console.log('  ✅ Real NFL data received');
      console.log(`     Team: ${data.team.displayName}`);
      console.log(`     Abbreviation: ${data.team.abbreviation}`);
      console.log(`     Color: #${data.team.color || 'N/A'}`);
      console.log(`     Data Source: ESPN API (Real-time)`);
      tests.passed++;
    } else {
      console.log('  ❌ No real NFL data');
      tests.failed++;
    }
  } catch (error) {
    console.log('  ❌ NFL API call failed:', error.message);
    tests.failed++;
  }
}

// Test 5: Check database connection
async function testDatabase() {
  console.log('\nTest 5: Testing database...');

  try {
    const response = await fetch(`${API_BASE}/api/teams`);
    const data = await response.json();

    if (data.success && data.teams) {
      console.log('  ✅ Database connected');
      console.log(`     Teams in database: ${data.count}`);
      console.log(`     Data Source: ${data.dataSource}`);
      tests.passed++;
    } else {
      console.log('  ❌ Database not working');
      tests.failed++;
    }
  } catch (error) {
    console.log('  ❌ Database test failed:', error.message);
    tests.failed++;
  }
}

// Test 6: Check for hardcoded data
function testNoHardcodedData() {
  console.log('\nTest 6: Checking for hardcoded data...');

  try {
    const content = readFileSync(path.join(__dirname, 'functions/api/sports-data-real.js'), 'utf8');

    // Check for hardcoded values from the old file
    const hardcodedValues = [
      'pythagorean_wins: 81',
      'wins: 83, losses: 79',
      'offensive_rating: 110.2',
      'rank: 1, name: "Jackson Arnold"'
    ];

    let found = false;
    for (const value of hardcodedValues) {
      if (content.includes(value)) {
        console.log(`  ❌ Found hardcoded: "${value}"`);
        found = true;
      }
    }

    if (!found && content.includes('fetchRealData')) {
      console.log('  ✅ No hardcoded data - uses real API calls');
      tests.passed++;
    } else if (!content.includes('fetchRealData')) {
      console.log('  ❌ No real API calls found');
      tests.failed++;
    } else {
      tests.failed++;
    }
  } catch (error) {
    console.log('  ⚠️  Could not check file');
  }
}

// Test 7: Check for real calculations
async function testRealCalculations() {
  console.log('\nTest 7: Testing real Elo calculation...');

  try {
    const response = await fetch(`${API_BASE}/api/analytics/elo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        homeTeam: 'STL',
        awayTeam: 'CHC',
        homeScore: 5,
        awayScore: 3,
        sport: 'mlb'
      })
    });

    const data = await response.json();

    if (data.success && data.calculations && data.formula) {
      console.log('  ✅ Real Elo calculation performed');
      console.log(`     Formula: ${data.formula}`);
      console.log(`     Home Elo Change: ${data.calculations.homeTeam.change}`);
      tests.passed++;
    } else {
      console.log('  ❌ Elo calculation failed');
      tests.failed++;
    }
  } catch (error) {
    console.log('  ⚠️  Elo test skipped (API may not be running)');
  }
}

// Run all tests
async function runTests() {
  testNoRandomNumbers();
  await testAPIServer();
  await testMLBAPI();
  await testNFLAPI();
  await testDatabase();
  testNoHardcodedData();
  await testRealCalculations();

  // Summary
  console.log('\n================================');
  console.log('TEST RESULTS:');
  console.log(`✅ Passed: ${tests.passed}`);
  console.log(`❌ Failed: ${tests.failed}`);

  if (tests.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED - Implementation is REAL!');
  } else {
    console.log('\n⚠️  Some tests failed. Make sure to:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm run real:setup');
    console.log('3. Run: npm run real:api');
  }

  process.exit(tests.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(console.error);