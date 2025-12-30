# ⚡ Guia de Comandos Rápidos

Referência rápida de comandos para gerenciar o projeto Northwind Data Pipeline.

---

## 🚀 Início Rápido

```bash
# Setup completo em um comando
./setup.sh

# Ou manualmente:
cp .env.example .env          # Copiar configurações
docker-compose up -d          # Iniciar containers
make check-health             # Verificar saúde
```

---

## 🐳 Gerenciamento de Containers

### Iniciar/Parar

```bash
# Iniciar todos os serviços
make up
# ou
docker-compose up -d

# Parar todos os serviços
make down
# ou
docker-compose down

# Reiniciar serviços
make restart
# ou
docker-compose restart

# Ver status dos containers
make ps
# ou
docker-compose ps
```

### Logs

```bash
# Ver logs de todos os serviços
make logs
# ou
docker-compose logs -f

# Logs específicos
make logs-airflow        # Airflow apenas
make logs-airbyte        # Airbyte apenas
make logs-postgres       # PostgreSQL apenas

# Logs de um container específico
docker-compose logs -f [nome-do-container]
```

### Shell nos Containers

```bash
# Airflow
make shell-airflow
# ou
docker exec -it airflow-webserver bash

# PostgreSQL
make shell-postgres
# ou
docker exec -it northwind-postgres psql -U postgres -d northwind

# Qualquer container
docker exec -it [nome-do-container] bash
```

---

## 💾 PostgreSQL

### Conectar ao Banco

```bash
# Via container
docker exec -it northwind-postgres psql -U postgres -d northwind

# Via cliente local (se tiver psql instalado)
psql -h localhost -p 5432 -U postgres -d northwind
```

### Comandos SQL Úteis

```sql
-- Listar tabelas
\dt

-- Descrever tabela
\d customers

-- Contar registros
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM orders;

-- Ver dados
SELECT * FROM customers LIMIT 5;

-- Sair
\q
```

### Backup e Restore

```bash
# Criar backup
make backup-postgres
# ou
docker exec northwind-postgres pg_dump -U postgres northwind > backup.sql

# Restaurar backup
make restore-postgres FILE=backup.sql
# ou
docker exec -i northwind-postgres psql -U postgres northwind < backup.sql
```

---

## 🔄 dbt

### Comandos Básicos

```bash
# Executar todos os modelos
make dbt-run
# ou
docker exec -it airflow-webserver bash -c "cd /opt/airflow/dbt/northwind_dw && dbt run --profiles-dir /opt/airflow/dbt"

# Executar testes
make dbt-test
# ou
docker exec -it airflow-webserver bash -c "cd /opt/airflow/dbt/northwind_dw && dbt test --profiles-dir /opt/airflow/dbt"

# Gerar documentação
make dbt-docs
# ou
docker exec -it airflow-webserver bash -c "cd /opt/airflow/dbt/northwind_dw && dbt docs generate --profiles-dir /opt/airflow/dbt"
```

### Por Camada

```bash
# Bronze apenas
make dbt-bronze
# ou
docker exec -it airflow-webserver bash -c "cd /opt/airflow/dbt/northwind_dw && dbt run --select tag:bronze --profiles-dir /opt/airflow/dbt"

# Silver apenas
make dbt-silver

# Gold apenas
make dbt-gold
```

### Comandos Avançados

```bash
# Dentro do container do Airflow
docker exec -it airflow-webserver bash
cd /opt/airflow/dbt/northwind_dw

# Executar modelo específico
dbt run --select bronze_customers --profiles-dir /opt/airflow/dbt

# Executar modelo e dependências
dbt run --select +silver_dim_customers --profiles-dir /opt/airflow/dbt

# Executar modelo e downstream
dbt run --select silver_dim_customers+ --profiles-dir /opt/airflow/dbt

# Debug (testar conexão)
dbt debug --profiles-dir /opt/airflow/dbt

# Compilar sem executar
dbt compile --profiles-dir /opt/airflow/dbt

# Ver lineage
dbt docs serve --profiles-dir /opt/airflow/dbt --port 8081
```

---

## ✈️ Apache Airflow

### Acessar

```
URL: http://localhost:8080
Usuário: airflow
Senha: airflow
```

### Comandos CLI

