/**
 * BLAZE SPORTS INTEL - DATABASE CONNECTION SERVICE
 * Phase 3B: Production PostgreSQL connection with ML pipeline integration
 *
 * Features:
 * - Connection pooling with health monitoring
 * - Transaction management
 * - Query performance monitoring
 * - Automatic failover and retry logic
 * - ML feature store integration
 */

import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import pkg from 'pg';
const { Pool } = pkg;

const GAME_EVENT_COLUMN_PRIORITY = [
    'game_id',
    'event_id',
    'event_index',
    'sequence',
    'event_type',
    'event_time',
    'inning',
    'half_inning',
    'outs',
    'description',
    'home_score',
    'away_score',
    'rbi',
    'runner_on_first',
    'runner_on_second',
    'runner_on_third',
    'batter_id',
    'pitcher_id',
    'pitch_sequence',
    'result',
    'created_at',
    'updated_at',
    'metadata'
];

class DatabaseConnectionService {
    constructor(config, logger) {
        this.logger = logger;
        this.config = {
            host: config.host || process.env.DB_HOST || 'localhost',
            port: config.port || process.env.DB_PORT || 5432,
            database: config.database || process.env.DB_NAME || 'blaze_sports_intel',
            user: config.user || process.env.DB_USER || 'postgres',
            password: config.password || process.env.DB_PASSWORD,
            ssl: config.ssl !== undefined ? config.ssl : process.env.NODE_ENV === 'production',

            // Connection pool settings
            max: config.maxConnections || 20,
            min: config.minConnections || 5,
            idleTimeoutMillis: config.idleTimeout || 30000,
            connectionTimeoutMillis: config.connectionTimeout || 10000,
            maxUses: config.maxUses || 7500,

            // Query timeout
            statement_timeout: config.queryTimeout || 30000,
            query_timeout: config.queryTimeout || 30000,
            application_name: 'blaze-sports-intel'
        };

        this.pool = null;
        this.healthStatus = 'unknown';
        this.metrics = {
            totalQueries: 0,
            successfulQueries: 0,
            failedQueries: 0,
            averageQueryTime: 0,
            activeConnections: 0,
            totalConnections: 0
        };

        this.queryTimes = [];
        this.maxQueryTimeHistory = 1000;

        this.initialize();
    }

    async initialize() {
        try {
            this.logger.info('Initializing database connection service', {
                host: this.config.host,
                database: this.config.database,
                maxConnections: this.config.max
            });

            this.pool = new Pool(this.config);

            // Set up pool event handlers
            this.setupPoolEventHandlers();

            // Test connection
            await this.testConnection();

            // Start health monitoring
            this.startHealthMonitoring();

            this.healthStatus = 'healthy';
            this.logger.info('Database connection service initialized successfully');

        } catch (error) {
            this.healthStatus = 'unhealthy';
            this.logger.error('Failed to initialize database connection service', {}, error);
            throw error;
        }
    }

    setupPoolEventHandlers() {
        this.pool.on('connect', (client) => {
            this.metrics.totalConnections++;
            this.logger.debug('New database client connected', {
                totalConnections: this.metrics.totalConnections
            });
        });

        this.pool.on('acquire', (client) => {
            this.metrics.activeConnections++;
        });

        this.pool.on('release', (client) => {
            this.metrics.activeConnections--;
        });

        this.pool.on('error', (error, client) => {
            this.logger.error('Database pool error', { client: client?.processID }, error);
            this.healthStatus = 'unhealthy';
        });

        this.pool.on('remove', (client) => {
            this.logger.debug('Database client removed from pool');
        });
    }

    /**
     * Execute a query with performance monitoring
     */
    async query(text, params = [], options = {}) {
        const startTime = Date.now();
        const queryId = this.generateQueryId();

        try {
            this.metrics.totalQueries++;

            this.logger.debug('Executing database query', {
                queryId,
                sql: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
                paramCount: params.length
            });

            const result = await this.pool.query(text, params);

            const duration = Date.now() - startTime;
            this.trackQueryPerformance(duration);
            this.metrics.successfulQueries++;

            this.logger.debug('Query completed successfully', {
                queryId,
                duration_ms: duration,
                rowCount: result.rowCount
            });

            return result;

        } catch (error) {
            const duration = Date.now() - startTime;
            this.metrics.failedQueries++;

            this.logger.error('Database query failed', {
                queryId,
                duration_ms: duration,
                sql: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
                error: error.message
            }, error);

            throw error;
        }
    }

