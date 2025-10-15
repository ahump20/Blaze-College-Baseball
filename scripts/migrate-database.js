#!/usr/bin/env node

/**
 * Database Migration Script - Add players table and enhance schema
 * Phase 2 of BSI platform expansion
 */

import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';

dotenv.config();

class DatabaseMigrator {
  constructor() {
    const requiredDbEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missingDbEnvVars = requiredDbEnvVars.filter((name) => !process.env[name]);

    if (missingDbEnvVars.length > 0) {
      console.error(
        `Missing required database environment variable(s): ${missingDbEnvVars.join(', ')}. Populate these values via your secrets sync (e.g., API_KEYS_MASTER.js → npm run mcp:sync) or export them manually before running migrate-database.`
      );
      process.exit(1);
    }

    const port = process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT, 10) : 5432;

    if (Number.isNaN(port)) {
      console.error('Invalid DB_PORT environment variable. Please provide a numeric value.');
      process.exit(1);
    }

    this.config = {
      host: process.env.DB_HOST,
      port,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    };
  }

  async run() {
    console.log('🚀 Running database migrations for Phase 2 expansion');
    console.log('================================================\n');

    const client = new Client(this.config);

    try {
      await client.connect();
      console.log('✅ Connected to database');

      // Migration 1: Add players table
      await this.addPlayersTable(client);
      
      // Migration 2: Add game_stats table
      await this.addGameStatsTable(client);
      
      // Migration 3: Enhance existing tables
      await this.enhanceExistingTables(client);
      
      // Migration 4: Add indexes
      await this.addIndexes(client);
      
      // Migration 5: Seed sample data
      await this.seedSampleData(client);

      console.log('\n🎉 All migrations completed successfully!');

    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    } finally {
      await client.end();
    }
  }

  async addPlayersTable(client) {
    console.log('📝 Adding players table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        external_id VARCHAR(50) UNIQUE NOT NULL,
        team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        position VARCHAR(20),
        jersey_number INTEGER,
        height_inches INTEGER,
        weight_pounds INTEGER,
        birth_date DATE,
        sport VARCHAR(20) NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Players table created');
  }

  async addGameStatsTable(client) {
    console.log('📝 Adding game_stats table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_stats (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
        team_id INTEGER REFERENCES teams(id) NOT NULL,
        player_id INTEGER REFERENCES players(id),
        stat_type VARCHAR(50) NOT NULL,
        stat_value DECIMAL(10,4) NOT NULL,
        stat_category VARCHAR(20),
        period VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Game stats table created');
  }

  async enhanceExistingTables(client) {
    console.log('📝 Enhancing existing tables...');
    
    // Add columns to games table if they don't exist
    try {
      await client.query(`
        ALTER TABLE games 
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'scheduled',
        ADD COLUMN IF NOT EXISTS venue VARCHAR(200),
        ADD COLUMN IF NOT EXISTS weather JSONB,
        ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'
      `);
      console.log('✅ Enhanced games table');
    } catch (error) {
      console.log('ℹ️  Games table already enhanced or error:', error.message);
    }

    // Add columns to analytics table for advanced metrics
    try {
      await client.query(`
        ALTER TABLE analytics 
        ADD COLUMN IF NOT EXISTS elo_rating INTEGER DEFAULT 1500,
        ADD COLUMN IF NOT EXISTS strength_of_schedule DECIMAL(5,4) DEFAULT 0.500,
        ADD COLUMN IF NOT EXISTS predicted_wins DECIMAL(5,2),
        ADD COLUMN IF NOT EXISTS playoff_probability DECIMAL(5,4)
      `);
      console.log('✅ Enhanced analytics table');
    } catch (error) {
      console.log('ℹ️  Analytics table already enhanced or error:', error.message);
    }
  }

  async addIndexes(client) {
    console.log('📝 Adding performance indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_players_team_sport ON players(team_id, sport)',
      'CREATE INDEX IF NOT EXISTS idx_players_external_id ON players(external_id)',
      'CREATE INDEX IF NOT EXISTS idx_game_stats_game_team ON game_stats(game_id, team_id)',
      'CREATE INDEX IF NOT EXISTS idx_game_stats_player ON game_stats(player_id)',
      'CREATE INDEX IF NOT EXISTS idx_games_status ON games(status)',
      'CREATE INDEX IF NOT EXISTS idx_games_venue ON games(venue)'
    ];

    for (const indexQuery of indexes) {
      try {
        await client.query(indexQuery);
      } catch (error) {
        console.log(`ℹ️  Index creation issue: ${error.message}`);
      }
    }
    
    console.log('✅ Performance indexes added');
  }

  async seedSampleData(client) {
    console.log('📝 Seeding sample players and game data...');

    // Add sample players for each team
    const teamsResult = await client.query('SELECT id, external_id, name, sport FROM teams');
    const teams = teamsResult.rows;

    for (const team of teams) {
      // Add sample players based on sport
      if (team.sport === 'MLB') {
        await this.addMLBPlayers(client, team);
      } else if (team.sport === 'NFL') {
        await this.addNFLPlayers(client, team);
      } else if (team.sport === 'NBA') {
        await this.addNBAPlayers(client, team);
      }
    }

    // Add sample games
    await this.addSampleGames(client, teams);

    console.log('✅ Sample data seeded');
  }

  async addMLBPlayers(client, team) {
    const players = [
      { name: 'John Smith', position: 'OF', jersey: 23 },
      { name: 'Mike Johnson', position: 'P', jersey: 45 },
      { name: 'David Wilson', position: 'C', jersey: 7 },
      { name: 'Chris Brown', position: 'SS', jersey: 12 },
      { name: 'Matt Davis', position: '1B', jersey: 34 }
    ];

    for (const player of players) {
      const [firstName, lastName] = player.name.split(' ');
      await client.query(`
        INSERT INTO players (external_id, team_id, first_name, last_name, position, jersey_number, sport)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (external_id) DO NOTHING
      `, [
        `${team.external_id}-${player.jersey}`,
        team.id,
        firstName,
        lastName,
        player.position,
        player.jersey,
        'MLB'
      ]);
    }
  }

  async addNFLPlayers(client, team) {
    const players = [
      { name: 'Tom Jackson', position: 'QB', jersey: 9 },
      { name: 'Alex Anderson', position: 'RB', jersey: 28 },
      { name: 'Ryan Taylor', position: 'WR', jersey: 81 },
      { name: 'Mark Thompson', position: 'LB', jersey: 55 },
      { name: 'Steve Martinez', position: 'DE', jersey: 98 }
    ];

    for (const player of players) {
      const [firstName, lastName] = player.name.split(' ');
      await client.query(`
        INSERT INTO players (external_id, team_id, first_name, last_name, position, jersey_number, sport)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (external_id) DO NOTHING
      `, [
        `${team.external_id}-${player.jersey}`,
        team.id,
        firstName,
        lastName,
        player.position,
        player.jersey,
        'NFL'
      ]);
    }
  }

  async addNBAPlayers(client, team) {
    const players = [
      { name: 'Marcus Williams', position: 'PG', jersey: 1 },
      { name: 'Kevin Lee', position: 'SG', jersey: 23 },
      { name: 'James Robinson', position: 'SF', jersey: 33 },
      { name: 'Michael Clark', position: 'PF', jersey: 44 },
      { name: 'Anthony Lewis', position: 'C', jersey: 50 }
    ];

    for (const player of players) {
      const [firstName, lastName] = player.name.split(' ');
      await client.query(`
        INSERT INTO players (external_id, team_id, first_name, last_name, position, jersey_number, sport)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (external_id) DO NOTHING
      `, [
        `${team.external_id}-${player.jersey}`,
        team.id,
        firstName,
        lastName,
        player.position,
        player.jersey,
        'NBA'
      ]);
    }
  }

  async addSampleGames(client, teams) {
    // Add sample games between teams of the same sport
    const mlbTeams = teams.filter(t => t.sport === 'MLB');
    const nflTeams = teams.filter(t => t.sport === 'NFL');

    if (mlbTeams.length >= 1) {
      await client.query(`
        INSERT INTO games (external_game_id, home_team_id, away_team_id, game_date, sport, status, home_score, away_score)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (external_game_id) DO NOTHING
      `, [
        'mlb-2024-001',
        mlbTeams[0].id,
        mlbTeams[0].id, // Same team for demo
        '2024-09-15 19:30:00',
        'MLB',
        'completed',
        7,
        4
      ]);
    }

    if (nflTeams.length >= 1) {
      await client.query(`
        INSERT INTO games (external_game_id, home_team_id, away_team_id, game_date, sport, status, home_score, away_score)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (external_game_id) DO NOTHING
      `, [
        'nfl-2024-001',
        nflTeams[0].id,
        nflTeams[0].id, // Same team for demo
        '2024-09-22 13:00:00',
        'NFL',
        'completed',
        24,
        17
      ]);
    }
  }
}

// Run migrations if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const migrator = new DatabaseMigrator();
  migrator.run();
}

export default DatabaseMigrator;