```bash
# Listar DAGs
docker exec -it airflow-scheduler airflow dags list

# Ver informações de um DAG
docker exec -it airflow-scheduler airflow dags show northwind_data_pipeline

# Trigger manual de um DAG
docker exec -it airflow-scheduler airflow dags trigger northwind_data_pipeline

# Pausar/Despausar DAG
docker exec -it airflow-scheduler airflow dags pause northwind_data_pipeline
docker exec -it airflow-scheduler airflow dags unpause northwind_data_pipeline

# Ver tasks de um DAG
docker exec -it airflow-scheduler airflow tasks list northwind_data_pipeline

# Testar uma task específica
docker exec -it airflow-scheduler airflow tasks test northwind_data_pipeline dbt_run_bronze 2024-01-01

# Ver logs de uma task
docker exec -it airflow-scheduler airflow tasks logs northwind_data_pipeline dbt_run_bronze 2024-01-01
```

---

## 🔌 Airbyte

### Acessar

```
URL: http://localhost:8000
(First time: create account)
```

### Via API (avançado)

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Listar connections (requer autenticação)
curl -X POST http://localhost:8000/api/v1/connections/list \
  -H "Content-Type: application/json" \
  -d '{"workspaceId": "your-workspace-id"}'
```

---

## ☁️ Google BigQuery

### Via CLI (gcloud)

```bash
# Listar datasets
bq ls

# Listar tabelas em um dataset
bq ls northwind_bronze
bq ls northwind_silver
bq ls northwind_gold

# Ver schema de uma tabela
bq show northwind_bronze.bronze_customers

# Executar query
bq query --use_legacy_sql=false 'SELECT COUNT(*) FROM `project-id.northwind_bronze.bronze_customers`'

# Copiar tabela
bq cp northwind_silver.silver_dim_customers northwind_backup.customers_backup

# Deletar tabela
bq rm -t northwind_backup.customers_backup
```

### Queries Úteis

```bash
# Contar registros em todas as camadas
bq query --use_legacy_sql=false '
SELECT 
  "Bronze" as layer, COUNT(*) as records 
FROM `project-id.northwind_bronze.bronze_orders`
UNION ALL
SELECT 
  "Silver" as layer, COUNT(*) as records 
FROM `project-id.northwind_silver.silver_fact_orders`
UNION ALL
SELECT 
  "Gold" as layer, COUNT(*) as records 
FROM `project-id.northwind_gold.gold_sales_by_country`
'

# Ver queries recentes
bq ls -j -a -n 10
```

---

## 🧹 Manutenção

### Limpeza

```bash
# Limpar containers parados
docker container prune

# Limpar imagens não usadas
docker image prune -a

# Limpar volumes não usados
docker volume prune

# Limpar tudo (CUIDADO!)
make clean
# ou
docker system prune -a --volumes
```

### Atualização

```bash
# Atualizar imagens Docker
docker-compose pull

# Recriar containers
docker-compose up -d --force-recreate

# Atualizar dependências dbt
docker exec -it airflow-webserver bash -c "cd /opt/airflow/dbt/northwind_dw && dbt deps --profiles-dir /opt/airflow/dbt"
```

### Verificação de Saúde

```bash
# Check completo
make check-health

# Manualmente
curl -s http://localhost:8080/health | jq              # Airflow
curl -s http://localhost:8000/api/v1/health | jq       # Airbyte
docker exec northwind-postgres pg_isready -U postgres   # PostgreSQL
```

---

## 🔍 Troubleshooting

### Containers não iniciam

```bash
# Ver logs de erro
docker-compose logs

# Parar tudo e reiniciar
docker-compose down
docker-compose up -d

# Remover e recriar (CUIDADO: perde dados)
docker-compose down -v
docker-compose up -d
```

### Sem espaço em disco

```bash
# Ver uso de disco do Docker
docker system df

# Limpar cache do Docker
docker builder prune

# Limpar tudo não usado
docker system prune -a --volumes
```

### Porta já em uso

```bash
# Ver o que está usando a porta
sudo lsof -i :8080  # Airflow
sudo lsof -i :8000  # Airbyte
sudo lsof -i :5432  # PostgreSQL

# Matar processo
sudo kill -9 [PID]

