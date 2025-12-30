# 🚀 Northwind Data Pipeline - Projeto de Engenharia de Dados

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white)](https://www.python.org/)
[![dbt](https://img.shields.io/badge/dbt-1.7.4-orange?logo=dbt&logoColor=white)](https://www.getdbt.com/)
[![Airflow](https://img.shields.io/badge/Airflow-2.8.0-017CEE?logo=apache-airflow&logoColor=white)](https://airflow.apache.org/)
[![BigQuery](https://img.shields.io/badge/BigQuery-GCP-4285F4?logo=google-cloud&logoColor=white)](https://cloud.google.com/bigquery)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

Pipeline completo de engenharia de dados end-to-end implementando arquitetura Medallion (Bronze, Silver, Gold) com stack moderna de tecnologias em nuvem.

> **✨ Projeto de Portfólio** | Demonstração de habilidades em Data Engineering com foco em ETL/ELT, orquestração e transformação de dados.

## 🎯 Resultados do Projeto

- ✅ **51 registros** processados através de 3 camadas de transformação
- ✅ **8 tabelas Bronze** → **4 tabelas Silver** → **5 tabelas Gold**
- ✅ **Pipeline automatizado** executando transformações dbt via Airflow
- ✅ **Arquitetura Medallion** implementada no Google BigQuery
- ✅ **Testes de qualidade** validando integridade dos dados

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

Este projeto implementa um **pipeline de dados end-to-end** utilizando a clássica base de dados **Northwind** como fonte. O objetivo é demonstrar as melhores práticas de engenharia de dados moderna, incluindo:

- ✅ **Ingestão de dados** automatizada com Python (PostgreSQL → BigQuery)
- ✅ **Transformação de dados** com dbt usando arquitetura Medallion
- ✅ **Orquestração** com Apache Airflow e TaskGroups
- ✅ **Armazenamento** escalável no Google BigQuery
- ✅ **Containerização** com Docker Compose (4 containers)
- ✅ **Testes de qualidade** automatizados com dbt
- ✅ **Versionamento** com Git/GitHub

### 📊 Métricas do Pipeline

| Métrica | Valor |
|---------|-------|
| **Registros Processados** | 51 registros |
| **Tabelas Bronze** | 8 tabelas (dados brutos) |
| **Modelos Silver** | 4 dimensões/fatos |
| **Agregações Gold** | 5 métricas de negócio |
| **Tempo de Execução** | ~2-3 minutos |
| **Testes de Qualidade** | 16 testes implementados |

### Fluxo de Dados

```
PostgreSQL (Source - 51 records)
    ↓
Python Script (ETL Customizado)
    ↓
BigQuery Bronze (Raw Data - 8 tables)
    ↓
dbt Silver (Cleaned & Modeled - 4 models)
    ↓
dbt Gold (Business Aggregations - 5 models)
    ↓
Analytics & BI Tools
```

## 🏗️ Arquitetura

### Arquitetura Medallion

O projeto implementa a arquitetura Medallion em três camadas:

#### 🥉 Bronze Layer (Dados Brutos)
- Dados brutos ingeridos do PostgreSQL via script Python customizado
- Mínima ou nenhuma transformação aplicada
- Preserva histórico completo com metadata de ingestão
- **8 tabelas**: `bronze_customers`, `bronze_orders`, `bronze_products`, `bronze_categories`, `bronze_employees`, `bronze_suppliers`, `bronze_shippers`, `bronze_order_details`

#### 🥈 Silver Layer (Dados Limpos)
- Dados limpos, padronizados e modelados
- Aplicação de surrogate keys e normalização
- Implementação de modelos dimensionais (star schema)
- **4 modelos**: `silver_dim_customers`, `silver_dim_products`, `silver_dim_employees`, `silver_fact_orders`

#### 🥇 Gold Layer (Agregações de Negócio)
- Métricas e KPIs prontos para consumo
- Dados otimizados para dashboards e análises
- Agregações pré-calculadas para performance
- **5 agregações**: `gold_customer_revenue`, `gold_employee_performance`, `gold_product_performance`, `gold_revenue_by_category`, `gold_revenue_by_supplier`

### Diagrama de Arquitetura

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐
│             │     │                  │     │                  │
│  PostgreSQL │────▶│  Python ETL      │────▶│  BigQuery Bronze │
│  (Source)   │     │  (431 lines)     │     │   (8 tables)     │
│  51 records │     │  Custom Script   │     │                  │
└─────────────┘     └──────────────────┘     └──────────────────┘
                                                       │
                                                       │
                                                       ▼
                    ┌──────────────────────────────────────────┐
                    │         dbt Transformations              │
                    │                                          │
                    │  Silver Layer (4 models)                │
                    │  └─ Dimensions & Facts                  │
                    │                                          │
                    │  Gold Layer (5 models)                  │
                    │  └─ Business Aggregations               │
                    └──────────────────────────────────────────┘
                                       │
                                       │ Orchestrated by
                                       ▼
              ┌─────────────────────────────────────┐
              │    Apache Airflow 2.8.0             │
              │                                     │
              │  ✓ DAG with TaskGroups              │
              │  ✓ BashOperator for dbt             │
              │  ✓ Automated Testing                │
              │  ✓ Pipeline Monitoring              │
              └─────────────────────────────────────┘
```

## 🛠️ Tecnologias

| Tecnologia | Versão | Função | Detalhes |
|------------|--------|--------|----------|
| **PostgreSQL** | 15 | Banco de dados fonte | Base Northwind com 51 registros |
| **Python** | 3.11 | ETL Customizado | Script de 431 linhas para ingestão |
| **Google BigQuery** | - | Data Warehouse | 3 datasets (Bronze/Silver/Gold) |
| **dbt** | 1.7.4 | Transformações | 17 modelos + testes de qualidade |
| **Apache Airflow** | 2.8.0 | Orquestração | LocalExecutor + TaskGroups |
| **Docker** | Latest | Containerização | 4 containers coordenados |
| **Docker Compose** | Latest | Orchestração de containers | Gerenciamento de serviços |

### 🔧 Stack Técnica Detalhada

- **ETL**: `psycopg2`, `google-cloud-bigquery`, pandas para transformações
- **dbt**: dbt-core + dbt-bigquery adapter + dbt-utils package
- **Airflow**: BashOperator, TaskGroups, dynamic task generation
- **Infraestrutura**: Docker Compose com volumes persistentes

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
│   ├── dags/
│   │   ├── northwind_pipeline_dag.py      # ⭐ DAG principal (295 linhas)
│   │   ├── northwind_monitoring_dag.py    # Monitoramento
│   │   └── northwind_maintenance_dag.py   # Manutenção
│   ├── scripts/
│   │   ├── postgres_to_bigquery.py        # ⭐ ETL Script (431 linhas)
│   │   └── create_gcp_connection.py       # Setup GCP
│   ├── entrypoint.sh                      # Auto-instalação de dependências
│   └── requirements.txt                   # Dependências Python
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
git clone https://github.com/Gads1208/northwind-data-pipeline.git
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

Crie os datasets no BigQuery (região US):

```bash
# Criar datasets
bq mk --location=US --dataset ${GCP_PROJECT_ID}:northwind_bronze
bq mk --location=US --dataset ${GCP_PROJECT_ID}:northwind_silver
bq mk --location=US --dataset ${GCP_PROJECT_ID}:northwind_gold
```

**Importante**: Configure as permissões da Service Account:
- BigQuery Data Editor
- BigQuery Job User

### 4. Coloque sua Service Account Key

Copie sua service account key JSON para a raiz do projeto:

```bash
cp /caminho/para/sua/service-account-key.json ./gcp-key.json
```

### 5. Inicie os serviços com Docker

```bash
# Suba todos os containers
docker-compose up -d

# Verifique se todos estão rodando
docker-compose ps
```

Aguarde ~2 minutos para os serviços iniciarem completamente.

### 6. Acesse as interfaces

- **Airflow**: http://localhost:8080 (user: `airflow` / pass: `airflow`)
- **PostgreSQL**: localhost:5432 (user: `postgres` / pass: `postgres`)

## ⚙️ Configuração

### Executar o Pipeline

#### Método 1: Via Airflow UI (Recomendado)

1. Acesse http://localhost:8080
2. Localize o DAG `northwind_pipeline`
3. Clique em "Trigger DAG" (ícone de play)
4. Acompanhe a execução em tempo real

#### Método 2: Via Linha de Comando

```bash
# Entre no container do Airflow
docker exec -it northwind-data-pipeline-airflow-scheduler-1 bash

# Trigger manual da DAG
airflow dags trigger northwind_pipeline
```

### Fluxo de Execução da DAG

O pipeline executa as seguintes tarefas em sequência:

1. **ingest_bronze** → Ingestão Python (PostgreSQL → BigQuery Bronze)
2. **create_profile** → Criação dinâmica do profiles.yml
3. **install_deps** → Instalação dos pacotes dbt (dbt_utils)
4. **dbt_debug** → Validação da conexão dbt
5. **silver_layer** → TaskGroup com 4 modelos Silver
6. **gold_layer** → TaskGroup com 5 modelos Gold
7. **summary** → Log de finalização
8. **run_tests** → Testes de qualidade dbt

## 🎮 Execução

### Verificar Status dos Serviços

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker logs -f northwind-data-pipeline-airflow-webserver-1

# Verificar saúde do PostgreSQL
docker exec -it northwind-data-pipeline-postgres-1 psql -U postgres -d northwind -c "SELECT COUNT(*) FROM customers;"
```

### Execução Manual das Transformações dbt

Se você quiser executar apenas o dbt sem o Airflow:

```bash
# Entre no container
docker exec -it northwind-data-pipeline-airflow-scheduler-1 bash

# Execute as transformações
cd /opt/airflow/dbt/northwind_dw

# Instalar dependências
dbt deps --profiles-dir /opt/airflow/dbt

# Executar todos os modelos
dbt run --profiles-dir /opt/airflow/dbt

# Executar apenas Silver
dbt run --select silver_* --profiles-dir /opt/airflow/dbt

# Executar apenas Gold
dbt run --select gold_* --profiles-dir /opt/airflow/dbt

# Executar os testes
dbt test --profiles-dir /opt/airflow/dbt

# Gerar documentação
dbt docs generate --profiles-dir /opt/airflow/dbt
```

### Execução Automática

O pipeline pode ser configurado para executar automaticamente (ajuste no arquivo DAG):

```python
schedule_interval='0 2 * * *',  # Diariamente às 2h AM
```

## 📊 Camadas de Dados

### Bronze Layer (Raw Data)

Dados brutos ingeridos do PostgreSQL via script Python customizado:

| Tabela | Descrição | Registros |
|--------|-----------|-----------|
| `bronze_categories` | Categorias de produtos | 8 |
| `bronze_customers` | Clientes | 91 |
| `bronze_employees` | Funcionários | 9 |
| `bronze_orders` | Pedidos | 830 |
| `bronze_order_details` | Detalhes dos pedidos | 2155 |
| `bronze_products` | Produtos | 77 |
| `bronze_suppliers` | Fornecedores | 29 |
| `bronze_shippers` | Transportadoras | 3 |

### Silver Layer (Modeled Data)

Dados modelados em dimensões e fatos:

| Modelo | Tipo | Descrição |
|--------|------|-----------|
| `silver_dim_customers` | Dimensão | Dimensão de clientes com surrogate key |
| `silver_dim_products` | Dimensão | Dimensão de produtos enriquecida |
| `silver_dim_employees` | Dimensão | Dimensão de funcionários |
| `silver_fact_orders` | Fato | Fato de pedidos com métricas |

### Gold Layer (Business Metrics)

Agregações de negócio prontas para análise:

| Modelo | Descrição | Métricas |
|--------|-----------|----------|
| `gold_customer_revenue` | Receita por cliente | Total revenue, order count, avg order value |
| `gold_employee_performance` | Performance de vendedores | Orders handled, total revenue, avg order |
| `gold_product_performance` | Performance de produtos | Units sold, total revenue, avg price |
| `gold_revenue_by_category` | Receita por categoria | Revenue per category, product count |
| `gold_revenue_by_supplier` | Receita por fornecedor | Revenue per supplier, order count |

## 📈 Monitoramento

### Airflow UI - Acompanhamento em Tempo Real

Acesse http://localhost:8080 para visualizar:
- ✅ Status de execução das DAGs
- ✅ Logs detalhados de cada task
- ✅ Gráfico de dependências (Graph View)
- ✅ Histórico de execuções (Gantt Chart)

### Logs dos Containers

```bash
# Airflow Scheduler
docker logs -f northwind-data-pipeline-airflow-scheduler-1

# Airflow Webserver
docker logs -f northwind-data-pipeline-airflow-webserver-1

# PostgreSQL
docker logs -f northwind-data-pipeline-postgres-1
```

### Verificar Dados no BigQuery

```sql
-- Verificar contagem de registros por camada
SELECT 
  'Bronze - Orders' as table_name,
  COUNT(*) as record_count 
FROM `portifolio-482811.northwind_bronze.bronze_orders`

UNION ALL

SELECT 
  'Silver - Fact Orders' as table_name,
  COUNT(*) as record_count 
FROM `portifolio-482811.northwind_silver.silver_fact_orders`

UNION ALL

SELECT 
  'Gold - Customer Revenue' as table_name,
  COUNT(*) as record_count 
FROM `portifolio-482811.northwind_gold.gold_customer_revenue`;
```

### Exemplo de Consulta Analítica

```sql
-- Top 10 clientes por receita
SELECT 
  customer_id,
  total_revenue,
  order_count,
  avg_order_value
FROM `portifolio-482811.northwind_gold.gold_customer_revenue`
ORDER BY total_revenue DESC
LIMIT 10;
```

## 🧪 Testes

### Testes Implementados

O projeto inclui **16 testes de qualidade de dados**:

#### Testes de Integridade (Bronze Layer)
- ✅ Uniqueness de primary keys
- ✅ Not null em campos obrigatórios

#### Testes de Negócio (Silver Layer)
- ✅ Validação de surrogate keys
- ✅ Consistência de foreign keys
- ✅ Validação de customer_id, product_id, employee_id

### Executar Testes

```bash
# Todos os testes
docker exec -it northwind-data-pipeline-airflow-scheduler-1 bash -c \
  "cd /opt/airflow/dbt/northwind_dw && dbt test --profiles-dir /opt/airflow/dbt"

# Testes de uma camada específica
dbt test --select silver_* --profiles-dir /opt/airflow/dbt

# Teste de um modelo específico
dbt test --select silver_dim_customers --profiles-dir /opt/airflow/dbt
```

### Exemplo de Saída

```
Completed successfully

Done. PASS=16 WARN=0 ERROR=0 SKIP=0 TOTAL=16
```

## 🔧 Manutenção e Troubleshooting

### Comandos Úteis

```bash
# Reiniciar apenas o Airflow
docker-compose restart airflow-webserver airflow-scheduler

# Ver uso de recursos
docker stats

# Limpar logs antigos
docker exec -it northwind-data-pipeline-airflow-scheduler-1 \
  find /opt/airflow/logs -type f -mtime +7 -delete
```

### Problemas Comuns

#### ❌ Erro: "Permission denied" no BigQuery
**Solução**: Verifique as permissões da Service Account no GCP

#### ❌ Erro: "dbt command not found"
**Solução**: O entrypoint.sh instala automaticamente. Reinicie o container:
```bash
docker-compose restart airflow-scheduler
```

#### ❌ DAG não aparece no Airflow
**Solução**: Verifique se o arquivo DAG tem erros de sintaxe:
```bash
docker exec -it northwind-data-pipeline-airflow-scheduler-1 \
  python /opt/airflow/dags/northwind_pipeline_dag.py
```

### Limpar Ambiente Completamente

```bash
# Parar todos os containers
docker-compose down

# Remover volumes (ATENÇÃO: apaga todos os dados!)
docker-compose down -v

# Remover imagens
docker-compose down --rmi all

# Reiniciar do zero
docker-compose up -d
```

## 📚 Recursos e Referências

### Documentação Oficial
- [dbt Documentation](https://docs.getdbt.com/) - Transformações e testes
- [Apache Airflow Docs](https://airflow.apache.org/docs/) - Orquestração
- [BigQuery Documentation](https://cloud.google.com/bigquery/docs) - Data Warehouse
- [Docker Compose](https://docs.docker.com/compose/) - Containerização

### Conceitos Aplicados
- **Medallion Architecture**: Bronze → Silver → Gold layers
- **Star Schema**: Modelagem dimensional
- **ELT Pattern**: Extract-Load-Transform
- **Data Quality**: Testes automatizados com dbt
- **Infrastructure as Code**: Docker Compose

### Artigos Relacionados
- [Medallion Architecture Best Practices](https://www.databricks.com/glossary/medallion-architecture)
- [dbt Best Practices](https://docs.getdbt.com/guides/best-practices)
- [Airflow Task Groups](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html#taskgroups)

## 🎓 Aprendizados e Desafios

### Desafios Técnicos Superados

1. **Integração dbt + Airflow**: Implementação usando BashOperator ao invés de Astronomer Cosmos para maior controle
2. **Serialização JSON**: Tratamento de tipos Decimal e datetime para BigQuery
3. **Docker Dependencies**: Configuração de entrypoint.sh para instalação automática de git e dependências
4. **dbt Packages**: Correção do formato packages.yml para instalação do dbt_utils

### Skills Demonstradas

- ✅ Python ETL development (431 linhas)
- ✅ SQL transformations com dbt (17 modelos)
- ✅ Airflow DAG development com TaskGroups
- ✅ Docker Compose orchestration
- ✅ Google Cloud BigQuery
- ✅ Git version control
- ✅ Data quality testing
- ✅ Documentation

## 🚀 Próximos Passos

Melhorias futuras planejadas:

- [ ] Implementar CI/CD com GitHub Actions
- [ ] Adicionar Great Expectations para validações avançadas
- [ ] Criar dashboard no Looker Studio/Power BI
- [ ] Implementar incremental models no dbt
- [ ] Adicionar alertas via Slack/Email
- [ ] Implementar data lineage tracking
- [ ] Adicionar mais testes de qualidade
- [ ] Otimizar particionamento no BigQuery

## 👤 Autor

**Guilherme Alves da Silva**
- 📧 Email: gads1208@gmail.com
- 🐙 GitHub: [@Gads1208](https://github.com/Gads1208)
- 🔗 LinkedIn: [Seu Perfil](https://linkedin.com/in/seu-perfil)

> 💼 Este projeto foi desenvolvido como parte do meu portfólio de Data Engineering, demonstrando habilidades em ETL/ELT, orquestração de dados, transformações SQL e infraestrutura em nuvem.

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- Base de dados **Northwind** da Microsoft - Dataset clássico para demonstrações
- Comunidade **dbt** - Framework incrível para transformações
- **Apache Airflow** - Orquestração de pipelines de dados
- **Google Cloud Platform** - Infraestrutura BigQuery

---

<div align="center">

### ⭐ Se este projeto foi útil para você, considere dar uma estrela!

**Made with ❤️ and ☕ by Guilherme**

[⬆ Voltar ao topo](#-northwind-data-pipeline---projeto-de-engenharia-de-dados)

</div>
