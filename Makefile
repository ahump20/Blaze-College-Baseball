# Blaze Biomechanics Vision System - Makefile
# One-command operations for development and production

.PHONY: help up down dev test build clean logs

# Default target
help:
	@echo "Blaze Biomechanics Vision System - Available Commands:"
	@echo ""
	@echo "  make up          - Start all services in production mode"
	@echo "  make dev         - Start all services in development mode with hot reload"
	@echo "  make down        - Stop all services"
	@echo "  make test        - Run test suite"
	@echo "  make build       - Build all Docker images"
	@echo "  make clean       - Clean up containers, volumes, and cached data"
	@echo "  make logs        - Show logs from all services"
	@echo "  make seed        - Load sample data"
	@echo "  make format      - Format code with black/prettier"
	@echo "  make deploy-cf   - Deploy to Cloudflare"
	@echo "  make deploy-aws  - Deploy to AWS"

# Start all services in production mode
up:
	@echo "🚀 Starting Blaze Biomechanics Vision System..."
	@if [ ! -f .env ]; then cp .env.example .env; fi
	docker-compose up -d
	@echo "✅ System running at:"
	@echo "   Dashboard: http://localhost:3000"
	@echo "   API: http://localhost:8000"
	@echo "   API Docs: http://localhost:8000/docs"
	@echo "   MinIO: http://localhost:9001"
	@echo "   Grafana: http://localhost:3001"

# Start in development mode with hot reload
dev:
	@echo "🔧 Starting in development mode..."
	@if [ ! -f .env ]; then cp .env.example .env; fi
	docker-compose -f docker-compose.yml up
	
# Stop all services
down:
	@echo "🛑 Stopping all services..."
	docker-compose down

# Run tests
test:
	@echo "🧪 Running test suite..."
	docker-compose run --rm api pytest tests/ -v --cov=api --cov-report=term-missing
	docker-compose run --rm frontend npm test

# Build all images
build:
	@echo "🔨 Building Docker images..."
	docker-compose build --no-cache

# Build for production
build-prod:
	@echo "📦 Building production images..."
	docker build -t blaze-biomech-api:latest -f api/Dockerfile.prod api/
	docker build -t blaze-biomech-frontend:latest -f frontend/Dockerfile.prod frontend/
	docker build -t blaze-biomech-processor:latest -f processor/Dockerfile.prod processor/

# Clean up everything
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down -v
	docker system prune -f
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	rm -rf .pytest_cache 2>/dev/null || true
	rm -rf frontend/node_modules 2>/dev/null || true

# View logs
logs:
	docker-compose logs -f

# View specific service logs
logs-api:
	docker-compose logs -f api

logs-processor:
	docker-compose logs -f processor

logs-frontend:
	docker-compose logs -f frontend

# Load sample data
seed:
	@echo "📊 Loading sample data..."
	docker-compose run --rm api python scripts/seed_data.py

# Format code
format:
	@echo "✨ Formatting code..."
	docker-compose run --rm api black .
	docker-compose run --rm api isort .
	docker-compose run --rm frontend npm run format

# Lint code
lint:
	@echo "🔍 Linting code..."
	docker-compose run --rm api pylint api/
	docker-compose run --rm api mypy api/
	docker-compose run --rm frontend npm run lint

# Database operations
db-migrate:
	@echo "📈 Running database migrations..."
	docker-compose run --rm api alembic upgrade head

db-rollback:
	@echo "📉 Rolling back last migration..."
	docker-compose run --rm api alembic downgrade -1

db-reset:
	@echo "♻️ Resetting database..."
	docker-compose down -v postgres
	docker-compose up -d postgres
	sleep 5
	$(MAKE) db-migrate
	$(MAKE) seed

# MinIO setup
minio-setup:
	@echo "🗄️ Setting up MinIO buckets..."
	docker-compose run --rm api python scripts/setup_minio.py

# Health check
health:
	@echo "🏥 Checking system health..."
	@curl -s http://localhost:8000/health | python -m json.tool

# Performance test
perf-test:
	@echo "⚡ Running performance tests..."
	docker-compose run --rm api locust -f tests/performance/locustfile.py --host=http://api:8000

# Security scan
security-scan:
	@echo "🔒 Running security scan..."
	docker-compose run --rm api bandit -r api/ -f json -o security-report.json
	docker-compose run --rm api safety check

# Deploy to Cloudflare
deploy-cf:
	@echo "☁️ Deploying to Cloudflare..."
	./scripts/deploy_cloudflare.sh

# Deploy to AWS
deploy-aws:
	@echo "☁️ Deploying to AWS..."
	./scripts/deploy_aws.sh

# Create a backup
backup:
	@echo "💾 Creating backup..."
	@mkdir -p backups
	@TIMESTAMP=$$(date +%Y%m%d_%H%M%S); \
	docker-compose exec -T postgres pg_dump -U blaze blaze_biomech > backups/db_backup_$$TIMESTAMP.sql; \
	echo "Backup saved to backups/db_backup_$$TIMESTAMP.sql"

# Restore from backup
restore:
	@echo "♻️ Restoring from backup..."
	@read -p "Enter backup filename: " BACKUP_FILE; \
	docker-compose exec -T postgres psql -U blaze blaze_biomech < backups/$$BACKUP_FILE; \
	echo "Restored from $$BACKUP_FILE"

# Monitor resource usage
monitor:
	@echo "📊 Monitoring resource usage..."
	docker stats --no-stream

# Quick restart
restart: down up

# Development setup
setup:
	@echo "🎯 Setting up development environment..."
	@if [ ! -f .env ]; then cp .env.example .env; fi
	@echo "Installing git hooks..."
	@cp scripts/pre-commit .git/hooks/pre-commit 2>/dev/null || true
	@chmod +x .git/hooks/pre-commit 2>/dev/null || true
	@echo "✅ Development environment ready!"

# Open interactive shells
shell-api:
	docker-compose exec api /bin/bash

shell-db:
	docker-compose exec postgres psql -U blaze blaze_biomech

shell-redis:
	docker-compose exec redis redis-cli

# Generate API documentation
docs:
	@echo "📚 Generating API documentation..."
	docker-compose run --rm api python -m mkdocs build

# Quick development cycle
quick: format lint test
	@echo "✅ Code formatted, linted, and tested!"

.DEFAULT_GOAL := help
