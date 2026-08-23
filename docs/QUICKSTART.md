# 🚀 Northwind AI Platform & Data Pipeline - Quick Start Guide

Guia rápido e direto para executar, validar e operar todos os serviços da plataforma **Northwind AI Platform & Data Pipeline**.

---

## ✅ Status dos Serviços da Plataforma

A aplicação é orquestrada via **Docker Compose** e composta por 8 microserviços contêinerizados:

| Serviço | Container | Porta / URL | Descrição |
|---|---|---|---|
| **API Gateway** | `northwind-gateway` | [http://localhost](http://localhost) | Proxy reverso Nginx roteando Frontend e APIs |
| **Frontend BI Dashboard** | `northwind-frontend` | [http://localhost:3000](http://localhost:3000) ou `:80` | Interface interativa React + TypeScript + Tailwind |
| **Backend API** | `northwind-backend` | [http://localhost:8000/docs](http://localhost:8000/docs) | FastAPI REST API, Runner dbt e Ingestão BigQuery |
| **MCP Server** | `northwind-mcp-server` | [http://localhost:8001/mcp/tools](http://localhost:8001/mcp/tools) | Servidor Model Context Protocol (SQL seguro e tools) |
| **AI Orchestrator** | `northwind-ai-orchestrator` | [http://localhost:8002/docs](http://localhost:8002/docs) | Grafo Multi-Agente (SQL, Analyst, Vis, Insight, Doc) |
| **PostgreSQL DB** | `northwind-postgres` | `localhost:5432` | Banco Northwind relacional de origem |
| **Redis Cache** | `northwind-redis` | `localhost:6379` | Cache em memória e sessões |
| **Prometheus** | `northwind-prometheus` | [http://localhost:9090](http://localhost:9090) | Coleta de métricas e observabilidade |

---

## ⚡ Como Executar o Projeto Passo a Passo

### 1. Iniciar os Containers Docker

Para iniciar toda a stack em segundo plano:

```bash
docker compose up -d
```

Para verificar o status e a saúde de todos os containers:

```bash
docker compose ps
```

---

### 2. Verificar os Dados no PostgreSQL

O banco PostgreSQL é inicializado automaticamente com os esquemas e dados da base Northwind.

Conecte-se ao container usando o usuário e banco `northwind`:

```bash
docker exec -it northwind-postgres psql -U northwind -d northwind
```

Comandos SQL úteis para conferir os dados:

```sql
\dt                                          -- Listar todas as tabelas
SELECT COUNT(*) FROM customers;              -- Contar clientes (23 registros)
SELECT COUNT(*) FROM orders;                 -- Contar pedidos (14 registros)
SELECT COUNT(*) FROM products;               -- Contar produtos (12 registros)
SELECT 'orders' AS tbl, COUNT(*) FROM orders;
\q                                           -- Sair do psql
```

> **Credenciais do PostgreSQL**:
> - **Host**: `localhost` (ou `postgres` dentro da rede Docker)
> - **Porta**: `5432`
> - **Database**: `northwind`
> - **Usuário**: `northwind`
> - **Senha**: `northwind123`

---

### 3. Executar o Pipeline de Dados (PostgreSQL ➔ BigQuery ➔ dbt)

O pipeline de dados é executado diretamente através do container `northwind-backend`, que possui o cliente BigQuery e o dbt configurados.

#### Passo 3.1: Verificar Diagnóstico do BigQuery
```bash
docker exec northwind-backend python scripts/check_bigquery.py
```

#### Passo 3.2: Ingestão de Dados (PostgreSQL ➔ BigQuery Bronze)
Executa a extração incremental/full das tabelas do Postgres e carrega no dataset `northwind_bronze`:
```bash
docker exec northwind-backend python airflow/scripts/postgres_to_bigquery.py
```

#### Passo 3.3: Transformações dbt (Bronze ➔ Silver ➔ Gold)
Executa a modelagem dimensional (Star Schema / Medallion Architecture) no BigQuery:
```bash
docker exec northwind-backend dbt run --project-dir /app/dbt/northwind_dw --profiles-dir /app/dbt
```

#### Passo 3.4: Testes de Qualidade de Dados dbt
Executa os testes de schema, unicidade (`unique`) e nulidade (`not_null`):
```bash
docker exec northwind-backend dbt test --project-dir /app/dbt/northwind_dw --profiles-dir /app/dbt
```

---

### 4. Acessar as Interfaces e APIs

- 📊 **Dashboard BI Interativo**: [http://localhost](http://localhost) (ou [http://localhost:3000](http://localhost:3000))
  - Navegue pelas 14 páginas de métricas (Home, Clientes, Pedidos, Vendas, Produtos, etc.)
  - Use o **Chatbot IA Contextual** integrado em cada tela para fazer perguntas sobre os dados
- 📖 **Documentação Swagger (Backend API)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🔌 **Ferramentas do Servidor MCP**: [http://localhost:8001/mcp/tools](http://localhost:8001/mcp/tools)
- 🤖 **Documentação Multi-Agente AI**: [http://localhost:8002/docs](http://localhost:8002/docs)
- 📈 **Métricas do Prometheus**: [http://localhost:9090](http://localhost:9090)

---

### 5. Executar os Testes Automatizados

Para rodar a suite de testes unitários (validação de segurança SQL contra injeções/drops e recomendação de gráficos MCP):

```bash
python3 -m unittest discover -s tests -p "test_*.py"
```

---

## 🛠️ Comandos de Gestão

```bash
# Ver logs de todos os serviços em tempo real
docker compose logs -f

# Ver logs de um serviço específico (ex: backend, mcp-server, ai-orchestrator)
docker compose logs -f backend

# Reiniciar todos os serviços
docker compose restart

# Parar e remover todos os containers
docker compose down

# Parar e resetar volumes de dados
docker compose down -v
```

---

## 📚 Documentações Complementares

- [docs/ARCHITECTURE.md](ARCHITECTURE.md) - Arquitetura de microsserviços e fluxo de dados
- [docs/MCP_SPECIFICATION.md](MCP_SPECIFICATION.md) - Ferramentas e protocolos do MCP Server
- [docs/MULTI_AGENT_WORKFLOW.md](MULTI_AGENT_WORKFLOW.md) - Grafos e orquestração dos Agentes IA
- [docs/DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guia de implantação em produção
- [docs/DATA_DICTIONARY.md](DATA_DICTIONARY.md) - Dicionário de dados Northwind
