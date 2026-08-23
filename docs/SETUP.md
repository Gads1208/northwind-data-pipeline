# 🔧 Guia de Instalação Detalhado

Este guia fornece instruções passo a passo para configurar o projeto Northwind Data Pipeline.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação do Docker](#instalação-do-docker)
3. [Configuração do Google Cloud](#configuração-do-google-cloud)
4. [Clone e Configuração do Projeto](#clone-e-configuração-do-projeto)
5. [Inicialização dos Serviços](#inicialização-dos-serviços)
6. [Configuração do Airbyte](#configuração-do-airbyte)
7. [Configuração do dbt](#configuração-do-dbt)
8. [Configuração do Airflow](#configuração-do-airflow)
9. [Verificação da Instalação](#verificação-da-instalação)
10. [Troubleshooting](#troubleshooting)

## Pré-requisitos

### Requisitos de Hardware

- **RAM**: Mínimo 8GB (recomendado 16GB)
- **Disco**: Mínimo 20GB de espaço livre
- **CPU**: 4 cores recomendado

### Requisitos de Software

- **Sistema Operacional**: Linux, macOS ou Windows 10/11 com WSL2
- **Docker**: Versão 20.10+
- **Docker Compose**: Versão 2.0+
- **Git**: Versão 2.0+
- **Google Cloud SDK** (opcional, mas recomendado)

## Instalação do Docker

### Linux (Ubuntu/Debian)

```bash
# Atualizar pacotes
sudo apt-get update

# Instalar dependências
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Adicionar chave GPG do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar repositório
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Reiniciar sessão
newgrp docker
```

### macOS

```bash
# Instalar via Homebrew
brew install --cask docker

# Ou baixar Docker Desktop em:
# https://www.docker.com/products/docker-desktop
```

### Verificar Instalação

```bash
docker --version
docker compose version
```

## Configuração do Google Cloud

### 1. Criar Projeto no GCP

```bash
# Instalar Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Criar novo projeto
gcloud projects create northwind-data-pipeline --name="Northwind Data Pipeline"

# Definir projeto padrão
gcloud config set project northwind-data-pipeline
```

### 2. Habilitar APIs

```bash
# Habilitar BigQuery API
gcloud services enable bigquery.googleapis.com
gcloud services enable bigquerystorage.googleapis.com
```

### 3. Criar Service Account

```bash
# Criar service account
gcloud iam service-accounts create northwind-pipeline \
    --description="Service account for Northwind Data Pipeline" \
    --display-name="Northwind Pipeline"

# Dar permissões
gcloud projects add-iam-policy-binding northwind-data-pipeline \
    --member="serviceAccount:northwind-pipeline@northwind-data-pipeline.iam.gserviceaccount.com" \
    --role="roles/bigquery.dataEditor"

gcloud projects add-iam-policy-binding northwind-data-pipeline \
    --member="serviceAccount:northwind-pipeline@northwind-data-pipeline.iam.gserviceaccount.com" \
    --role="roles/bigquery.jobUser"

# Criar chave JSON
gcloud iam service-accounts keys create ~/northwind-sa-key.json \
    --iam-account=northwind-pipeline@northwind-data-pipeline.iam.gserviceaccount.com
```

### 4. Criar Datasets no BigQuery

```bash
# Bronze layer
bq mk --dataset \
    --location=US \
    northwind-data-pipeline:northwind_bronze

# Silver layer
bq mk --dataset \
    --location=US \
    northwind-data-pipeline:northwind_silver

# Gold layer
bq mk --dataset \
    --location=US \
    northwind-data-pipeline:northwind_gold
```

## Clone e Configuração do Projeto

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/northwind-data-pipeline.git
cd northwind-data-pipeline
```

### 2. Configure Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas configurações
nano .env
```

Configuração do `.env`:

```bash
# Google Cloud
GCP_PROJECT_ID=northwind-data-pipeline
GCP_DATASET_BRONZE=northwind_bronze
GCP_DATASET_SILVER=northwind_silver
GCP_DATASET_GOLD=northwind_gold
GOOGLE_APPLICATION_CREDENTIALS=/opt/airflow/gcp-key.json

# PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=northwind
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123

# Airbyte
AIRBYTE_URL=http://airbyte-server:8000
```

### 3. Copiar Service Account Key

```bash
# Copiar a chave para o diretório do projeto
cp ~/northwind-sa-key.json ./gcp-key.json

# Adicionar ao .gitignore (se não estiver)
echo "gcp-key.json" >> .gitignore
```

## Inicialização dos Serviços

### 1. Iniciar Containers

```bash
# Construir e iniciar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Acompanhar logs
docker-compose logs -f
```

### 2. Aguardar Inicialização

Os serviços podem levar de 2-5 minutos para inicializar completamente. Aguarde até que todos os containers estejam "healthy".

```bash
# Verificar saúde dos containers
docker-compose ps

# Deve mostrar todos como "Up" ou "healthy"
```

### 3. Verificar Serviços

```bash
# PostgreSQL
docker exec -it northwind-postgres psql -U northwind -d northwind -c "SELECT COUNT(*) FROM customers;"

# Airflow
curl http://localhost:8080/health

# Airbyte
curl http://localhost:8000/api/v1/health
```

## Configuração do Airbyte

### 1. Acessar Interface Web

Abra seu navegador em: http://localhost:8000

### 2. Configurar Source (PostgreSQL)

1. Clique em **"Sources"** → **"+ New source"**
2. Selecione **"PostgreSQL"**
3. Configure:
   ```
   Name: Northwind PostgreSQL
   Host: postgres
   Port: 5432
   Database: northwind
   Username: postgres
   Password: postgres123
   SSL Mode: disable
   ```
4. Clique em **"Set up source"**

### 3. Configurar Destination (BigQuery)

1. Clique em **"Destinations"** → **"+ New destination"**
2. Selecione **"BigQuery"**
3. Configure:
   ```
   Name: Northwind BigQuery
   Project ID: northwind-data-pipeline
   Dataset Location: US
   Default Dataset: northwind_bronze
   Service Account Key JSON: (cole o conteúdo do gcp-key.json)
   ```
4. Clique em **"Set up destination"**

### 4. Criar Connection

1. Clique em **"Connections"** → **"+ New connection"**
2. Selecione source e destination criados
3. Configure:
   - Replication frequency: **Every hour**
   - Destination namespace: **Custom format**
   - Namespace format: `northwind_bronze`
4. Selecione todas as tabelas
5. Clique em **"Set up connection"**

### 5. Executar Primeira Sincronização

1. Na página da conexão, clique em **"Sync now"**
2. Aguarde a conclusão (pode levar alguns minutos)
3. Verifique no BigQuery se os dados foram carregados

## Configuração do dbt

### 1. Acessar Container do Airflow

```bash
docker exec -it airflow-webserver bash
```

### 2. Instalar Dependências

```bash
cd /opt/airflow/dbt/northwind_dw
dbt deps --profiles-dir /opt/airflow/dbt
```

### 3. Testar Conexão

```bash
dbt debug --profiles-dir /opt/airflow/dbt
```

Você deve ver: `All checks passed!`

### 4. Executar Primeira Transformação

```bash
# Bronze
dbt run --select tag:bronze --profiles-dir /opt/airflow/dbt

# Silver
dbt run --select tag:silver --profiles-dir /opt/airflow/dbt

# Gold
dbt run --select tag:gold --profiles-dir /opt/airflow/dbt
```

### 5. Executar Testes

```bash
dbt test --profiles-dir /opt/airflow/dbt
```

## Configuração do Airflow

### 1. Acessar Interface Web

Abra seu navegador em: http://localhost:8080

Credenciais:
- Username: `airflow`
- Password: `airflow`

### 2. Configurar Variables

1. Vá em **Admin** → **Variables**
2. Adicione:
   ```
   gcp_project = northwind-data-pipeline
   gcp_credentials_path = /opt/airflow/gcp-key.json
   ```

### 3. Ativar DAGs

1. Na página inicial, encontre os DAGs:
   - `northwind_data_pipeline`
   - `northwind_monitoring`
   - `northwind_maintenance`
2. Toggle o botão para **ON** em cada um

### 4. Executar Pipeline Manualmente

1. Clique no DAG `northwind_data_pipeline`
2. Clique em **"Trigger DAG"**
3. Acompanhe a execução no Graph View

## Verificação da Instalação

### 1. Verificar PostgreSQL

```bash
docker exec -it northwind-postgres psql -U northwind -d northwind
```

```sql
-- Verificar tabelas
\dt

-- Verificar dados
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM orders;
```

### 2. Verificar BigQuery

```bash
# Via gcloud
bq query --use_legacy_sql=false 'SELECT COUNT(*) FROM `northwind-data-pipeline.northwind_bronze.bronze_customers`'
```

### 3. Verificar Pipeline Completo

```bash
# Executar query no BigQuery
bq query --use_legacy_sql=false '
SELECT 
    "Bronze" as layer, COUNT(*) as records FROM `northwind-data-pipeline.northwind_bronze.bronze_orders`
UNION ALL
SELECT 
    "Silver" as layer, COUNT(*) as records FROM `northwind-data-pipeline.northwind_silver.silver_fact_orders`
UNION ALL
SELECT 
    "Gold" as layer, COUNT(*) as records FROM `northwind-data-pipeline.northwind_gold.gold_sales_by_country`
'
```

## Troubleshooting

### Problema: Containers não iniciam

```bash
# Verificar logs
docker-compose logs [nome-do-servico]

# Reiniciar serviços
docker-compose restart

# Recriar containers
docker-compose down
docker-compose up -d
```

### Problema: dbt não conecta ao BigQuery

1. Verifique se o service account key está no local correto
2. Verifique as permissões da service account
3. Teste a conexão:

```bash
docker exec -it airflow-webserver bash
cd /opt/airflow/dbt/northwind_dw
dbt debug --profiles-dir /opt/airflow/dbt
```

### Problema: Airbyte sync falha

1. Verifique logs do Airbyte:
```bash
docker-compose logs airbyte-worker
```

2. Verifique conectividade:
```bash
docker exec -it airbyte-worker ping postgres
```

### Problema: Sem espaço em disco

```bash
# Limpar containers e volumes não usados
docker system prune -a --volumes

# CUIDADO: isso remove TODOS os dados não usados
```

### Problema: Porta já em uso

Se alguma porta (5432, 8000, 8080) já estiver em uso:

1. Edite `docker-compose.yml`
2. Altere o mapeamento de portas:
```yaml
ports:
  - "5433:5432"  # Usar porta 5433 no host
```

## Próximos Passos

Após a instalação bem-sucedida:

1. Explore a [documentação principal](README.md)
2. Revise a [arquitetura do sistema](ARCHITECTURE.md)
3. Consulte o [dicionário de dados](DATA_DICTIONARY.md)
4. Configure alertas e monitoramento
5. Customize as transformações dbt conforme suas necessidades

## Suporte

Se encontrar problemas:

1. Verifique os logs dos containers
2. Consulte a documentação oficial das ferramentas
3. Abra uma issue no GitHub do projeto
