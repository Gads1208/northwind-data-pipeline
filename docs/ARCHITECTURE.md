# Arquitetura Detalhada - Northwind Data Pipeline

## Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Componentes do Sistema](#componentes-do-sistema)
3. [Fluxo de Dados](#fluxo-de-dados)
4. [Arquitetura Medallion](#arquitetura-medallion)
5. [Decisões de Design](#decisões-de-design)
6. [Escalabilidade](#escalabilidade)
7. [Segurança](#segurança)

## Visão Geral da Arquitetura

Este projeto implementa uma arquitetura moderna de data pipeline utilizando o padrão Medallion (Bronze, Silver, Gold) no Google BigQuery, com orquestração via Apache Airflow e ingestão via Airbyte.

### Diagrama de Arquitetura Completo

```
┌──────────────────────────────────────────────────────────────────┐
│                        SOURCE LAYER                              │
│                                                                  │
│  ┌────────────────────┐                                         │
│  │   PostgreSQL       │                                         │
│  │   (Northwind DB)   │                                         │
│  │                    │                                         │
│  │  • customers       │                                         │
│  │  • orders          │                                         │
│  │  • products        │                                         │
│  │  • employees       │                                         │
│  │  • ...             │                                         │
│  └────────────────────┘                                         │
└──────────────────────────────────────────────────────────────────┘
            │
            │ CDC / Full Refresh
            ▼
┌──────────────────────────────────────────────────────────────────┐
│                      INGESTION LAYER                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │                     Airbyte                            │     │
│  │                                                        │     │
│  │  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐ │     │
│  │  │   Source     │─▶│  Transform  │─▶│ Destination  │ │     │
│  │  │  Connector   │  │   (Basic)   │  │  Connector   │ │     │
│  │  └──────────────┘  └─────────────┘  └──────────────┘ │     │
│  │                                                        │     │
│  │  • Schema detection                                   │     │
│  │  • Data type mapping                                  │     │
│  │  • Incremental sync                                   │     │
│  │  • Error handling                                     │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
            │
            │ Raw Data
            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BRONZE LAYER (Raw)                            │
│                     Google BigQuery                              │
│                                                                  │
│  Dataset: northwind_bronze                                      │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  bronze_customers                                      │     │
│  │  bronze_orders                                         │     │
│  │  bronze_products                                       │     │
│  │  bronze_employees                                      │     │
│  │  ...                                                   │     │
│  │                                                        │     │
│  │  Características:                                     │     │
│  │  • Dados brutos sem transformação                    │     │
│  │  • Metadados Airbyte preservados                     │     │
│  │  • Histórico completo                                │     │
│  │  • Schema igual ao source                            │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
            │
            │ dbt transformation
            ▼
┌──────────────────────────────────────────────────────────────────┐
│                   SILVER LAYER (Cleaned)                         │
│                     Google BigQuery                              │
│                                                                  │
│  Dataset: northwind_silver                                      │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Dimensions:                                           │     │
│  │  • silver_dim_customers                               │     │
│  │  • silver_dim_products                                │     │
│  │  • silver_dim_employees                               │     │
│  │                                                        │     │
│  │  Facts:                                               │     │
│  │  • silver_fact_orders                                 │     │
│  │                                                        │     │
│  │  Características:                                     │     │
│  │  • Dados limpos e padronizados                       │     │
│  │  • Deduplicação                                      │     │
│  │  • Enriquecimento com referências                    │     │
│  │  • Surrogate keys                                    │     │
│  │  • Data quality checks                               │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
            │
            │ dbt aggregation
            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    GOLD LAYER (Business)                         │
│                     Google BigQuery                              │
│                                                                  │
│  Dataset: northwind_gold                                        │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Business Aggregations:                                │     │
│  │  • gold_sales_by_country                              │     │
│  │  • gold_sales_by_category                             │     │
│  │  • gold_employee_performance                          │     │
│  │  • gold_customer_analytics                            │     │
│  │  • gold_product_performance                           │     │
│  │                                                        │     │
│  │  Características:                                     │     │
│  │  • KPIs e métricas de negócio                        │     │
│  │  • Dados desnormalizados                             │     │
│  │  • Otimizado para análise                            │     │
│  │  • Pronto para BI tools                              │     │
│  └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
            │
            │ Query / Visualize
            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    CONSUMPTION LAYER                             │
│                                                                  │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Looker/      │  │   Tableau    │  │   Metabase   │         │
│  │  Data Studio  │  │              │  │              │         │
│  └───────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Python       │  │   Notebooks  │  │   Custom     │         │
│  │  Analytics    │  │   (Jupyter)  │  │   Apps       │         │
│  └───────────────┘  └──────────────┘  └──────────────┘         │
└──────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════
                    ORCHESTRATION LAYER
═══════════════════════════════════════════════════════════════════
                      Apache Airflow
┌──────────────────────────────────────────────────────────────────┐
│  DAGs:                                                           │
│  • northwind_pipeline_dag      (Main pipeline)                  │
│  • northwind_monitoring_dag    (Data quality checks)            │
│  • northwind_maintenance_dag   (Cleanup & optimization)         │
│                                                                  │
│  Schedule: Daily @ 2 AM                                         │
└──────────────────────────────────────────────────────────────────┘
```

## Componentes do Sistema

### 1. PostgreSQL (Source Database)

**Propósito**: Banco de dados operacional (OLTP) com dados transacionais.

**Características**:
- Base de dados Northwind clássica
- Tabelas normalizadas
- Relações foreign key
- Inicializado via scripts SQL no Docker

**Configuração**:
```yaml
postgres:
  image: postgres:15
  port: 5432
  database: northwind
  init_scripts:
    - 01_schema.sql
    - 02_data.sql
```

### 2. Airbyte (Data Ingestion)

**Propósito**: Ferramenta de ELT para ingestão de dados.

**Características**:
- Conectores pré-construídos
- Sincronização incremental
- Schema evolution
- Error handling e retry logic

**Componentes**:
- **Server**: API e configuração
- **Worker**: Execução de syncs
- **Database**: Metadados
- **WebApp**: Interface de usuário

**Fluxo**:
1. Detecta schema do source
2. Cria tabelas no destination
3. Realiza full refresh ou incremental sync
4. Adiciona metadados (_airbyte_*)

### 3. Google BigQuery (Data Warehouse)

**Propósito**: Data warehouse cloud-native, serverless e escalável.

**Estrutura**:
```
Project: northwind-data-pipeline
├── Dataset: northwind_bronze (Raw data)
├── Dataset: northwind_silver (Cleaned data)
└── Dataset: northwind_gold (Business metrics)
```

**Vantagens**:
- Escalabilidade automática
- Pricing baseado em uso
- SQL standard
- Integração nativa com GCP
- Suporte a particionamento e clustering

### 4. dbt (Data Transformation)

**Propósito**: Framework para transformação de dados usando SQL.

**Estrutura do Projeto**:
```
northwind_dw/
├── dbt_project.yml          # Configuração do projeto
├── packages.yml             # Dependências
└── models/
    ├── bronze/              # Camada raw
    │   ├── sources.yml
    │   └── bronze_*.sql
    ├── silver/              # Camada cleaned
    │   ├── schema.yml
    │   └── silver_*.sql
    └── gold/                # Camada business
        ├── schema.yml
        └── gold_*.sql
```

**Funcionalidades**:
- Transformações SQL modulares
- Testes de qualidade de dados
- Documentação automática
- Lineage de dados
- Incremental models

### 5. Apache Airflow (Orchestration)

**Propósito**: Orquestração e agendamento de workflows.

**DAGs Implementados**:

#### northwind_pipeline_dag
- **Schedule**: Diário às 2 AM
- **Tarefas**:
  1. Check Airbyte sync
  2. dbt deps
  3. dbt run bronze
  4. dbt test bronze
  5. dbt run silver
  6. dbt test silver
  7. dbt run gold
  8. dbt test gold
  9. dbt docs generate

#### northwind_monitoring_dag
- **Schedule**: A cada 4 horas
- **Tarefas**:
  - Data freshness checks
  - Volume checks
  - Quality metrics

#### northwind_maintenance_dag
- **Schedule**: Semanal (domingos)
- **Tarefas**:
  - Snapshots
  - Cleanup
  - Statistics update

## Fluxo de Dados

### 1. Ingestão (Airbyte)

```
PostgreSQL → Airbyte → BigQuery (Bronze)
```

**Processo**:
1. Airbyte conecta ao PostgreSQL
2. Lê dados das tabelas configuradas
3. Aplica mapeamento de tipos
4. Escreve no BigQuery com metadados
5. Atualiza estado da sincronização

**Frequência**: Hourly (configurável)

**Modo**: Full refresh ou Incremental

### 2. Transformação Bronze → Silver (dbt)

```sql
-- Exemplo: silver_dim_customers
SELECT
    {{ dbt_utils.generate_surrogate_key(['customer_id']) }} AS customer_key,
    customer_id,
    TRIM(company_name) AS company_name,
    -- Limpeza e padronização
    COALESCE(contact_title, 'Unknown') AS contact_title,
    -- Enriquecimento
    CURRENT_TIMESTAMP() AS dw_updated_at
FROM {{ ref('bronze_customers') }}
WHERE customer_id IS NOT NULL
```

**Transformações**:
- Limpeza de strings (TRIM)
- Padronização de nulls (COALESCE)
- Criação de surrogate keys
- Enriquecimento com dimensões
- Cálculos de métricas básicas

### 3. Transformação Silver → Gold (dbt)

```sql
-- Exemplo: gold_sales_by_country
SELECT 
    country,
    COUNT(DISTINCT order_id) AS total_orders,
    SUM(order_total) AS total_revenue,
    AVG(order_total) AS avg_order_value,
    -- KPIs de negócio
FROM {{ ref('silver_fact_orders') }} o
JOIN {{ ref('silver_dim_customers') }} c 
  ON o.customer_id = c.customer_id
GROUP BY country
```

**Agregações**:
- Métricas por dimensão
- KPIs de negócio
- Segmentação de clientes
- Performance de produtos

## Arquitetura Medallion

### Bronze Layer (Bruto)

**Objetivo**: Preservar dados brutos do source.

**Características**:
- ✅ Dados exatamente como na fonte
- ✅ Metadados de ingestão
- ✅ Histórico completo
- ❌ Sem transformações
- ❌ Pode conter duplicados

**Uso**: Auditoria, troubleshooting, reprocessamento.

### Silver Layer (Limpo)

**Objetivo**: Dados limpos e preparados para análise.

**Características**:
- ✅ Dados limpos e padronizados
- ✅ Deduplicados
- ✅ Com surrogate keys
- ✅ Enriquecido com referências
- ✅ Testado para qualidade

**Uso**: Base para análises, feature engineering, ML.

### Gold Layer (Negócio)

**Objetivo**: KPIs e métricas prontas para consumo.

**Características**:
- ✅ Agregações de negócio
- ✅ Desnormalizado
- ✅ Otimizado para leitura
- ✅ Pronto para BI tools
- ✅ Documentado

**Uso**: Dashboards, relatórios, análises ad-hoc.

## Decisões de Design

### Por que Airbyte?

✅ **Prós**:
- Open-source
- 300+ conectores
- UI amigável
- Suporte a CDC
- Scheduling integrado

❌ **Alternativas consideradas**:
- Fivetran (paid)
- Stitch (paid)
- Custom Python scripts

### Por que BigQuery?

✅ **Prós**:
- Serverless
- Escalável
- Integração GCP
- SQL padrão
- Custo por uso

❌ **Alternativas consideradas**:
- Snowflake (mais caro)
- Redshift (requer infraestrutura)
- Databricks (complexo para este caso)

### Por que dbt?

✅ **Prós**:
- SQL-first
- Testável
- Versionável
- Documentação automática
- Grande comunidade

❌ **Alternativas consideradas**:
- Stored procedures (não versionável)
- Apache Spark (overkill)
- Custom Python (menos estruturado)

### Por que Airflow?

✅ **Prós**:
- Open-source
- Flexível
- Python-based
- Grande comunidade
- Integração com tudo

❌ **Alternativas consideradas**:
- Prefect (menos maduro)
- Dagster (menos adoção)
- Cloud Composer (custo)

## Escalabilidade

### Dimensionamento Vertical

**BigQuery**: Automático, serverless

**Airbyte**: 
- Aumentar resources do worker
- Múltiplos workers

**Airflow**:
- Celery Executor
- Kubernetes Executor

### Dimensionamento Horizontal

**Particionamento**:
```sql
-- Particionar tabelas grandes por data
CREATE TABLE orders
PARTITION BY DATE(order_date)
CLUSTER BY customer_id
```

**Incremental Models**:
```sql
{{ config(
    materialized='incremental',
    unique_key='order_id',
    partition_by={'field': 'order_date', 'data_type': 'date'}
) }}
```

### Otimizações

1. **Clustering**: Otimizar queries por filtros comuns
2. **Particionamento**: Reduzir scan de dados
3. **Materialized Views**: Cache de agregações
4. **Query Caching**: Resultados reutilizáveis

## Segurança

### Autenticação e Autorização

**GCP**:
- Service Account com permissões mínimas
- IAM roles específicos
- Chaves rotacionáveis

**Airflow**:
- Basic Auth (dev)
- OAuth (prod recomendado)
- RBAC habilitado

**BigQuery**:
- Dataset-level permissions
- Column-level security (se necessário)
- Audit logs habilitados

### Dados Sensíveis

**PII (Personally Identifiable Information)**:
- Masking em Bronze/Silver (se necessário)
- Acesso restrito por role
- Logs de acesso

**Secrets Management**:
- Variáveis de ambiente
- GCP Secret Manager (prod)
- Nunca commit credentials

### Rede

**Docker Networks**:
- Rede isolada para containers
- Exposição mínima de portas

**GCP**:
- VPC se necessário
- Private IPs
- Cloud NAT

## Monitoramento

### Métricas

**Pipeline**:
- Tempo de execução
- Taxa de sucesso
- Volume de dados processado

**Qualidade**:
- Testes dbt
- Freshness checks
- Schema changes

**Custos**:
- BigQuery bytes scanned
- Storage usage
- Compute costs

### Alertas

**Airflow**:
- Email on failure
- Slack integration
- PagerDuty (prod)

**dbt**:
- Test failures
- Schema changes
- Performance degradation

## Próximos Passos

### Melhorias Futuras

1. **CI/CD**:
   - GitHub Actions
   - Testes automatizados
   - Deploy automático

2. **Data Quality**:
   - Great Expectations
   - Anomaly detection
   - SLAs automatizados

3. **Performance**:
   - Query optimization
   - Materialized views
   - Incremental models

4. **Segurança**:
   - Vault para secrets
   - Column-level security
   - Data masking

5. **Observabilidade**:
   - dbt exposures
   - Grafana dashboards
   - Traces com OpenTelemetry
