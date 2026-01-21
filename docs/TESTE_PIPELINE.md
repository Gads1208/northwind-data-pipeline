## 🔧 Teste do Pipeline - Passo a Passo

### ✅ Status Atual

**Containers Docker**: Todos rodando!
- ✅ PostgreSQL: 51 registros em 8 tabelas
- ✅ Airflow: Webserver e Scheduler ativos
- ✅ Script Python: Funcionando (bibliotecas instaladas)

**Configuração GCP**:
- ✅ Arquivo gcp-key.json presente (2.4KB)
- ✅ Projeto: portifolio-482811
- ❌ **Datasets precisam ser criados manualmente**

---

## 🚀 Próximo Passo: Criar Datasets no BigQuery

A Service Account atual não tem permissão para criar datasets. Você precisa criar manualmente:

### **Opção 1: Via Console do GCP** (Recomendado)

1. Acesse https://console.cloud.google.com/bigquery?project=portifolio-482811

2. No painel esquerdo, clique no seu projeto `portifolio-482811`

3. Clique em **"CREATE DATASET"** e crie os 3 datasets:

   **Dataset 1: northwind_bronze**
   - Dataset ID: `northwind_bronze`
   - Data location: `US`
   - Description: `Camada Bronze - Dados brutos do PostgreSQL`
   - Deixe outras opções padrão
   - Clique em **CREATE DATASET**

   **Dataset 2: northwind_silver**
   - Dataset ID: `northwind_silver`
   - Data location: `US`
   - Description: `Camada Silver - Dados limpos e enriquecidos`
   - Clique em **CREATE DATASET**

   **Dataset 3: northwind_gold**
   - Dataset ID: `northwind_gold`
   - Data location: `US`
   - Description: `Camada Gold - Agregações de negócio`
   - Clique em **CREATE DATASET**

### **Opção 2: Via bq CLI** (Se tiver instalado)

```bash
# Instalar Google Cloud SDK
snap install google-cloud-sdk

# Autenticar
gcloud auth login
gcloud config set project portifolio-482811

# Criar datasets
bq mk --dataset --location=US --description="Camada Bronze" northwind_bronze
bq mk --dataset --location=US --description="Camada Silver" northwind_silver
bq mk --dataset --location=US --description="Camada Gold" northwind_gold
```

### **Opção 3: Dar Permissão à Service Account**

1. Acesse https://console.cloud.google.com/iam-admin/iam?project=portifolio-482811

2. Encontre sua Service Account (algo como `***@portifolio-482811.iam.gserviceaccount.com`)

3. Clique em **EDIT** (ícone de lápis)

4. Adicione o papel: **BigQuery Admin**

5. Salve e execute novamente:
   ```bash
   docker exec airflow-webserver python /tmp/create_bigquery_datasets.py
   ```

---

## ✅ Depois de Criar os Datasets

### 1. Testar o Script de Ingestão

```bash
docker exec airflow-webserver bash -c "cd /opt/airflow/scripts && python postgres_to_bigquery.py"
```

**Saída esperada:**
```
✅ Loader inicializado - Projeto: portifolio-482811
✅ Sincronização concluída: customers - 5 registros
✅ Sincronização concluída: orders - 5 registros
✅ Sincronização concluída: products - 10 registros
...
==================================================
Total de tabelas: 8
Sucesso: 8
Falhas: 0
Total de registros: 51
==================================================
```

### 2. Verificar Dados no BigQuery

```bash
# Via console: https://console.cloud.google.com/bigquery

# Ou via Python no container:
docker exec airflow-webserver python -c "
from google.cloud import bigquery
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    '/opt/airflow/gcp-key.json'
)
client = bigquery.Client(credentials=credentials, project='portifolio-482811')

query = '''
SELECT table_name, row_count
FROM \`portifolio-482811.northwind_bronze.__TABLES__\`
ORDER BY table_name
'''

for row in client.query(query):
    print(f'{row.table_name}: {row.row_count} registros')
"
```

### 3. Executar DAG no Airflow

