## 🔧 SOLUÇÃO: Configurar Permissões no BigQuery

### 🎯 Problema Identificado

A Service Account está autenticada ✅, mas:
- ❌ Não consegue listar datasets
- ❌ Não consegue criar tabelas
- ❌ Datasets podem não existir OU faltam permissões

---

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### **Passo 1: Dar Permissões à Service Account** (FAÇA PRIMEIRO)

1. **Abra o IAM do projeto:**
   ```
   https://console.cloud.google.com/iam-admin/iam?project=portifolio-482811
   ```

2. **Encontre sua Service Account**
   - Procure por um email terminando em `@portifolio-482811.iam.gserviceaccount.com`
   - Exemplo: `data-pipeline@portifolio-482811.iam.gserviceaccount.com`

3. **Editar Permissões**
   - Clique no ícone de **lápis (✏️)** ao lado da Service Account
   - Clique em **"+ ADD ANOTHER ROLE"**
   - Procure e selecione: **BigQuery Admin**
   - Clique em **SAVE**

   > ⚡ **BigQuery Admin** dá permissões completas (ideal para desenvolvimento)

---

### **Passo 2: Criar os 3 Datasets**

1. **Abra o BigQuery Console:**
   ```
   https://console.cloud.google.com/bigquery?project=portifolio-482811
   ```

2. **Criar Dataset Bronze:**
   - No painel esquerdo, clique nos **3 pontinhos (⋮)** ao lado do projeto `portifolio-482811`
   - Selecione **"Create dataset"**
   - Preencha:
     ```
     Dataset ID: northwind_bronze
     Data location: US (multiple regions in United States)
     Default table expiration: Never
     ```
   - Clique em **CREATE DATASET**

3. **Criar Dataset Silver:**
   - Repita o processo acima com:
     ```
     Dataset ID: northwind_silver
     Data location: US
     ```

4. **Criar Dataset Gold:**
   - Repita o processo acima com:
     ```
     Dataset ID: northwind_gold
     Data location: US
     ```

---

### **Passo 3: Testar Novamente**

Depois de criar os datasets e dar permissões, execute:

```bash
# 1. Verificar se agora consegue listar datasets
docker exec airflow-webserver python /tmp/check_bigquery.py

# 2. Executar a ingestão
docker exec airflow-webserver bash -c "cd /opt/airflow/scripts && python postgres_to_bigquery.py"
```

**Saída esperada:**
```
✅ Extraídos 5 registros da tabela customers
✅ Carregados 5 registros na tabela bronze_customers
...
==================================================
Total de tabelas: 8
Sucesso: 8
Falhas: 0
Total de registros: 51
==================================================
```

---

## 🎬 VISUAL GUIDE - Passo a Passo com Screenshots

### 1️⃣ Conceder Permissões (IAM)

```
1. Vá em: Cloud Console → IAM & Admin → IAM
   https://console.cloud.google.com/iam-admin/iam?project=portifolio-482811

2. Você verá uma lista de principals (usuários/service accounts)

3. Encontre sua Service Account (algo como):
   📧 xxxxx@portifolio-482811.iam.gserviceaccount.com
   
4. Clique no ícone ✏️ (Edit principal) à direita

5. Na seção "Assign roles", clique em "+ ADD ANOTHER ROLE"

6. No campo de busca, digite: "BigQuery Admin"

7. Selecione: BigQuery Admin

8. Clique em SAVE
```

### 2️⃣ Criar Datasets (BigQuery)

```
1. Vá em: Cloud Console → BigQuery
   https://console.cloud.google.com/bigquery?project=portifolio-482811

2. No painel EXPLORER (esquerda), você verá:
   📁 portifolio-482811
   
3. Clique nos 3 pontinhos (⋮) ao lado do nome do projeto

4. Selecione "Create dataset"

5. Preencha o formulário:
   ┌─────────────────────────────────────┐
   │ Dataset ID: northwind_bronze        │
   │ Data location: US                   │
   │ Default table expiration: Never     │
   │ Encryption: Google-managed key      │
   └─────────────────────────────────────┘

6. Clique em "CREATE DATASET"

7. Repita para northwind_silver e northwind_gold
```

---

## 🔍 Verificação Detalhada

Depois de configurar, verifique se tudo está OK:

```bash
# Executar diagnóstico completo
docker exec airflow-webserver python /tmp/check_bigquery.py
```

**Saída esperada:**
```
✅ Autenticação OK
📁 Projeto: portifolio-482811

📊 DATASETS EXISTENTES:
  ✓ northwind_bronze
    Location: US
    Tables: 0
  ✓ northwind_silver
    Location: US
    Tables: 0
  ✓ northwind_gold
    Location: US
    Tables: 0

🎯 DATASETS NECESSÁRIOS:
  ✅ northwind_bronze existe
  ✅ northwind_silver existe
  ✅ northwind_gold existe
```

---

## 🚀 Depois que Funcionar

### 1. Testar Ingestão Completa

```bash
docker exec airflow-webserver bash -c "cd /opt/airflow/scripts && python postgres_to_bigquery.py"
```

### 2. Verificar Dados no BigQuery

```bash
docker exec airflow-webserver python -c "
from google.cloud import bigquery
from google.oauth2 import service_account

credentials = service_account.Credentials.from_service_account_file(
    '/opt/airflow/gcp-key.json'
)
client = bigquery.Client(credentials=credentials, project='portifolio-482811')

# Listar tabelas criadas
for dataset_id in ['northwind_bronze', 'northwind_silver', 'northwind_gold']:
    tables = list(client.list_tables(f'portifolio-482811.{dataset_id}'))
    print(f'\n{dataset_id}: {len(tables)} tabelas')
    for table in tables:
        query = f'SELECT COUNT(*) as count FROM \`portifolio-482811.{dataset_id}.{table.table_id}\`'
        result = list(client.query(query))[0]
        print(f'  - {table.table_id}: {result.count} registros')
"
```

### 3. Executar DAG no Airflow

```
http://localhost:8080
Username: airflow
Password: airflow

→ DAGs → northwind_data_pipeline → Trigger DAG ▶️
```

---

## ❓ Troubleshooting

### Erro: "Service Account não aparece no IAM"

Verifique qual Service Account está sendo usada:

```bash
docker exec airflow-webserver python -c "
import json
with open('/opt/airflow/gcp-key.json') as f:
    key = json.load(f)
    print('Service Account Email:', key['client_email'])
"
```

Se a Service Account não aparecer na lista do IAM:

1. Vá em: **IAM & Admin → Service Accounts**
2. Encontre a Service Account
3. Clique nos **3 pontinhos (⋮)** → **Manage permissions**
4. Grant Access → Add: **BigQuery Admin**

### Erro: "Ainda sem permissão após adicionar role"

Aguarde 1-2 minutos para as permissões propagarem, depois:

```bash
# Reiniciar container (para renovar credenciais)
docker-compose restart airflow-webserver airflow-scheduler

# Testar novamente
docker exec airflow-webserver python /tmp/check_bigquery.py
```

---

## 📚 Referências

- [BigQuery Roles](https://cloud.google.com/bigquery/docs/access-control)
- [Service Account Permissions](https://cloud.google.com/iam/docs/service-accounts)
- [BigQuery Datasets](https://cloud.google.com/bigquery/docs/datasets-intro)

---

**Próximo passo**: Depois que funcionar, volte ao [TESTE_PIPELINE.md](TESTE_PIPELINE.md) para executar o pipeline completo!
