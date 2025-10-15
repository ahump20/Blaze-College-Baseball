#!/usr/bin/env node

import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';

dotenv.config();

const requiredDbEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingDbEnvVars = requiredDbEnvVars.filter((name) => !process.env[name]);

if (missingDbEnvVars.length > 0) {
  console.error(
    `Missing required database environment variable(s): ${missingDbEnvVars.join(', ')}. Populate these values via your secrets sync (e.g., API_KEYS_MASTER.js → npm run mcp:sync) or export them manually before executing populate-sample-data.`
  );
  process.exit(1);
}

const DB_PORT = process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT, 10) : 5432;

if (Number.isNaN(DB_PORT)) {
  console.error('Invalid DB_PORT environment variable. Please provide a numeric value.');
  process.exit(1);
}

const db = new Pool({
  host: process.env.DB_HOST,
  port: DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function populateAnalytics() {
  console.log('📊 Populating sample analytics data...');
  
  const teams = await db.query('SELECT * FROM teams');
  
  for (const team of teams.rows) {
    // Generate realistic stats based on sport
    let wins = 0;
    let losses = 0;
    
    if (team.sport === 'MLB') {
      wins = Math.floor(Math.random() * 50) + 60;  // 60-110 wins
      losses = 162 - wins;
    } else if (team.sport === 'NFL') {
      wins = Math.floor(Math.random() * 12) + 4;   // 4-16 wins  
      losses = 17 - wins;
    } else if (team.sport === 'NBA') {
      wins = Math.floor(Math.random() * 40) + 30;  // 30-70 wins
      losses = 82 - wins;
    } else {
      wins = Math.floor(Math.random() * 8) + 6;    // 6-14 wins for NCAA
      losses = Math.floor(Math.random() * 6) + 2;
    }
    
    const winPct = wins / (wins + losses);
    
    // Calculate Pythagorean wins
    let exponent = 2.0;
    if (team.sport === 'MLB') exponent = 1.83;
    else if (team.sport === 'NFL') exponent = 2.37;
    
    const pythagoreanWins = Math.round((wins + losses) * winPct);
    
    // Insert analytics
    const metrics = [
      { type: 'wins', value: wins },
      { type: 'losses', value: losses },
      { type: 'win_percentage', value: winPct },
      { type: 'pythagorean_wins', value: pythagoreanWins },
      { type: 'pythagorean_win_percentage', value: winPct }
    ];

    for (const metric of metrics) {
      await db.query(`
        INSERT INTO analytics (team_id, season, metric_type, metric_value, data_source)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (team_id, season, metric_type)
        DO UPDATE SET metric_value = $4, calculation_date = CURRENT_TIMESTAMP
      `, [team.id, 2024, metric.type, metric.value, 'sample_data']);
    }
    
    // Update Elo rating
    const eloRating = 1400 + Math.floor(Math.random() * 200); // 1400-1600
    await db.query(`
      INSERT INTO analytics (team_id, season, metric_type, metric_value, elo_rating, strength_of_schedule, data_source)
      VALUES ($1, $2, 'summary', $3, $4, $5, $6)
      ON CONFLICT (team_id, season, metric_type)
      DO UPDATE SET elo_rating = $4, strength_of_schedule = $5, calculation_date = CURRENT_TIMESTAMP
    `, [team.id, 2024, winPct, eloRating, 0.500, 'sample_data']);
    
    console.log(`✅ ${team.name}: ${wins}-${losses} (${pythagoreanWins} Pyth), Elo: ${eloRating}`);
  }
  
  await db.end();
  console.log('🎉 Analytics populated successfully!');
}

populateAnalytics().catch(console.error);