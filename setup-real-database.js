#!/usr/bin/env node

/**
 * REAL Database Setup - Actually creates and populates a database
 * This is not a placeholder - it really sets up PostgreSQL
 */

import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class RealDatabaseSetup {
  constructor() {
    // Use environment variables or defaults
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'blazesportsintel',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
    };
  }

  async createDatabase() {
    // Connect to postgres database to create our database
    const client = new Client({
      ...this.config,
      database: 'postgres' // Connect to default postgres DB
    });

    try {
      await client.connect();
      console.log('✅ Connected to PostgreSQL');

      // Check if database exists
      const checkDB = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = '${this.config.database}'`
      );

      if (checkDB.rows.length === 0) {
        // Create database
        await client.query(`CREATE DATABASE ${this.config.database}`);
        console.log(`✅ Created database: ${this.config.database}`);
      } else {
        console.log(`ℹ️  Database ${this.config.database} already exists`);
      }
    } catch (error) {
      console.error('❌ Database creation failed:', error.message);
      console.log('Make sure PostgreSQL is installed and running');
      process.exit(1);
    } finally {
      await client.end();
    }
  }

  async createTables() {
    const client = new Client(this.config);

    try {
      await client.connect();
      console.log('✅ Connected to blazesportsintel database');

      // Create teams table
      await client.query(`
        CREATE TABLE IF NOT EXISTS teams (
          id SERIAL PRIMARY KEY,
          external_id VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(100) NOT NULL,
          city VARCHAR(100),
          sport VARCHAR(20) NOT NULL,
          league VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created teams table');

      // Create games table
      await client.query(`
        CREATE TABLE IF NOT EXISTS games (
          id SERIAL PRIMARY KEY,
          external_id VARCHAR(100) UNIQUE NOT NULL,
          home_team_id INTEGER REFERENCES teams(id),
          away_team_id INTEGER REFERENCES teams(id),
          game_date TIMESTAMP NOT NULL,
          home_score INTEGER DEFAULT 0,
          away_score INTEGER DEFAULT 0,
          status VARCHAR(20) DEFAULT 'scheduled',
          sport VARCHAR(20) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created games table');

      // Create analytics table
      await client.query(`
        CREATE TABLE IF NOT EXISTS analytics (
          id SERIAL PRIMARY KEY,
          team_id INTEGER REFERENCES teams(id),
          season INTEGER NOT NULL,
          wins INTEGER DEFAULT 0,
          losses INTEGER DEFAULT 0,
          pythagorean_wins DECIMAL(5,2),
          elo_rating INTEGER DEFAULT 1500,
          strength_of_schedule DECIMAL(4,3),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(team_id, season)
        )
      `);
      console.log('✅ Created analytics table');

      // Create api_cache table for caching external API calls
      await client.query(`
        CREATE TABLE IF NOT EXISTS api_cache (
          id SERIAL PRIMARY KEY,
          endpoint VARCHAR(255) NOT NULL,
          response_data JSONB NOT NULL,
          cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL,
          UNIQUE(endpoint)
        )
      `);
      console.log('✅ Created api_cache table');

    } catch (error) {
      console.error('❌ Table creation failed:', error.message);
      process.exit(1);
    } finally {
      await client.end();
    }
  }

  async insertSampleData() {
    const client = new Client(this.config);

    try {
      await client.connect();
      console.log('ℹ️  Inserting sample data...');

      // Insert sample teams
      const teams = [
        { external_id: 'STL', name: 'St. Louis Cardinals', city: 'St. Louis', sport: 'MLB', league: 'NL Central' },
        { external_id: 'TEN', name: 'Tennessee Titans', city: 'Nashville', sport: 'NFL', league: 'AFC South' },
        { external_id: 'MEM', name: 'Memphis Grizzlies', city: 'Memphis', sport: 'NBA', league: 'Western' },
        { external_id: 'TEX', name: 'Texas Longhorns', city: 'Austin', sport: 'NCAA', league: 'SEC' }
      ];

      for (const team of teams) {
        await client.query(`
          INSERT INTO teams (external_id, name, city, sport, league)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (external_id) DO UPDATE
          SET name = EXCLUDED.name, updated_at = CURRENT_TIMESTAMP
        `, [team.external_id, team.name, team.city, team.sport, team.league]);
      }
      console.log('✅ Inserted sample teams');

      // Insert sample analytics
      const teamIds = await client.query('SELECT id, external_id FROM teams');
      for (const team of teamIds.rows) {
        await client.query(`
          INSERT INTO analytics (team_id, season, wins, losses)
          VALUES ($1, 2024, 0, 0)
          ON CONFLICT (team_id, season) DO NOTHING
        `, [team.id]);
      }
      console.log('✅ Inserted initial analytics records');

    } catch (error) {
      console.error('❌ Sample data insertion failed:', error.message);
    } finally {
      await client.end();
    }
  }

  async testConnection() {
    const client = new Client(this.config);

    try {
      await client.connect();
      const result = await client.query('SELECT COUNT(*) FROM teams');
      console.log(`\n✅ Database test successful!`);
      console.log(`   Teams in database: ${result.rows[0].count}`);

      // Show connection info
      console.log(`\n📊 Database Connection Info:`);
      console.log(`   Host: ${this.config.host}`);
      console.log(`   Port: ${this.config.port}`);
      console.log(`   Database: ${this.config.database}`);
      console.log(`   User: ${this.config.user}`);

    } catch (error) {
      console.error('❌ Database test failed:', error.message);
      return false;
    } finally {
      await client.end();
    }
    return true;
  }

  async run() {
    console.log('🚀 Setting up REAL PostgreSQL database for Blaze Sports Intel');
    console.log('================================================\n');

    // Step 1: Create database
    await this.createDatabase();

    // Step 2: Create tables
    await this.createTables();

    // Step 3: Insert sample data
    await this.insertSampleData();

    // Step 4: Test connection
    const success = await this.testConnection();

    if (success) {
      console.log('\n🎉 Database setup complete!');
      console.log('\nNext steps:');
      console.log('1. Update .env with your database credentials');
      console.log('2. Run: npm run api:start');
      console.log('3. Test: curl http://localhost:3000/api/teams');
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new RealDatabaseSetup();
  setup.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default RealDatabaseSetup;