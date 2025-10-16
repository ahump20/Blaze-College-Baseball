import { Pool, PoolClient, type QueryResultRow } from 'pg';
import pino from 'pino';

const logger = pino({ name: 'postgres-pool', level: process.env.LOG_LEVEL || 'info' });

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });

    pool.on('error', (err: Error) => {
      logger.error({ err }, 'PostgreSQL pool error');
    });
  }

  return pool;
}

export function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: any[]) {
  return getPool().query<T>(text, params);
}

export async function withTransaction<T>(callback: (client: PoolClientLike) => Promise<T>): Promise<T> {
  const poolInstance = getPool();
  const client = await poolInstance.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export type PoolClientLike = PoolClient;