# Ou alterar porta no docker-compose.yml
```

### dbt não conecta ao BigQuery

```bash
# Verificar arquivo de credenciais
ls -la gcp-key.json

# Verificar variáveis de ambiente
docker exec -it airflow-webserver env | grep GCP

# Testar conexão
docker exec -it airflow-webserver bash -c "cd /opt/airflow/dbt/northwind_dw && dbt debug --profiles-dir /opt/airflow/dbt"
```

### Airbyte sync falha

```bash
# Ver logs do worker
docker-compose logs airbyte-worker

# Testar conectividade Postgres
docker exec -it airbyte-worker ping postgres

# Reiniciar Airbyte
docker-compose restart airbyte-server airbyte-worker
```

---

## 📊 Monitoramento

### Métricas do Sistema

```bash
# Ver uso de recursos
docker stats

# Ver apenas containers do projeto
docker stats $(docker-compose ps -q)

# Disco usado pelos volumes
docker system df -v
```

### Logs Importantes

```bash
# Logs de erro apenas
docker-compose logs | grep -i error

# Últimas 100 linhas
docker-compose logs --tail=100

# Desde um horário específico
docker-compose logs --since 2024-01-01T00:00:00
```

---

## 🎯 Workflows Comuns

### Desenvolvimento de novo modelo dbt

```bash
# 1. Criar arquivo SQL
nano dbt/northwind_dw/models/gold/gold_new_metric.sql

# 2. Testar compilação
docker exec -it airflow-webserver bash -c "cd /opt/airflow/dbt/northwind_dw && dbt compile --select gold_new_metric --profiles-dir /opt/airflow/dbt"

# 3. Executar modelo
docker exec -it airflow-webserver bash -c "cd /opt/airflow/dbt/northwind_dw && dbt run --select gold_new_metric --profiles-dir /opt/airflow/dbt"

# 4. Ver resultado no BigQuery
bq query --use_legacy_sql=false 'SELECT * FROM `project-id.northwind_gold.gold_new_metric` LIMIT 10'
```

### Deploy para produção

```bash
# 1. Testar tudo localmente
make dbt-test

# 2. Commit changes
git add .
git commit -m "Add new feature"
git push origin main

# 3. Em produção (se tiver CD automático)
# Apenas push para main

# 4. Ou manualmente em prod
ssh prod-server
cd northwind-data-pipeline
git pull
docker-compose up -d
```

### Reprocessar dados

```bash
# 1. Truncar tabelas (se necessário)
# No BigQuery: TRUNCATE TABLE northwind_silver.silver_dim_customers

# 2. Reexecutar dbt
make dbt-run

# 3. Verificar resultados
bq query --use_legacy_sql=false 'SELECT COUNT(*) FROM `project-id.northwind_silver.silver_dim_customers`'
```

---

## 📚 Recursos Adicionais

### Documentação

- Ver README completo: `cat README.md`
- Ver arquitetura: `cat docs/ARCHITECTURE.md`
- Ver setup: `cat docs/SETUP.md`
- Ver dicionário: `cat docs/DATA_DICTIONARY.md`

### Atalhos Úteis

```bash
# Adicionar ao seu .bashrc ou .zshrc

alias nw='cd ~/northwind-data-pipeline'
alias nw-up='cd ~/northwind-data-pipeline && make up'
alias nw-down='cd ~/northwind-data-pipeline && make down'
alias nw-logs='cd ~/northwind-data-pipeline && make logs'
alias nw-dbt='docker exec -it airflow-webserver bash -c "cd /opt/airflow/dbt/northwind_dw && dbt"'
```

### Ferramentas de Desenvolvimento

```bash
# Instalar dbt localmente (opcional)
pip install dbt-bigquery

# Instalar Google Cloud SDK
curl https://sdk.cloud.google.com | bash

# Instalar clientes PostgreSQL
sudo apt-get install postgresql-client  # Linux
brew install postgresql                  # macOS
```

---

**💡 Dica**: Use `make help` para ver todos os comandos disponíveis!

**📖 Para mais detalhes, consulte**: 
- [README.md](../README.md)
- [docs/SETUP.md](SETUP.md)
- [docs/ARCHITECTURE.md](ARCHITECTURE.md)

---

**Última atualização**: 29/12/2024