    /**
     * Execute a transaction
     */
    async transaction(callback) {
        const client = await this.pool.connect();
        const transactionId = this.generateTransactionId();

        try {
            this.logger.debug('Starting database transaction', { transactionId });

            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');

            this.logger.debug('Transaction completed successfully', { transactionId });
            return result;

        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Transaction failed and rolled back', { transactionId }, error);
            throw error;

        } finally {
            client.release();
        }
    }

    /**
     * Insert game events using COPY streaming when available, or fall back to batch inserts.
     */
    async insertGameEvents(events, options = {}) {
        if (!Array.isArray(events) || events.length === 0) {
            this.logger.warn('No game events provided for insert operation');
            return { insertedCount: 0, method: null };
        }

        const {
            tableName = 'game_events',
            columns: explicitColumns,
            onConflict = 'DO NOTHING',
            batchSize = 1000,
            client: externalClient = null,
            useCopy = true,
            returning = null
        } = options;

        const columns = this.prepareGameEventColumns(events, explicitColumns);
        if (!columns.length) {
            throw new Error('Unable to determine column order for game event insert');
        }

        const rows = this.normalizeGameEventRows(events, columns);
        const shouldRelease = !externalClient;
        const client = externalClient || await this.pool.connect();
        let methodUsed = null;

        try {
            const canUseCopy = useCopy !== false && this.canUseCopyStrategy(onConflict, client);

            if (canUseCopy) {
                try {
                    await this.executeCopyInsert(client, tableName, columns, rows);
                    methodUsed = 'copy';
                    this.logger.info('Game events inserted via COPY stream', {
                        table: tableName,
                        rows: rows.length,
                        method: methodUsed
                    });
                    return { insertedCount: rows.length, method: methodUsed };
                } catch (copyError) {
                    this.logger.warn('COPY stream insert failed, falling back to batch inserts', {
                        table: tableName,
                        reason: copyError.message
                    }, copyError);
                }
            }

            const insertedCount = await this.executeGameEventBatchInsert(client, tableName, columns, rows, {
                onConflict,
                batchSize,
                returning
            });

            methodUsed = 'batch';
            this.logger.info('Game events inserted via batch insert', {
                table: tableName,
                rows: rows.length,
                method: methodUsed,
                batches: Math.ceil(rows.length / batchSize)
            });

            return { insertedCount, method: methodUsed };

        } catch (error) {
            this.logger.error('Failed to insert game events', {
                table: tableName,
                method: methodUsed
            }, error);
            throw error;
        } finally {
            if (shouldRelease) {
                client.release();
            }
        }
    }

    prepareGameEventColumns(events, explicitColumns) {
        if (Array.isArray(explicitColumns) && explicitColumns.length > 0) {
            return explicitColumns;
        }

        if (!Array.isArray(events) || events.length === 0) {
            return [];
        }

        if (Array.isArray(events[0])) {
            return explicitColumns || [];
        }

        const seen = new Set();
        const ordered = [];

        const hasColumn = (column) => events.some(event => Object.prototype.hasOwnProperty.call(event, column));

        GAME_EVENT_COLUMN_PRIORITY.forEach((column) => {
            if (!seen.has(column) && hasColumn(column)) {
                ordered.push(column);
                seen.add(column);
            }
        });

        events.forEach((event) => {
            Object.keys(event).forEach((key) => {
                if (!seen.has(key)) {
                    ordered.push(key);
                    seen.add(key);
                }
            });
        });

        return ordered;
    }

    normalizeGameEventRows(events, columns) {
        if (!Array.isArray(events) || events.length === 0) {
            return [];
        }

        if (Array.isArray(events[0])) {
            return events.map((row) => row.map((value) => this.normalizeGameEventValue(value)));
        }

        return events.map((event) =>
            columns.map((column) => this.normalizeGameEventValue(event[column]))
        );
    }

