# Makefile para gerenciar o projeto Northwind Data Pipeline

.PHONY: help up down restart logs clean test install

help: ## Mostra esta mensagem de ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

up: ## Inicia todos os serviços
	docker-compose up -d
	@echo "✅ Serviços iniciados!"
	@echo "- Airflow: http://localhost:8080 (airflow/airflow)"
	@echo "- Airbyte: http://localhost:8000"
	@echo "- PostgreSQL: localhost:5432 (postgres/postgres)"

down: ## Para todos os serviços
	docker-compose down
	@echo "✅ Serviços parados!"

restart: ## Reinicia todos os serviços
	docker-compose restart
	@echo "✅ Serviços reiniciados!"

logs: ## Exibe logs de todos os serviços
	docker-compose logs -f

logs-airflow: ## Exibe logs do Airflow
	docker-compose logs -f airflow-webserver airflow-scheduler

logs-airbyte: ## Exibe logs do Airbyte
	docker-compose logs -f airbyte-server airbyte-worker

logs-postgres: ## Exibe logs do PostgreSQL
	docker-compose logs -f postgres

clean: ## Remove todos os containers e volumes (CUIDADO!)
	@echo "⚠️  ATENÇÃO: Isso vai remover TODOS os dados!"
	@read -p "Tem certeza? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "✅ Limpeza concluída!"; \
	else \
		echo "❌ Cancelado"; \
	fi

ps: ## Lista status dos containers
	docker-compose ps

shell-airflow: ## Abre shell no container do Airflow
	docker exec -it airflow-webserver bash

shell-postgres: ## Abre psql no PostgreSQL
	docker exec -it northwind-postgres psql -U postgres -d northwind

dbt-run: ## Executa todas as transformações dbt
	docker exec -it airflow-webserver bash -c "cd /opt/airflow/dbt/northwind_dw && dbt run --profiles-dir /opt/airflow/dbt"

dbt-test: ## Executa testes do dbt
	docker exec -it airflow-webserver bash -c "cd /opt/airflow/dbt/northwind_dw && dbt test --profiles-dir /opt/airflow/dbt"

dbt-docs: ## Gera documentação do dbt
	docker exec -it airflow-webserver bash -c "cd /opt/airflow/dbt/northwind_dw && dbt docs generate --profiles-dir /opt/airflow/dbt"

dbt-bronze: ## Executa apenas camada Bronze
	docker exec -it airflow-webserver bash -c "cd /opt/airflow/dbt/northwind_dw && dbt run --select tag:bronze --profiles-dir /opt/airflow/dbt"

dbt-silver: ## Executa apenas camada Silver
	docker exec -it airflow-webserver bash -c "cd /opt/airflow/dbt/northwind_dw && dbt run --select tag:silver --profiles-dir /opt/airflow/dbt"

dbt-gold: ## Executa apenas camada Gold
	docker exec -it airflow-webserver bash -c "cd /opt/airflow/dbt/northwind_dw && dbt run --select tag:gold --profiles-dir /opt/airflow/dbt"

backup-postgres: ## Faz backup do banco PostgreSQL
	@mkdir -p backups
	docker exec northwind-postgres pg_dump -U postgres northwind > backups/northwind_backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup criado em backups/"

restore-postgres: ## Restaura backup do PostgreSQL (uso: make restore-postgres FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then echo "❌ Uso: make restore-postgres FILE=backup.sql"; exit 1; fi
	docker exec -i northwind-postgres psql -U postgres northwind < $(FILE)
	@echo "✅ Backup restaurado!"

install: ## Instala dependências Python localmente
	pip install dbt-bigquery apache-airflow==2.8.0

check-health: ## Verifica saúde dos serviços
	@echo "🔍 Verificando serviços..."
	@echo -n "Postgres: "
	@docker exec northwind-postgres pg_isready -U postgres && echo "✅" || echo "❌"
	@echo -n "Airflow: "
	@curl -s http://localhost:8080/health | grep -q "healthy" && echo "✅" || echo "❌"
	@echo -n "Airbyte: "
	@curl -s http://localhost:8000/api/v1/health | grep -q "available" && echo "✅" || echo "❌"

setup-env: ## Cria arquivo .env a partir do exemplo
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ Arquivo .env criado! Edite com suas configurações."; \
	else \
		echo "⚠️  Arquivo .env já existe!"; \
	fi