1. Acesse http://localhost:8080
   - Username: `airflow`
   - Password: `airflow`

2. Encontre o DAG `northwind_data_pipeline`

3. Ative o DAG (toggle no lado esquerdo)

4. Clique em **"Trigger DAG"** (botão ▶️)

5. Acompanhe a execução:
   - ✅ `sync_postgres_to_bigquery` - Ingestão dos dados
   - ✅ `dbt_deps` - Instalar dependências do dbt
   - ✅ `dbt_run_bronze` - Criar views/tabelas Bronze
   - ✅ `dbt_test_bronze` - Testes de qualidade
   - ✅ `dbt_run_silver` - Transformações Silver
   - ✅ `dbt_test_silver` - Testes Silver
   - ✅ `dbt_run_gold` - Agregações Gold
   - ✅ `dbt_test_gold` - Testes finais
   - ✅ `dbt_docs_generate` - Gerar documentação

### 4. Executar dbt Manualmente (Alternativa)

```bash
# Entrar no container
docker exec -it airflow-webserver bash

# Navegar para o projeto dbt
cd /opt/airflow/dbt/northwind_dw

# Instalar dependências
dbt deps --profiles-dir /opt/airflow/dbt

# Executar todos os modelos
dbt run --profiles-dir /opt/airflow/dbt

# Executar apenas uma camada
dbt run --select tag:bronze --profiles-dir /opt/airflow/dbt
dbt run --select tag:silver --profiles-dir /opt/airflow/dbt
dbt run --select tag:gold --profiles-dir /opt/airflow/dbt

# Executar testes
dbt test --profiles-dir /opt/airflow/dbt

# Gerar documentação
dbt docs generate --profiles-dir /opt/airflow/dbt
```

---

## 📊 Validação Final

### Checar Tabelas Criadas

```sql
-- No BigQuery Console
-- https://console.cloud.google.com/bigquery?project=portifolio-482811

-- Bronze Layer (dados brutos)
SELECT * FROM `portifolio-482811.northwind_bronze.bronze_customers` LIMIT 5;
SELECT * FROM `portifolio-482811.northwind_bronze.bronze_orders` LIMIT 5;

-- Silver Layer (dados limpos)
SELECT * FROM `portifolio-482811.northwind_silver.dim_customers` LIMIT 5;
SELECT * FROM `portifolio-482811.northwind_silver.dim_products` LIMIT 5;
SELECT * FROM `portifolio-482811.northwind_silver.fact_sales` LIMIT 10;

-- Gold Layer (métricas de negócio)
SELECT * FROM `portifolio-482811.northwind_gold.revenue_by_customer` ORDER BY total_revenue DESC;
SELECT * FROM `portifolio-482811.northwind_gold.sales_summary`;
```

### Contagem de Registros Esperada

| Camada | Tabela | Registros Esperados |
|--------|--------|---------------------|
| Bronze | bronze_customers | 5 |
| Bronze | bronze_orders | 5 |
| Bronze | bronze_products | 10 |
| Bronze | bronze_employees | 5 |
| Silver | dim_customers | 5 |
| Silver | dim_products | 10 |
| Silver | fact_sales | 11 |
| Gold | revenue_by_customer | 3-5 |
| Gold | sales_summary | 1 |

---

## 🎯 Próximas Ações

Depois que o pipeline funcionar:

1. **Publicar no GitHub**
   ```bash
   git init
   git add .
   git commit -m "Pipeline de dados Northwind com Python e dbt"
   git remote add origin https://github.com/seu-usuario/northwind-pipeline
   git push -u origin main
   ```

2. **Criar README impressionante** (já temos!)

3. **Adicionar ao LinkedIn** com link do GitHub

4. **Preparar apresentação** para entrevistas

---

**Status**: ⏳ **Aguardando criação dos datasets no BigQuery**

Depois que criar os 3 datasets, execute:
```bash
docker exec airflow-webserver bash -c "cd /opt/airflow/scripts && python postgres_to_bigquery.py"
```