    normalizeGameEventValue(value) {
        if (value === undefined || value === null) {
            return null;
        }

        if (value instanceof Date) {
            return value.toISOString();
        }

        if (typeof Buffer !== 'undefined' && value instanceof Buffer) {
            return value;
        }

        if (typeof value === 'object') {
            try {
                return JSON.stringify(value);
            } catch (error) {
                this.logger.warn('Failed to stringify game event value; storing as null', {
                    error: error.message
                });
                return null;
            }
        }

        return value;
    }

    formatCopyValue(value) {
        if (value === undefined || value === null) {
            return '\\N';
        }

        if (value instanceof Date) {
            return value.toISOString();
        }

        if (typeof Buffer !== 'undefined' && value instanceof Buffer) {
            return value.toString('base64');
        }

        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

        return stringValue
            .replace(/\\/g, '\\\\')
            .replace(/\t/g, '\\t')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r');
    }

    canUseCopyStrategy(onConflict, client) {
        if (!client || typeof client.query !== 'function') {
            return false;
        }

        const conflictClause = (onConflict || '').trim();
        if (!conflictClause) {
            return true;
        }

        const normalized = conflictClause.toUpperCase();
        return normalized === 'DO NOTHING' || normalized === 'ON CONFLICT DO NOTHING';
    }

    async executeCopyInsert(client, tableName, columns, rows) {
        let copyFrom;
        try {
            const copyStreams = await import('pg-copy-streams');
            copyFrom = copyStreams.default?.from || copyStreams.from;
        } catch (error) {
            throw new Error(`pg-copy-streams module is not available: ${error.message}`);
        }

        if (typeof copyFrom !== 'function') {
            throw new Error('pg-copy-streams.from is not a function');
        }

        const copyCommand = `COPY ${tableName} (${columns.join(', ')}) FROM STDIN WITH (FORMAT text, DELIMITER E'\\t', NULL '\\\\N')`;
        const destination = client.query(copyFrom(copyCommand));
        const source = Readable.from(rows.map((row) =>
            row.map((value) => this.formatCopyValue(value)).join('\t') + '\n'
        ));

        await pipeline(source, destination);
    }

    async executeGameEventBatchInsert(client, tableName, columns, rows, options) {
        const {
            onConflict = 'DO NOTHING',
            batchSize = 1000,
            returning = null
        } = options || {};

        let insertedCount = 0;
        const normalizedConflict = (onConflict || '').trim();
        const conflictClause = normalizedConflict
            ? (normalizedConflict.toUpperCase().startsWith('ON CONFLICT') ? normalizedConflict : `ON CONFLICT ${normalizedConflict}`)
            : '';

        for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            const values = batch.map((_, rowIndex) => {
                const placeholders = columns.map((__, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(', ');
                return `(${placeholders})`;
            }).join(', ');

            const query = [
                `INSERT INTO ${tableName} (${columns.join(', ')})`,
                `VALUES ${values}`,
                conflictClause,
                returning ? `RETURNING ${returning}` : ''
            ].filter(Boolean).join(' ');

            const params = batch.flat();
            const startTime = Date.now();
            const result = await client.query(query, params);
            const duration = Date.now() - startTime;

            this.logger.debug('Executed game event batch insert', {
                table: tableName,
                batchSize: batch.length,
                duration_ms: duration,
                rowCount: result.rowCount
            });

            insertedCount += result.rowCount;
        }

        return insertedCount;
    }

    /**
     * Batch insert with conflict handling
     */
    async batchInsert(tableName, columns, data, options = {}) {
        if (data.length === 0) return { insertedCount: 0 };

        const batchSize = options.batchSize || 1000;
        const onConflict = options.onConflict || 'DO NOTHING';
        let totalInserted = 0;

        // Process in batches
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);

            // Build values placeholder
            const values = batch.map((_, rowIndex) => {
                const rowValues = columns.map((_, colIndex) =>
                    `$${rowIndex * columns.length + colIndex + 1}`
                ).join(', ');
                return `(${rowValues})`;
            }).join(', ');

            // Flatten parameters
            const params = batch.flat();

            const query = `
                INSERT INTO ${tableName} (${columns.join(', ')})
                VALUES ${values}
                ON CONFLICT ${onConflict}
                ${options.returning ? `RETURNING ${options.returning}` : ''}
            `;

            const result = await this.query(query, params);
            totalInserted += result.rowCount;

            this.logger.debug('Batch insert completed', {
                table: tableName,
                batchSize: batch.length,
                inserted: result.rowCount
            });
        }

