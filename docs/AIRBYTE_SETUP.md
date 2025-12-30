# 🔌 Guia de Instalação do Airbyte

O Airbyte requer uma instalação separada devido à sua complexidade. Aqui estão as opções:

## Opção 1: Airbyte Cloud (Recomendado para Produção)

A maneira mais simples é usar o Airbyte Cloud:

1. Acesse https://cloud.airbyte.com
2. Crie uma conta gratuita
3. Configure source (PostgreSQL) e destination (BigQuery)
4. Sem necessidade de infraestrutura local

**Prós**: Sem gerenciamento, escalável, sempre atualizado
**Contras**: Requer conta, limites no plano gratuito

## Opção 2: Airbyte OSS Local (Para Desenvolvimento)

### Instalação via abctl (Recomendado)

```bash
# 1. Baixar abctl
curl -LsfS https://get.airbyte.com | bash -

# 2. Instalar Airbyte
abctl local install

# 3. Acessar
# UI: http://localhost:8000
# Credentials: airbyte / password
```

### Instalação via Docker Compose (Manual)

```bash
# 1. Clonar repositório do Airbyte
git clone https://github.com/airbytehq/airbyte.git
cd airbyte

# 2. Executar
./run-ab-platform.sh

# 3. Acessar http://localhost:8000
```

## Opção 3: Alternativa Simples - Scripts Python

Para um projeto de portfólio, você pode substituir o Airbyte por scripts Python simples:

```python
# airflow/dags/ingest_postgres_to_bigquery.py
from airflow import DAG
from airflow.providers.google.cloud.transfers.postgres_to_gcs import PostgresToGCSOperator
from airflow.providers.google.cloud.transfers.gcs_to_bigquery import GCSToBigQueryOperator
from datetime import datetime

with DAG(
    'postgres_to_bigquery',
    start_date=datetime(2024, 1, 1),
    schedule_interval='@hourly',
    catchup=False
) as dag:
    
    tables = ['customers', 'orders', 'products', 'employees']
    
    for table in tables:
        # PostgreSQL → GCS
        pg_to_gcs = PostgresToGCSOperator(
            task_id=f'extract_{table}',
            postgres_conn_id='postgres_conn',
            sql=f'SELECT * FROM {table}',
            bucket='your-bucket',
            filename=f'bronze/{table}/{{{{ ds }}}}.json',
            export_format='json'
        )
        
        # GCS → BigQuery
        gcs_to_bq = GCSToBigQueryOperator(
            task_id=f'load_{table}',
            bucket='your-bucket',
            source_objects=[f'bronze/{table}/{{{{ ds }}}}.json'],
            destination_project_dataset_table=f'northwind_bronze.bronze_{table}',
            write_disposition='WRITE_TRUNCATE',
            source_format='NEWLINE_DELIMITED_JSON'
        )
        
        pg_to_gcs >> gcs_to_bq
```

## Opção 4: Usar apenas dbt com Sources Externas

Se os dados já estão no BigQuery (via load manual), você pode pular o Airbyte:

```bash
# 1. Fazer upload manual dos CSVs para BigQuery
bq load --source_format=CSV \
    northwind_bronze.bronze_customers \
    customers.csv \
    schema.json

# 2. Usar dbt direto nas tabelas Bronze
```

## Configuração Recomendada para Este Projeto

### Para Desenvolvimento/Portfólio:

**Opção A - Simples**: 
- Use scripts Python no Airflow (Opção 3)
- Ou faça upload manual inicial e foque nas transformações dbt

**Opção B - Completo**:
- Use Airbyte Cloud (grátis) ou `abctl local install`
- Configure uma vez e documente no README

### Para Produção Real:

- Use Airbyte Cloud ou self-hosted em Kubernetes
- Configure monitoring e alertas
- Implemente retry logic robusto

## Configuração do Airbyte para este Projeto

### Source: PostgreSQL

```yaml
Host: postgres (ou localhost se Airbyte externo)
Port: 5432
Database: northwind
Username: postgres
Password: postgres
SSL Mode: disable
```

### Destination: BigQuery

```yaml
Project ID: northwind-data-pipeline
Dataset: northwind_bronze
Location: US
Loading Method: Standard Inserts
Service Account Key: (cole o JSON)
```

### Connection Settings

```yaml
Sync Mode: Full Refresh | Overwrite
Schedule: Every hour
Namespace: Custom (northwind_bronze)
Tables: Select all
```

## Verificação

Após configurar o Airbyte, verifique se os dados chegaram no BigQuery:

```bash
bq query --use_legacy_sql=false \
  'SELECT COUNT(*) as total FROM `northwind-data-pipeline.northwind_bronze.bronze_customers`'
```

## Troubleshooting

### Problema: Airbyte não conecta ao PostgreSQL

**Solução**: Use o host correto
- Se Airbyte está no Docker: `postgres`
- Se Airbyte está local: `host.docker.internal` ou `localhost`

### Problema: BigQuery authentication failed

**Solução**: Verifique a service account key
- Deve ter permissões: BigQuery Data Editor e Job User
- JSON deve estar válido

### Problema: Schema não detectado

**Solução**: Verifique tabelas no Postgres
```bash
docker exec -it northwind-postgres psql -U postgres -d northwind -c "\dt"
```

## Recursos

- [Airbyte Documentation](https://docs.airbyte.com/)
- [Airbyte Quickstart](https://docs.airbyte.com/quickstart)
- [PostgreSQL Connector](https://docs.airbyte.com/integrations/sources/postgres)
- [BigQuery Connector](https://docs.airbyte.com/integrations/destinations/bigquery)

---

**Nota**: Para fins de portfólio, você pode documentar que usaria Airbyte em produção, mas implementar com scripts Python mais simples para demonstração.
