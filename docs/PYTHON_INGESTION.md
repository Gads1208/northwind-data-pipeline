# 🐍 Script Python para Ingestão de Dados

Este documento explica o script Python customizado que substitui o Airbyte para ingestão de dados.

## 📍 Localização

```
airflow/scripts/postgres_to_bigquery.py
```

## 🎯 Objetivo

Extrair dados do PostgreSQL (Northwind) e carregar no Google BigQuery (camada Bronze) de forma automatizada, com metadados de rastreamento e tratamento de erros.

## 🏗️ Arquitetura

```
┌─────────────────┐
│   PostgreSQL    │
│   (Northwind)   │
└────────┬────────┘
         │
         ↓ psycopg2
┌─────────────────────────────┐
│  PostgresToBigQueryLoader   │
│                             │
│  1. get_table_schema()      │
│  2. extract_table_data()    │
│  3. create_or_update_table()│
│  4. load_data_to_bigquery() │
└────────┬────────────────────┘
         │
         ↓ google-cloud-bigquery
┌─────────────────┐
│   BigQuery      │
│ (Bronze Layer)  │
└─────────────────┘
```

## 🔧 Funcionalidades

### 1. **Classe PostgresToBigQueryLoader**

Gerencia todo o processo de sincronização.

```python
loader = PostgresToBigQueryLoader(
    bigquery_project_id='meu-projeto',
    bigquery_dataset='northwind_bronze',
    service_account_path='/path/to/gcp-key.json'
)
```

### 2. **Extração de Dados**

```python
data = loader.extract_table_data('customers')
# Retorna: [{'customer_id': 'ALFKI', 'company_name': 'Alfreds', ...}, ...]
```

**Features**:
- ✅ Usa `RealDictCursor` para retornar dicionários
- ✅ Adiciona metadados `_airbyte_extracted_at` e `_airbyte_loaded_at`
- ✅ Gerenciamento automático de conexões
- ✅ Tratamento de erros robusto

### 3. **Mapeamento de Schema**

Converte automaticamente tipos PostgreSQL → BigQuery:

| PostgreSQL | BigQuery | Exemplo |
|-----------|----------|---------|
| VARCHAR | STRING | 'ALFKI' |
| INTEGER | INTEGER | 12345 |
| NUMERIC | NUMERIC | 123.45 |
| DATE | DATE | 2024-01-15 |
| BOOLEAN | BOOLEAN | true |
| TIMESTAMP | TIMESTAMP | 2024-01-15 10:30:00 |

### 4. **Carga no BigQuery**

```python
loader.load_data_to_bigquery('customers', data)
```

**Configurações**:
- `WRITE_TRUNCATE`: Sobrescreve dados existentes (full refresh)
- `NEWLINE_DELIMITED_JSON`: Formato eficiente
- Criação automática de tabelas se não existirem

### 5. **Sincronização Completa**

```python
results = loader.sync_all_tables()
# Sincroniza: customers, orders, products, employees, suppliers, categories, shippers, order_details
```

## 📊 Tabelas Suportadas

| Tabela | Registros Esperados | Chave Primária |
|--------|---------------------|----------------|
| customers | ~90 | customer_id |
| orders | ~800 | order_id |
| order_details | ~2000 | order_id + product_id |
| products | ~77 | product_id |
| employees | ~10 | employee_id |
| suppliers | ~29 | supplier_id |
| categories | ~8 | category_id |
| shippers | ~3 | shipper_id |

## 🔄 Integração com Airflow

O script é chamado automaticamente pelo DAG `northwind_data_pipeline`:

```python
# airflow/dags/northwind_pipeline_dag.py

def sync_postgres_to_bigquery():
    from postgres_to_bigquery import PostgresToBigQueryLoader
    
    loader = PostgresToBigQueryLoader(
        bigquery_project_id=os.getenv('GCP_PROJECT_ID'),
        bigquery_dataset='northwind_bronze'
    )
    
    results = loader.sync_all_tables()
    
    if results['failed'] > 0:
        raise Exception(f"Falha em {results['failed']} tabelas")
    
    return results

sync_data = PythonOperator(
    task_id='sync_postgres_to_bigquery',
    python_callable=sync_postgres_to_bigquery,
)
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Configure no `docker-compose.yml` ou `.env`:

```bash
GCP_PROJECT_ID=meu-projeto-gcp
BIGQUERY_DATASET=northwind_bronze
GOOGLE_APPLICATION_CREDENTIALS=/opt/airflow/gcp-key.json

POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=northwind
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

### 2. Credenciais GCP

1. Crie uma Service Account no GCP
2. Dê permissões de BigQuery Admin
3. Baixe a chave JSON
4. Salve como `gcp-key.json` na raiz do projeto

### 3. Dependências

Instaladas automaticamente via `requirements.txt`:

```txt
psycopg2-binary==2.9.9
google-cloud-bigquery==3.14.1
google-auth==2.25.2
```

## 🧪 Testes

### Teste Local (Fora do Docker)

```bash
cd /home/gas/Guilherme/potifolio/northwind-data-pipeline/airflow/scripts

# Configurar variáveis
export GCP_PROJECT_ID=meu-projeto
export POSTGRES_HOST=localhost
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcp-key.json

# Executar
python postgres_to_bigquery.py
```

