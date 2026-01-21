## ✅ STATUS DO PROJETO

**Containers Docker**: ✅ Rodando (4 containers)
- ✅ PostgreSQL com dados Northwind (5 clientes, 5 pedidos)
- ✅ Airflow Webserver (http://localhost:8080)
- ✅ Airflow Scheduler
- ✅ Airflow Database

**Nota sobre Ingestão**: Este projeto usa **scripts Python customizados no Airflow** para extrair dados do PostgreSQL e carregar no BigQuery, eliminando a necessidade do Airbyte. Veja [airflow/scripts/postgres_to_bigquery.py](airflow/scripts/postgres_to_bigquery.py) para detalhes.

---

## 🚀 Quick Start (Versão Simplificada)

### 1. Verifique os containers

```bash
docker-compose ps
```

### 2. Acesse os serviços

- **Airflow UI**: http://localhost:8080
  - Username: `airflow`
  - Password: `airflow`

- **PostgreSQL**: `localhost:5432`
  - Database: `northwind`
  - Username: `postgres`
  - Password: `postgres`

### 3. Verifique os dados no Postgres

```bash
docker exec -it northwind-postgres psql -U postgres -d northwind
```

```sql
\dt                              -- Listar tabelas
SELECT COUNT(*) FROM customers;  -- Ver dados
SELECT * FROM orders LIMIT 5;    -- Ver pedidos
\q                               -- Sair
```

### 4. Configurar Google Cloud Platform

Antes de executar o pipeline completo, você precisa:

1. **Criar projeto no GCP** e habilitar BigQuery API
2. **Criar Service Account** e baixar a chave JSON
3. **Salvar a chave** como `gcp-key.json` na raiz do projeto
4. **Configurar variável de ambiente**:

```bash
# Editar arquivo .env
echo "GCP_PROJECT_ID=seu-projeto-id" > .env
```

5. **Criar datasets no BigQuery**:

```sql
CREATE SCHEMA northwind_bronze;
CREATE SCHEMA northwind_silver;
CREATE SCHEMA northwind_gold;
```

### 5. Reiniciar containers com as novas configurações

```bash
docker-compose down
docker-compose up -d
```

### 6. Executar o pipeline completo no Airflow

1. Acesse http://localhost:8080
2. Encontre o DAG `northwind_data_pipeline`
3. Clique em "Trigger DAG"

O DAG irá:
- ✅ Extrair dados do PostgreSQL
- ✅ Carregar no BigQuery (camada Bronze)
- ✅ Executar transformações dbt (Silver → Gold)
- ✅ Gerar documentação

### 7. Ou execute manualmente passo a passo

```bash
# Entrar no container do Airflow
docker exec -it airflow-webserver bash

# Testar o script de ingestão
cd /opt/airflow/scripts
python postgres_to_bigquery.py

# Navegar para o projeto dbt
cd /opt/airflow/dbt/northwind_dw

# Executar transformações
dbt run --profiles-dir /opt/airflow/dbt

# Executar testes
dbt test --profiles-dir /opt/airflow/dbt
```

---

## 📝 Configuração Completa

Para configuração detalhada, veja:
- [docs/SETUP.md](docs/SETUP.md) - Guia completo de instalação
- [docs/AIRBYTE_SETUP.md](docs/AIRBYTE_SETUP.md) - Opções para ingestão de dados
- [docs/CHECKLIST.md](docs/CHECKLIST.md) - Checklist de implementação

---

## 🛠️ Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Reiniciar serviços
docker-compose restart

# Parar tudo
docker-compose down

# Parar e remover volumes (limpa dados)
docker-compose down -v

# Ver uso de recursos
docker stats
```

---

## 📊 Estrutura do Pipeline

```
PostgreSQL (Northwind DB)
    ↓
Python Script (Airflow)
    ↓
BigQuery Bronze Layer
    ↓
dbt Transformations (Silver → Gold)
    ↓
Analytics Ready!
```

**Destaques da Implementação:**
- ✅ **Ingestão customizada** com Python (sem dependências externas)
- ✅ **Schema mapping automático** PostgreSQL → BigQuery
- ✅ **Metadados de rastreamento** (`_airbyte_extracted_at`, `_airbyte_loaded_at`)
- ✅ **Tratamento de erros** e logging detalhado
- ✅ **Execução paralela** de tabelas (quando aplicável)

---

## 🎯 Para Demonstração em Portfólio

Este projeto demonstra:

✅ **Engenharia de Dados** - Pipeline completo end-to-end
✅ **Python** - Scripts customizados para ETL (500+ linhas)
✅ **Arquitetura de Dados** - Medallion (Bronze/Silver/Gold)
✅ **Modelagem** - Star Schema com dbt
✅ **Orquestração** - Apache Airflow com DAGs complexos
✅ **Cloud** - Google BigQuery
✅ **DevOps** - Docker, Docker Compose, IaC
✅ **Documentação** - Completa e profissional

**Diferencial**: Ao usar scripts Python customizados em vez de ferramentas prontas, você demonstra:
- Domínio de Python e bibliotecas (psycopg2, google-cloud-bigquery)
- Capacidade de criar soluções sob medida
- Conhecimento profundo de ETL e integração de sistemas
- Habilidade de trabalhar sem depender apenas de ferramentas comerciais

---

**Próximos passos**: Veja [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) para continuar!
