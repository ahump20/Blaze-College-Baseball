# Migration Log

## 2024-10-08
- Added NCAA LiveStats TCP client, DiamondKast polling adapter, and NCAA boxscore scraper to support live and fallback NCAA baseball ingest.
- Refactored `api/perfect-game-pipeline.js` for dependency injection and normalized ingest flows.
- Registered the new adapters inside `api/sports-data-service.js` and documented required environment variables in `README.md`.
- Introduced `tests/perfect-game-pipeline.test.js` to cover normalization logic using mocked streams.
