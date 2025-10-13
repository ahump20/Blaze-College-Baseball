# Migration Log

## 2025-10-13
- Added Prisma data model (`prisma/schema.prisma`) covering teams, players, games, events, box lines, stats, rankings, and articles for the college baseball platform foundation.
- Generated initial Prisma migration (`prisma/migrations/20251013000000_init`) targeting PostgreSQL.
- Archived legacy SQLite schema and seed scripts into `backups/sqlite-legacy/` to avoid conflicts with the new Prisma workflow.