### Teste no Docker

```bash
docker exec -it airflow-webserver bash
cd /opt/airflow/scripts
python postgres_to_bigquery.py
```

### Saída Esperada

```
2024-01-15 10:30:00 - INFO - Loader inicializado - Projeto: meu-projeto, Dataset: northwind_bronze
2024-01-15 10:30:01 - INFO - Conexão com PostgreSQL estabelecida
2024-01-15 10:30:01 - INFO - Extraídos 91 registros da tabela customers
2024-01-15 10:30:02 - INFO - Tabela meu-projeto.northwind_bronze.bronze_customers criada
2024-01-15 10:30:03 - INFO - Carregados 91 registros na tabela bronze_customers
2024-01-15 10:30:03 - INFO - Sincronização concluída: customers - 91 registros em 2.15s
...
==================================================
RESUMO DA SINCRONIZAÇÃO
==================================================
Total de tabelas: 8
Sucesso: 8
Falhas: 0
Total de registros: 3215
==================================================
```

## 📈 Monitoramento

### Logs no Airflow

Visualize logs detalhados na UI do Airflow:

```
http://localhost:8080 → DAGs → northwind_data_pipeline → Task: sync_postgres_to_bigquery → Logs
```

### Verificação no BigQuery

```sql
-- Contar registros por tabela
SELECT 
  table_name,
  row_count,
  size_bytes / 1024 / 1024 as size_mb
FROM `seu-projeto.northwind_bronze.__TABLES__`;

-- Verificar metadados
SELECT 
  COUNT(*) as total,
  MIN(_airbyte_extracted_at) as first_extraction,
  MAX(_airbyte_extracted_at) as last_extraction
FROM `seu-projeto.northwind_bronze.bronze_customers`;
```

## 🚀 Vantagens desta Abordagem

### vs. Airbyte

| Aspecto | Airbyte | Script Python |
|---------|---------|---------------|
| **Setup** | Complexo (10+ containers) | Simples (incluído no Airflow) |
| **Manutenção** | Alta | Baixa |
| **Customização** | Limitada | Total |
| **Overhead** | Alto (~2GB RAM) | Baixo (~100MB RAM) |
| **Debugging** | Difícil | Fácil (logs diretos) |
| **Dependências** | Muitas | Mínimas |

### Benefícios para Portfólio

✅ **Demonstra habilidades em Python**
✅ **Mostra conhecimento de APIs (psycopg2, BigQuery)**
✅ **Código limpo e bem documentado**
✅ **Solução sob medida para o problema**
✅ **Fácil de explicar em entrevistas**

## 🔧 Personalização

### Adicionar Nova Tabela

1. Adicione o schema em `get_table_schema()`:

```python
schemas = {
    'nova_tabela': [
        bigquery.SchemaField('id', 'INTEGER', mode='REQUIRED'),
        bigquery.SchemaField('nome', 'STRING'),
        bigquery.SchemaField('_airbyte_extracted_at', 'TIMESTAMP'),
        bigquery.SchemaField('_airbyte_loaded_at', 'TIMESTAMP'),
    ]
}
```

2. Adicione à lista em `sync_all_tables()`:

```python
tables = [
    'customers',
    'orders',
    # ...
    'nova_tabela'  # Nova!
]
```

### Alterar Estratégia de Carga

Por padrão usa `WRITE_TRUNCATE` (full refresh). Para incremental:

```python
job_config = bigquery.LoadJobConfig(
    write_disposition=bigquery.WriteDisposition.WRITE_APPEND,  # Append
    # Ou
    write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,  # Replace
)
```

### Adicionar Transformações

```python
def extract_table_data(self, table_name: str):
    # ... código existente ...
    
    # Aplicar transformações
    for row in rows:
        row['_airbyte_extracted_at'] = current_time
        row['_airbyte_loaded_at'] = current_time
        
        # Exemplo: normalizar strings
        if 'company_name' in row:
            row['company_name'] = row['company_name'].strip().upper()
    
    return rows
```

## 🐛 Troubleshooting

### Erro: "Variável GCP_PROJECT_ID não configurada"

```bash
# Adicione ao .env
echo "GCP_PROJECT_ID=seu-projeto" >> .env

# Reinicie containers
docker-compose down
docker-compose up -d
```

### Erro: "Permission denied on BigQuery"

Verifique permissões da Service Account:
- BigQuery Admin
- BigQuery Data Editor
- BigQuery Job User

### Erro: "Connection refused to PostgreSQL"

```bash
# Verifique se o container está rodando
docker ps | grep postgres

# Teste conexão
docker exec -it northwind-postgres psql -U postgres -d northwind -c "SELECT 1"
```

### Tabelas Vazias no BigQuery

```python
# Debug: Adicione prints
def extract_table_data(self, table_name: str):
    # ...
    print(f"DEBUG: Extraídos {len(rows)} registros")
    return rows
```

## 📚 Referências

- [psycopg2 Documentation](https://www.psycopg.org/docs/)
- [Google Cloud BigQuery Python Client](https://googleapis.dev/python/bigquery/latest/)
- [Airflow PythonOperator](https://airflow.apache.org/docs/apache-airflow/stable/howto/operator/python.html)

---

**Próximos passos**: Configure o GCP e execute o pipeline! 🚀
