.PHONY: help build up down restart logs test seed

help:
	@echo "Northwind AI Platform Management Commands:"
	@echo "  make build   - Build all Docker images"
	@echo "  make up      - Launch full environment via Docker Compose"
	@echo "  make down    - Stop all running containers"
	@echo "  make logs    - Tail logs for all services"
	@echo "  make test    - Run automated test suite"

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
	pytest tests/
