#!/usr/bin/env node

/**
 * REAL PostgreSQL Database Setup
 *
 * ChatGPT 5 was correct - the existing code only has basic user/subscription CRUD
 * This script creates the ACTUAL tables needed for sports data
 */

import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';

dotenv.config();

class RealDatabaseSetup {
  constructor() {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'blazesportsintel',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
    };
  }

  async createDatabase() {
    const client = new Client({
      ...this.config,
      database: 'postgres' // Connect to default database first
    });

    try {
      await client.connect();
      console.log('✅ Connected to PostgreSQL');

      // Check if database exists
      const result = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [this.config.database]
      );

      if (result.rows.length === 0) {
        await client.query(`CREATE DATABASE ${this.config.database}`);
        console.log(`✅ Created database: ${this.config.database}`);
      } else {
        console.log(`ℹ️  Database ${this.config.database} already exists`);
      }
    } catch (error) {
      console.error('❌ Error creating database:', error.message);
      throw error;
    } finally {
      await client.end();
    }
  }

  async createTables() {
    const client = new Client(this.config);

    try {
      await client.connect();
      console.log(`✅ Connected to ${this.config.database} database`);

      // Create teams table
      await client.query(`
        CREATE TABLE IF NOT EXISTS teams (
          id SERIAL PRIMARY KEY,
          external_id VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(200) NOT NULL,
          abbreviation VARCHAR(10),
          sport VARCHAR(50) NOT NULL,
          league VARCHAR(50) NOT NULL,
          division VARCHAR(100),
          conference VARCHAR(100),
          venue_name VARCHAR(200),
          city VARCHAR(100),
          state VARCHAR(50),
          logo_url TEXT,
          primary_color VARCHAR(7),
          secondary_color VARCHAR(7),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created teams table');

      // Create games table
      await client.query(`
        CREATE TABLE IF NOT EXISTS games (
          id SERIAL PRIMARY KEY,
          external_game_id VARCHAR(100) UNIQUE NOT NULL,
          sport VARCHAR(50) NOT NULL,
          home_team_id INTEGER REFERENCES teams(id),
          away_team_id INTEGER REFERENCES teams(id),
          game_date TIMESTAMP NOT NULL,
          home_score INTEGER,
          away_score INTEGER,
          status VARCHAR(50),
          venue VARCHAR(200),
          attendance INTEGER,
          weather_conditions JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created games table');

      // Create analytics table for calculations
      await client.query(`
        CREATE TABLE IF NOT EXISTS analytics (
          id SERIAL PRIMARY KEY,
          team_id INTEGER REFERENCES teams(id),
          season INTEGER NOT NULL,
          metric_type VARCHAR(100) NOT NULL,
          metric_value DECIMAL(10, 4),
          metric_data JSONB,
          calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          data_source VARCHAR(200),
          UNIQUE(team_id, season, metric_type)
        )
      `);
      console.log('✅ Created analytics table');

      // Create api_cache table for caching external API responses
      await client.query(`
        CREATE TABLE IF NOT EXISTS api_cache (
          id SERIAL PRIMARY KEY,
          cache_key VARCHAR(500) UNIQUE NOT NULL,
          response_data JSONB NOT NULL,
          api_source VARCHAR(200) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          hit_count INTEGER DEFAULT 0
        )
      `);
      console.log('✅ Created api_cache table');

      // Create indexes for performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_teams_sport ON teams(sport);
        CREATE INDEX IF NOT EXISTS idx_teams_league ON teams(league);
        CREATE INDEX IF NOT EXISTS idx_games_date ON games(game_date);
        CREATE INDEX IF NOT EXISTS idx_games_teams ON games(home_team_id, away_team_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_team_season ON analytics(team_id, season);
        CREATE INDEX IF NOT EXISTS idx_api_cache_expires ON api_cache(expires_at);
      `);
      console.log('✅ Created performance indexes');

    } catch (error) {
      console.error('❌ Error creating tables:', error.message);
      throw error;
    } finally {
      await client.end();
    }
  }

  async insertSampleData() {
    const client = new Client(this.config);

    try {
      await client.connect();
      console.log('ℹ️  Inserting sample data...');

      // Insert Cardinals
      await client.query(`
        INSERT INTO teams (external_id, name, abbreviation, sport, league, division, venue_name, city, state, primary_color)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (external_id) DO NOTHING
      `, ['138', 'St. Louis Cardinals', 'STL', 'MLB', 'National League', 'NL Central', 'Busch Stadium', 'St. Louis', 'MO', '#C41E3A']);

      // Insert Titans
      await client.query(`
        INSERT INTO teams (external_id, name, abbreviation, sport, league, division, venue_name, city, state, primary_color)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (external_id) DO NOTHING
      `, ['10', 'Tennessee Titans', 'TEN', 'NFL', 'AFC', 'AFC South', 'Nissan Stadium', 'Nashville', 'TN', '#4B92DB']);

      // Insert Grizzlies
      await client.query(`
        INSERT INTO teams (external_id, name, abbreviation, sport, league, division, venue_name, city, state, primary_color)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (external_id) DO NOTHING
      `, ['29', 'Memphis Grizzlies', 'MEM', 'NBA', 'Western Conference', 'Southwest Division', 'FedExForum', 'Memphis', 'TN', '#5D76A9']);

      // Insert Longhorns
      await client.query(`
        INSERT INTO teams (external_id, name, abbreviation, sport, league, conference, venue_name, city, state, primary_color)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (external_id) DO NOTHING
      `, ['251', 'Texas Longhorns', 'TEX', 'NCAA Football', 'FBS', 'Big 12', 'Darrell K Royal Stadium', 'Austin', 'TX', '#BF5700']);

      console.log('✅ Inserted sample teams');

      // Insert initial analytics records
      const teams = await client.query('SELECT id, name FROM teams');
      for (const team of teams.rows) {
        await client.query(`
          INSERT INTO analytics (team_id, season, metric_type, metric_value, data_source)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (team_id, season, metric_type) DO NOTHING
        `, [team.id, 2024, 'elo_rating', 1500, 'Initial Setup']);
      }
      console.log('✅ Inserted initial analytics records');

    } catch (error) {
      console.error('❌ Error inserting sample data:', error.message);
      // Don't throw - sample data is optional
    } finally {
      await client.end();
    }
  }

  async verifyDatabase() {
    const client = new Client(this.config);

    try {
      await client.connect();

      const result = await client.query(`
        SELECT COUNT(*) as count FROM teams
      `);

      console.log(`\n✅ Database test successful!`);
      console.log(`   Teams in database: ${result.rows[0].count}`);

    } catch (error) {
      console.error('❌ Database verification failed:', error.message);
      throw error;
    } finally {
      await client.end();
    }
  }

  async run() {
    console.log('🚀 Setting up REAL PostgreSQL database for Blaze Sports Intel');
    console.log('================================================\n');

    try {
      await this.createDatabase();
      await this.createTables();
      await this.insertSampleData();
      await this.verifyDatabase();

      console.log('\n📊 Database Connection Info:');
      console.log(`   Host: ${this.config.host}`);
      console.log(`   Port: ${this.config.port}`);
      console.log(`   Database: ${this.config.database}`);
      console.log(`   User: ${this.config.user}`);

      console.log('\n🎉 Database setup complete!');
      console.log('\nNext steps:');
      console.log('1. Update .env with your database credentials');
      console.log('2. Run: npm run api:start');
      console.log('3. Test: curl http://localhost:3000/api/teams');

    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new RealDatabaseSetup();
  setup.run();
}