# 🚀 Northwind Data Pipeline - Projeto de Engenharia de Dados

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![dbt](https://img.shields.io/badge/dbt-1.7-orange)](https://www.getdbt.com/)
[![Airflow](https://img.shields.io/badge/Airflow-2.8-blue)](https://airflow.apache.org/)

Um pipeline completo de engenharia de dados implementando arquitetura Medallion (Bronze, Silver, Gold) com stack moderna de tecnologias.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Camadas de Dados](#camadas-de-dados)
- [Monitoramento](#monitoramento)
- [Testes](#testes)

## 🎯 Visão Geral

Este projeto implementa um pipeline de dados end-to-end utilizando a clássica base de dados **Northwind** como fonte. O objetivo é demonstrar as melhores práticas de engenharia de dados moderna, incluindo:

- **Ingestão de dados** com Airbyte
- **Transformação de dados** com dbt usando arquitetura Medallion
- **Orquestração** com Apache Airflow
- **Armazenamento** no Google BigQuery
- **Versionamento** com Git/GitHub

### Fluxo de Dados

```
PostgreSQL (Source) 
    ↓
Airbyte (Ingestion)
    ↓
BigQuery Bronze (Raw Data)
    ↓
dbt Silver (Cleaned & Transformed)
    ↓
dbt Gold (Business Aggregations)
    ↓
Analytics & BI Tools
```

## 🏗️ Arquitetura

### Arquitetura Medallion

O projeto implementa a arquitetura Medallion em três camadas:

#### 🥉 Bronze Layer (Dados Brutos)
- Dados brutos ingeridos do PostgreSQL via Airbyte
- Mínima ou nenhuma transformação
- Preserva histórico completo
- Tabelas: `bronze_customers`, `bronze_orders`, `bronze_products`, etc.

#### 🥈 Silver Layer (Dados Limpos)
- Dados limpos e padronizados
- Deduplicação e validações
- Enriquecimento com dados de referência
- Tabelas: `silver_dim_customers`, `silver_dim_products`, `silver_fact_orders`

#### 🥇 Gold Layer (Agregações de Negócio)
- Métricas e KPIs de negócio
- Dados otimizados para análise
- Agregações e cálculos complexos
- Tabelas: `gold_sales_by_country`, `gold_customer_analytics`, `gold_employee_performance`

### Diagrama de Arquitetura

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│             │     │             │     │                  │
│  PostgreSQL │────▶│   Airbyte   │────▶│  BigQuery Bronze │
│  (Source)   │     │  (Ingest)   │     │   (Raw Data)     │
│             │     │             │     │                  │
└─────────────┘     └─────────────┘     └──────────────────┘
                                                  │
                                                  │
                                                  ▼
                    ┌──────────────────────────────────────┐
                    │          dbt Transformations         │
                    │                                      │
                    │  Bronze → Silver → Gold             │
                    │  (Medallion Architecture)           │
                    └──────────────────────────────────────┘
                                    │
                                    │
                                    ▼
              ┌─────────────────────────────────────┐
              │    Apache Airflow (Orchestration)   │
              │                                     │
              │  - Pipeline Scheduling              │
              │  - Data Quality Checks              │
              │  - Monitoring & Alerts              │
              └─────────────────────────────────────┘
```

## 🛠️ Tecnologias

| Tecnologia | Versão | Função |
|------------|--------|--------|
| **PostgreSQL** | 15 | Banco de dados fonte |
| **Airbyte** | Latest | Ingestão de dados |
| **Google BigQuery** | - | Data Warehouse |
| **dbt** | 1.7+ | Transformações de dados |
| **Apache Airflow** | 2.8 | Orquestração |
| **Docker** | Latest | Containerização |
| **Python** | 3.11 | Linguagem principal |

## 📁 Estrutura do Projeto

```
northwind-data-pipeline/
├── README.md
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── postgres/
│   └── init/
│       ├── 01_schema.sql         # Schema do banco Northwind
│       └── 02_data.sql           # Dados de exemplo
│
├── airflow/
│   └── dags/
│       ├── northwind_pipeline_dag.py      # DAG principal do pipeline
│       ├── northwind_monitoring_dag.py    # DAG de monitoramento
│       └── northwind_maintenance_dag.py   # DAG de manutenção
│
├── dbt/
│   ├── profiles.yml              # Configuração de conexão dbt
│   └── northwind_dw/
│       ├── dbt_project.yml       # Configuração do projeto dbt
│       ├── packages.yml          # Pacotes dbt
│       └── models/
│           ├── bronze/           # Camada Bronze (Raw)
│           │   ├── bronze_customers.sql
│           │   ├── bronze_orders.sql
│           │   ├── bronze_products.sql
│           │   └── ...
│           ├── silver/           # Camada Silver (Cleaned)
│           │   ├── silver_dim_customers.sql
│           │   ├── silver_dim_products.sql
│           │   ├── silver_fact_orders.sql
│           │   └── ...
│           └── gold/             # Camada Gold (Business)
│               ├── gold_sales_by_country.sql
│               ├── gold_customer_analytics.sql
│               ├── gold_employee_performance.sql
│               └── ...
│
└── docs/
    ├── SETUP.md                  # Guia de instalação detalhado
    ├── ARCHITECTURE.md           # Documentação da arquitetura
    └── DATA_DICTIONARY.md        # Dicionário de dados
```

## 📦 Pré-requisitos

- **Docker** e **Docker Compose** instalados
- **Google Cloud Platform** account com BigQuery habilitado
- **Service Account Key** do GCP com permissões:
  - BigQuery Data Editor
  - BigQuery Job User
- **Git** para versionamento
- Mínimo de **8GB RAM** e **20GB** de espaço em disco

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/northwind-data-pipeline.git
cd northwind-data-pipeline
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```bash
# Google Cloud Configuration
GCP_PROJECT_ID=seu-project-id
GCP_DATASET_BRONZE=northwind_bronze
GCP_DATASET_SILVER=northwind_silver
GCP_DATASET_GOLD=northwind_gold
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# PostgreSQL Configuration
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=northwind
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

### 3. Configure o Google Cloud

```bash
# Crie os datasets no BigQuery
bq mk --dataset ${GCP_PROJECT_ID}:northwind_bronze
bq mk --dataset ${GCP_PROJECT_ID}:northwind_silver
bq mk --dataset ${GCP_PROJECT_ID}:northwind_gold
```

### 4. Inicie os serviços

```bash
docker-compose up -d
```

Aguarde alguns minutos para todos os serviços iniciarem.

## ⚙️ Configuração

### Configurar Airbyte

1. Acesse http://localhost:8000
2. Crie uma **Source** (PostgreSQL):
   - Host: `postgres`
   - Port: `5432`
   - Database: `northwind`
   - Username: `postgres`
   - Password: `postgres`

3. Crie uma **Destination** (BigQuery):
   - Project ID: seu project ID
   - Dataset: `northwind_bronze`
   - Credentials: sua service account key

4. Crie uma **Connection**:
   - Selecione todas as tabelas
   - Sync frequency: Hourly
   - Destination namespace: Custom format → `northwind_bronze`

### Configurar dbt

```bash
# Entre no container do Airflow
docker exec -it airflow-webserver bash

# Instale as dependências do dbt
cd /opt/airflow/dbt/northwind_dw
dbt deps --profiles-dir /opt/airflow/dbt

# Teste a conexão
dbt debug --profiles-dir /opt/airflow/dbt
```

### Configurar Airflow

1. Acesse http://localhost:8080
   - Username: `airflow`
   - Password: `airflow`

2. Configure as variáveis:
   - `gcp_project`: seu project ID
   - `gcp_credentials_path`: caminho para service account key

3. Ative os DAGs:
   - `northwind_data_pipeline`
   - `northwind_monitoring`
   - `northwind_maintenance`

## 🎮 Execução

### Execução Manual

#### 1. Executar ingestão do Airbyte

Acesse o Airbyte em http://localhost:8000 e execute a sincronização manualmente.

#### 2. Executar transformações dbt

```bash
# Entre no container
docker exec -it airflow-webserver bash

# Execute as transformações
cd /opt/airflow/dbt/northwind_dw

# Bronze layer
dbt run --select tag:bronze --profiles-dir /opt/airflow/dbt

# Silver layer
dbt run --select tag:silver --profiles-dir /opt/airflow/dbt

# Gold layer
dbt run --select tag:gold --profiles-dir /opt/airflow/dbt

# Execute os testes
dbt test --profiles-dir /opt/airflow/dbt
```

#### 3. Executar DAG do Airflow

No Airflow UI (http://localhost:8080), clique em "Trigger DAG" no DAG `northwind_data_pipeline`.

### Execução Automática

O pipeline está configurado para executar automaticamente:
- **Pipeline principal**: Diariamente às 2h da manhã
- **Monitoramento**: A cada 4 horas
- **Manutenção**: Semanalmente aos domingos às 3h

## 📊 Camadas de Dados

### Bronze Layer

Dados brutos ingeridos do PostgreSQL:

- `bronze_categories` - Categorias de produtos
- `bronze_customers` - Clientes
- `bronze_employees` - Funcionários
- `bronze_orders` - Pedidos
- `bronze_order_details` - Detalhes dos pedidos
- `bronze_products` - Produtos
- `bronze_suppliers` - Fornecedores
- `bronze_shippers` - Transportadoras

### Silver Layer

Dados limpos e padronizados:

- `silver_dim_customers` - Dimensão de clientes
- `silver_dim_products` - Dimensão de produtos (com categoria e fornecedor)
- `silver_dim_employees` - Dimensão de funcionários
- `silver_fact_orders` - Fato de pedidos (com métricas calculadas)

### Gold Layer

Agregações de negócio:

- `gold_sales_by_country` - Vendas por país
- `gold_sales_by_category` - Vendas por categoria de produto
- `gold_employee_performance` - Performance dos funcionários
- `gold_customer_analytics` - Análise de clientes (segmentação, CLV)
- `gold_product_performance` - Performance dos produtos

## 📈 Monitoramento

### Logs do Airflow

```bash
# Visualizar logs em tempo real
docker logs -f airflow-scheduler
```

### Métricas do dbt

```bash
# Gerar documentação
cd /opt/airflow/dbt/northwind_dw
dbt docs generate --profiles-dir /opt/airflow/dbt
dbt docs serve --profiles-dir /opt/airflow/dbt --port 8081
```

Acesse a documentação em http://localhost:8081

### Verificar dados no BigQuery

```sql
-- Contar registros em cada camada
SELECT 'Bronze' as layer, COUNT(*) as total FROM `project.northwind_bronze.bronze_orders`
UNION ALL
SELECT 'Silver' as layer, COUNT(*) as total FROM `project.northwind_silver.silver_fact_orders`
UNION ALL
SELECT 'Gold' as layer, COUNT(*) as total FROM `project.northwind_gold.gold_sales_by_country`;
```

## 🧪 Testes

### Testes de Qualidade de Dados (dbt)

```bash
# Executar todos os testes
dbt test --profiles-dir /opt/airflow/dbt

# Executar testes de uma camada específica
dbt test --select tag:silver --profiles-dir /opt/airflow/dbt
```

### Testes de DAGs do Airflow

```bash
# Testar DAG
docker exec -it airflow-scheduler airflow dags test northwind_data_pipeline 2024-01-01
```

## 🔧 Manutenção

### Limpar dados

```bash
# Parar containers
docker-compose down

# Remover volumes (CUIDADO: isso apaga todos os dados)
docker-compose down -v
```

### Atualizar dependências

```bash
# Atualizar imagens Docker
docker-compose pull

# Reiniciar serviços
docker-compose up -d
```

## 📚 Recursos Adicionais

- [Documentação do dbt](https://docs.getdbt.com/)
- [Documentação do Airflow](https://airflow.apache.org/docs/)
- [Documentação do Airbyte](https://docs.airbyte.com/)
- [BigQuery Documentation](https://cloud.google.com/bigquery/docs)

## 👤 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
- LinkedIn: [Seu Perfil](https://linkedin.com/in/seu-perfil)

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- Base de dados Northwind da Microsoft
- Comunidade dbt, Airflow e Airbyte

---

**⭐ Se este projeto foi útil, considere dar uma estrela!**
