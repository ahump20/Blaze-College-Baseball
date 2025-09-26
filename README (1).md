# Blaze Sports Intel NIL Valuation Pipeline

## Overview
Production-ready system for valuing college athlete NIL (Name, Image, Likeness) potential using multi-source data fusion, attention metrics, and ML modeling.

## Quick Start

```bash
# 1. Clone and setup
git clone <repo>
cd blaze-nil-pipeline

# 2. Environment setup
cp .env.example .env
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Start services
docker-compose up -d  # Postgres + Redis
python scripts/init_db.py  # Create tables
python scripts/seed_data.py  # Load sample athletes

# 4. Run ETL pipeline
prefect server start  # In terminal 1
python etl/orchestrator.py  # In terminal 2

# 5. Start API
uvicorn api.main:app --reload --port 8000
```

## Architecture

### Data Flow
1. **Ingestion**: Nightly ETL pulls box scores, social stats, search trends
2. **Storage**: Postgres (structured) + S3/local (raw files)
3. **Feature Engineering**: Compute Attention Score & Performance Index
4. **Modeling**: 2-stage ML with Bayesian shrinkage
5. **Serving**: FastAPI with Redis cache

### Key Metrics
- **Attention Score**: Weighted blend of social followers, engagement rate, search interest
- **Performance Index**: Sport-specific statistical performance normalized by position
- **NIL Value**: Dollar estimate with 90% confidence interval

## API Endpoints

```
GET /athlete/{id}/value     # Individual athlete valuation
GET /leaderboard            # Top 100 athletes with trends
GET /health                 # System status
```

## Configuration

Edit `config/pipeline.yaml`:
- Data source credentials
- Model hyperparameters
- Cache TTL settings
- Market size mappings

## Testing

```bash
pytest tests/  # Run all tests
pytest tests/test_api.py -v  # API tests only
```

## Performance

- ETL: ~5 min for 10,000 athletes
- Model training: ~15 min on CPU
- API response: <100ms (cached), <500ms (cold)
- Storage: ~1GB per month of historical data

## Compliance

**DISCLAIMER**: All valuations are estimates for informational purposes only, not contractual offers or guarantees.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection error | Check Postgres container: `docker-compose logs postgres` |
| ETL job stuck | Reset Prefect: `prefect orion database reset` |
| Cache miss rate high | Increase Redis memory in docker-compose.yml |
| Model accuracy low | Retrain with more recent data: `python models/train.py --recent` |

## License
MIT