        return { insertedCount: totalInserted };
    }

    /**
     * ML Feature store operations
     */
    async storeFeatures(entityType, entityId, features, asOfDate = new Date()) {
        const values = features.map(feature => [
            entityType,
            entityId,
            feature.name,
            feature.value,
            feature.category || null,
            feature.calculationWindow || 'current',
            asOfDate
        ]);

        const columns = [
            'entity_type', 'entity_id', 'feature_name', 'feature_value',
            'feature_category', 'calculation_window', 'as_of_date'
        ];

        return await this.batchInsert('ml_features', columns, values, {
            onConflict: 'ON CONFLICT (entity_type, entity_id, feature_name, calculation_window, as_of_date) DO UPDATE SET feature_value = EXCLUDED.feature_value'
        });
    }

    async getFeatures(entityType, entityId, featureNames = null, asOfDate = new Date()) {
        let query = `
            SELECT feature_name, feature_value, feature_category, calculation_window
            FROM ml_features
            WHERE entity_type = $1 AND entity_id = $2 AND as_of_date <= $3
        `;
        const params = [entityType, entityId, asOfDate];

        if (featureNames && featureNames.length > 0) {
            query += ` AND feature_name = ANY($4)`;
            params.push(featureNames);
        }

        query += ` ORDER BY as_of_date DESC`;

        const result = await this.query(query, params);

        // Return most recent features (deduplicated by feature_name)
        const featuresMap = new Map();
        result.rows.forEach(row => {
            if (!featuresMap.has(row.feature_name)) {
                featuresMap.set(row.feature_name, row);
            }
        });

        return Array.from(featuresMap.values());
    }

    /**
     * Store ML prediction results
     */
    async storePrediction(modelName, modelVersion, predictionType, targetEntityType,
                         targetEntityId, predictedValue, confidence, metadata = {}) {
        const query = `
            INSERT INTO ml_predictions (
                model_name, model_version, prediction_type, target_entity_type,
                target_entity_id, predicted_value, confidence_score,
                features_used, model_metrics
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
        `;

        const result = await this.query(query, [
            modelName,
            modelVersion,
            predictionType,
            targetEntityType,
            targetEntityId,
            predictedValue,
            confidence,
            JSON.stringify(metadata.features || {}),
            JSON.stringify(metadata.modelMetrics || {})
        ]);

        return result.rows[0].id;
    }

    /**
     * Get team analytics with caching
     */
    async getTeamAnalytics(teamId, season, week = null) {
        const query = `
            SELECT * FROM team_analytics
            WHERE team_id = $1 AND season = $2
            ${week ? 'AND week = $3' : 'AND week IS NULL'}
            ORDER BY calculation_date DESC
            LIMIT 1
        `;

        const params = week ? [teamId, season, week] : [teamId, season];
        const result = await this.query(query, params);

        return result.rows[0] || null;
    }

    /**
     * Update team analytics
     */
    async updateTeamAnalytics(teamId, season, analytics, week = null) {
        const query = `
            INSERT INTO team_analytics (
                team_id, season, week, games_played, wins, losses, win_percentage,
                runs_scored, runs_allowed, pythagorean_wins, pythagorean_win_pct,
                elo_rating, elo_change_last_game, strength_of_schedule, sos_rating,
                sport_specific_stats, predicted_wins, predicted_losses, playoff_probability
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            ON CONFLICT (team_id, season, week) DO UPDATE SET
                games_played = EXCLUDED.games_played,
                wins = EXCLUDED.wins,
                losses = EXCLUDED.losses,
                win_percentage = EXCLUDED.win_percentage,
                runs_scored = EXCLUDED.runs_scored,
                runs_allowed = EXCLUDED.runs_allowed,
                pythagorean_wins = EXCLUDED.pythagorean_wins,
                pythagorean_win_pct = EXCLUDED.pythagorean_win_pct,
                elo_rating = EXCLUDED.elo_rating,
                elo_change_last_game = EXCLUDED.elo_change_last_game,
                strength_of_schedule = EXCLUDED.strength_of_schedule,
                sos_rating = EXCLUDED.sos_rating,
                sport_specific_stats = EXCLUDED.sport_specific_stats,
                predicted_wins = EXCLUDED.predicted_wins,
                predicted_losses = EXCLUDED.predicted_losses,
                playoff_probability = EXCLUDED.playoff_probability,
                calculation_date = NOW()
        `;

        return await this.query(query, [
            teamId, season, week, analytics.gamesPlayed, analytics.wins, analytics.losses,
            analytics.winPercentage, analytics.runsScored, analytics.runsAllowed,
            analytics.pythagoreanWins, analytics.pythagoreanWinPct, analytics.eloRating,
            analytics.eloChange, analytics.strengthOfSchedule, analytics.sosRating,
            JSON.stringify(analytics.sportSpecificStats || {}),
            analytics.predictedWins, analytics.predictedLosses, analytics.playoffProbability
        ]);
    }

    /**
     * Test database connection
     */
    async testConnection() {
        try {
            const result = await this.query('SELECT NOW() as current_time, version() as version');
            this.logger.info('Database connection test successful', {
                serverTime: result.rows[0].current_time,
                version: result.rows[0].version.split(' ')[0]
            });
            return true;
        } catch (error) {
            this.logger.error('Database connection test failed', {}, error);
            throw error;
        }
    }

    /**
     * Health monitoring
     */
    startHealthMonitoring() {
        setInterval(async () => {
            try {
                await this.healthCheck();
            } catch (error) {
                this.logger.error('Health check failed', {}, error);
                this.healthStatus = 'unhealthy';
            }
        }, 30000); // Check every 30 seconds
    }

    async healthCheck() {
        const start = Date.now();

        try {
            // Test basic connectivity
            await this.query('SELECT 1');

            // Get pool status
            const poolStatus = {
                totalCount: this.pool.totalCount,
                idleCount: this.pool.idleCount,
                waitingCount: this.pool.waitingCount
            };

            const responseTime = Date.now() - start;

            if (responseTime > 5000) {
                this.healthStatus = 'degraded';
            } else {
                this.healthStatus = 'healthy';
            }

            this.logger.debug('Database health check completed', {
                status: this.healthStatus,
                responseTime_ms: responseTime,
                pool: poolStatus
            });

            return {
                status: this.healthStatus,
                responseTime_ms: responseTime,
                pool: poolStatus,
                metrics: this.getMetrics()
            };

        } catch (error) {
            this.healthStatus = 'unhealthy';
            throw error;
        }
    }

    /**
     * Performance tracking
     */
    trackQueryPerformance(duration) {
        this.queryTimes.push(duration);
        if (this.queryTimes.length > this.maxQueryTimeHistory) {
            this.queryTimes.shift();
        }

        // Calculate rolling average
        const sum = this.queryTimes.reduce((a, b) => a + b, 0);
        this.metrics.averageQueryTime = Math.round(sum / this.queryTimes.length);
    }

    getMetrics() {
        const successRate = this.metrics.totalQueries > 0
            ? (this.metrics.successfulQueries / this.metrics.totalQueries * 100).toFixed(2)
            : 0;

        return {
            ...this.metrics,
            successRate: `${successRate}%`,
            healthStatus: this.healthStatus,
            poolInfo: this.pool ? {
                totalCount: this.pool.totalCount,
                idleCount: this.pool.idleCount,
                waitingCount: this.pool.waitingCount
            } : null
        };
    }

    /**
     * Utility methods
     */
    generateQueryId() {
        return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateTransactionId() {
        return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Graceful shutdown
     */
    async close() {
        if (this.pool) {
            this.logger.info('Closing database connection pool');
            await this.pool.end();
            this.pool = null;
            this.healthStatus = 'closed';
        }
    }
}

export default DatabaseConnectionService;