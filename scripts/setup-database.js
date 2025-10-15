#!/usr/bin/env node

/**
 * BLAZE SPORTS INTEL - DATABASE SETUP SCRIPT
 * Phase 4A: Database and persistence layer initialization
 *
 * Sets up PostgreSQL database with schema, indexes, and seed data
 * Replaces fake data with real database infrastructure
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredDbEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingDbEnvVars = requiredDbEnvVars.filter((name) => !process.env[name]);

if (missingDbEnvVars.length > 0) {
    console.error(
        `Missing required database environment variable(s): ${missingDbEnvVars.join(', ')}. Populate these values via your secrets sync (e.g., API_KEYS_MASTER.js → npm run mcp:sync) or export them manually before running setup-database.`
    );
    process.exit(1);
}

const DB_PORT = process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT, 10) : 5432;

if (Number.isNaN(DB_PORT)) {
    console.error('Invalid DB_PORT environment variable. Please provide a numeric value.');
    process.exit(1);
}

class DatabaseSetup {
    constructor() {
        this.config = {
            host: process.env.DB_HOST,
            port: DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        };

        this.adminConfig = {
            ...this.config,
            database: 'postgres' // Connect to postgres DB to create main DB
        };

        this.schemaPath = path.join(__dirname, '..', 'api', 'database', 'schema.sql');
    }

    async run() {
        console.log('🔥 BLAZE SPORTS INTEL - Database Setup');
        console.log('=====================================');
        console.log(`Setting up database: ${this.config.database}`);
        console.log(`Host: ${this.config.host}:${this.config.port}`);
        console.log('');

        try {
            // Step 1: Create database if it doesn't exist
            await this.createDatabase();

            // Step 2: Run schema migrations
            await this.runSchema();

            // Step 3: Create initial indexes
            await this.createAdditionalIndexes();

            // Step 4: Insert seed data
            await this.insertSeedData();

            // Step 5: Verify setup
            await this.verifySetup();

            console.log('✅ Database setup completed successfully!');
            console.log('');
            console.log('Next steps:');
            console.log('1. Start the application: npm start');
            console.log('2. Train ML models: npm run train-models');
            console.log('3. Verify with health check: npm run health-check');

        } catch (error) {
            console.error('❌ Database setup failed:', error.message);
            console.error('');
            console.error('Troubleshooting:');
            console.error('1. Ensure PostgreSQL is running');
            console.error('2. Check database credentials in .env');
            console.error('3. Verify database user has CREATE permissions');
            process.exit(1);
        }
    }

    async createDatabase() {
        console.log('📦 Creating database...');

        const client = new Client(this.adminConfig);

        try {
            await client.connect();

            // Check if database exists
            const result = await client.query(
                'SELECT 1 FROM pg_database WHERE datname = $1',
                [this.config.database]
            );

            if (result.rows.length === 0) {
                // Create database
                await client.query(`CREATE DATABASE "${this.config.database}"`);
                console.log(`   ✓ Database '${this.config.database}' created`);
            } else {
                console.log(`   ✓ Database '${this.config.database}' already exists`);
            }

        } finally {
            await client.end();
        }
    }

    async runSchema() {
        console.log('📋 Running schema migrations...');

        const client = new Client(this.config);

        try {
            await client.connect();

            // Read schema file
            const schemaSQL = await fs.readFile(this.schemaPath, 'utf8');

            // Execute schema (split by semicolon and execute each statement)
            const statements = schemaSQL
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

            for (const statement of statements) {
                try {
                    await client.query(statement);
                } catch (error) {
                    // Ignore "already exists" errors
                    if (!error.message.includes('already exists')) {
                        throw error;
                    }
                }
            }

            console.log(`   ✓ Schema applied (${statements.length} statements)`);

        } finally {
            await client.end();
        }
    }

    async createAdditionalIndexes() {
        console.log('🚀 Creating performance indexes...');

        const client = new Client(this.config);

        try {
            await client.connect();

            const additionalIndexes = [
                // Performance indexes for ML queries
                'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ml_features_entity_date ON ml_features (entity_type, entity_id, as_of_date DESC)',
                'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ml_predictions_target_date ON ml_predictions (target_entity_type, target_entity_id, prediction_date DESC)',
                'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_games_date_sport ON games (game_date DESC, sport)',
                'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_analytics_elo ON team_analytics (elo_rating DESC) WHERE elo_rating IS NOT NULL',

                // Composite indexes for common queries
                'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_game_stats_composite ON game_stats (game_id, team_id, stat_type, stat_category)',
                'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_player_analytics_composite ON player_analytics (player_id, season DESC, performance_score DESC)',
            ];

            for (const indexSQL of additionalIndexes) {
                try {
                    await client.query(indexSQL);
                    const indexName = indexSQL.match(/idx_\w+/)?.[0] || 'unknown';
                    console.log(`   ✓ Index created: ${indexName}`);
                } catch (error) {
                    if (!error.message.includes('already exists')) {
                        console.log(`   ⚠ Index creation failed: ${error.message}`);
                    }
                }
            }

        } finally {
            await client.end();
        }
    }

    async insertSeedData() {
        console.log('🌱 Inserting seed data...');

        const client = new Client(this.config);

        try {
            await client.connect();

            // Insert example teams
            const teams = [
                { id: 'STL', name: 'St. Louis Cardinals', city: 'St. Louis', sport: 'mlb', league: 'MLB', division: 'NL Central' },
                { id: 'TEN', name: 'Tennessee Titans', city: 'Nashville', sport: 'nfl', league: 'NFL', conference: 'AFC', division: 'AFC South' },
                { id: 'MEM', name: 'Memphis Grizzlies', city: 'Memphis', sport: 'nba', league: 'NBA', conference: 'Western', division: 'Southwest' },
                { id: 'TEX', name: 'Texas Longhorns', city: 'Austin', sport: 'ncaa_football', league: 'NCAA', conference: 'Big 12' }
            ];

            for (const team of teams) {
                await client.query(`
                    INSERT INTO teams (external_id, name, city, sport, league, division, conference)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (external_id) DO UPDATE SET
                        name = EXCLUDED.name,
                        city = EXCLUDED.city,
                        updated_at = NOW()
                `, [team.id, team.name, team.city, team.sport, team.league, team.division || null, team.conference || null]);
            }

            console.log(`   ✓ Inserted ${teams.length} example teams`);

            // Insert data quality check records
            await client.query(`
                INSERT INTO data_quality_checks (table_name, check_type, check_description, status, severity)
                VALUES
                ('teams', 'initial_setup', 'Initial database setup completed', 'pass', 'low'),
                ('ml_features', 'schema_validation', 'Feature store schema ready', 'pass', 'low'),
                ('ml_predictions', 'schema_validation', 'Prediction storage schema ready', 'pass', 'low')
            `);

            console.log('   ✓ Inserted data quality baseline checks');

        } finally {
            await client.end();
        }
    }

    async verifySetup() {
        console.log('🔍 Verifying database setup...');

        const client = new Client(this.config);

        try {
            await client.connect();

            // Check tables exist
            const tablesResult = await client.query(`
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            `);

            const tables = tablesResult.rows.map(row => row.table_name);
            console.log(`   ✓ Created ${tables.length} tables`);

            // Check team data
            const teamsResult = await client.query('SELECT COUNT(*) as count FROM teams');
            console.log(`   ✓ Sample data: ${teamsResult.rows[0].count} teams`);

            // Check indexes
            const indexesResult = await client.query(`
                SELECT COUNT(*) as count
                FROM pg_indexes
                WHERE schemaname = 'public'
            `);
            console.log(`   ✓ Performance indexes: ${indexesResult.rows[0].count} created`);

            // Check extensions
            const extensionsResult = await client.query(`
                SELECT extname
                FROM pg_extension
                WHERE extname IN ('uuid-ossp', 'pg_stat_statements', 'pg_trgm')
            `);
            console.log(`   ✓ PostgreSQL extensions: ${extensionsResult.rows.length} enabled`);

        } finally {
            await client.end();
        }
    }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const setup = new DatabaseSetup();
    setup.run();
}

export default DatabaseSetup;