import { readFile } from 'fs/promises';
import path from 'path';
import { Client } from 'pg';
import pino from 'pino';

const logger = pino({ name: 'prisma-seed', level: process.env.LOG_LEVEL || 'info' });

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const sqlPath = path.join(process.cwd(), 'prisma', 'seeds', 'base_data.sql');
  const sql = await readFile(sqlPath, 'utf-8');

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    await client.query(sql);
    logger.info('Seed data executed successfully');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  logger.error({ err: error }, 'Failed to seed baseline data');
  process.exitCode = 1;
});
