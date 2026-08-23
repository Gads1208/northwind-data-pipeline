.PHONY: help build up down restart logs test ingest dbt-run dbt-test pipeline

help:
	@echo "Northwind AI Platform Management Commands:"
	@echo "  make build     - Build all Docker images"
	@echo "  make up        - Launch full environment via Docker Compose"
	@echo "  make down      - Stop all running containers"
	@echo "  make logs      - Tail logs for all services"
	@echo "  make test      - Run automated unit test suite"
	@echo "  make ingest    - Sync data from PostgreSQL to BigQuery Bronze"
	@echo "  make dbt-run   - Execute dbt transformations (Silver & Gold)"
	@echo "  make dbt-test  - Execute dbt data quality tests"
	@echo "  make pipeline  - Run full pipeline: ingest -> dbt-run -> dbt-test"

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down -v

restart: down up

logs:
	docker compose logs -f

test:
	python3 -m unittest discover -s tests -p "test_*.py"

ingest:
	docker exec northwind-backend python airflow/scripts/postgres_to_bigquery.py

dbt-run:
	docker exec northwind-backend dbt run --project-dir /app/dbt/northwind_dw --profiles-dir /app/dbt

dbt-test:
	docker exec northwind-backend dbt test --project-dir /app/dbt/northwind_dw --profiles-dir /app/dbt

pipeline: ingest dbt-run dbt-test

