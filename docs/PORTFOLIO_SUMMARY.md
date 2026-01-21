# Pipeline de Dados Northwind - Arquitetura Medallion

## 🎯 Objetivo do Projeto

Desenvolvimento de um pipeline de dados end-to-end implementando a arquitetura Medallion (Bronze, Silver, Gold) com stack moderna de tecnologias em nuvem. O projeto demonstra expertise em ETL/ELT, orquestração de dados, transformações SQL e infraestrutura cloud.

---

## 💼 Tecnologias Utilizadas

**Data Engineering:**
- **Python 3.11** - Script ETL customizado (431 linhas)
- **PostgreSQL 15** - Banco de dados fonte (Northwind database)
- **Google BigQuery** - Data Warehouse cloud com 3 datasets
- **dbt 1.7.4** - Transformações de dados e testes de qualidade
- **Apache Airflow 2.8.0** - Orquestração e automação do pipeline

**DevOps & Infraestrutura:**
- **Docker Compose** - Orquestração de 4 containers
- **Git/GitHub** - Versionamento e documentação
- **GCP Service Account** - Autenticação e segurança

---

## 🏗️ Arquitetura Implementada

### Pipeline de Dados (ELT)

```
PostgreSQL (51 registros)
    ↓
Python ETL Script
    ↓
BigQuery Bronze Layer (8 tabelas)
    ↓
dbt Silver Layer (4 modelos dimensionais)
    ↓
dbt Gold Layer (5 agregações de negócio)
```

### Arquitetura Medallion

**🥉 Bronze Layer (Raw Data)**
- 8 tabelas com dados brutos
- Ingestão via Python customizado
- Preservação de dados históricos

**🥈 Silver Layer (Modeled Data)**
- 4 modelos dimensionais (star schema)
- Limpeza e padronização de dados
- Implementação de surrogate keys

**🥇 Gold Layer (Business Metrics)**
- 5 agregações de negócio
- Métricas prontas para análise
- Otimização para dashboards

---

## 📊 Resultados Alcançados

### Métricas do Pipeline

| Métrica | Valor |
|---------|-------|
| **Registros Processados** | 51 registros |
| **Tabelas Bronze** | 8 tabelas |
| **Modelos Silver** | 4 dimensões/fatos |
| **Agregações Gold** | 5 métricas |
| **Testes de Qualidade** | 16 testes automatizados |
| **Tempo de Execução** | ~2-3 minutos |

### Principais Entregas

✅ **Pipeline Automatizado** - Orquestração completa via Airflow  
✅ **Qualidade de Dados** - 16 testes automatizados com dbt  
✅ **Documentação Completa** - README detalhado + diagramas  
✅ **Infrastructure as Code** - Docker Compose configurado  
✅ **Cloud Integration** - BigQuery no Google Cloud Platform  

---

## 🛠️ Desafios Técnicos Superados

### 1. Integração dbt + Airflow
**Problema:** Astronomer Cosmos apresentava erros de configuração  
**Solução:** Implementação customizada usando BashOperator com TaskGroups para execução modular dos modelos dbt

### 2. Serialização de Dados
**Problema:** Tipos Decimal e datetime não compatíveis com BigQuery JSON  
**Solução:** Implementação de custom encoder Python para conversão automática (Decimal→float, datetime→isoformat)

### 3. Gerenciamento de Dependências
**Problema:** dbt requer git para instalação de pacotes  
**Solução:** Criação de entrypoint.sh para instalação automática de dependências ao iniciar containers

### 4. Modelagem Dimensional
**Problema:** Dados brutos sem estrutura dimensional  
**Solução:** Implementação de star schema com dimensões e fatos na camada Silver

---

## 💻 Código e Implementação

### Python ETL (431 linhas)

```python
# Principais funcionalidades implementadas:
- Conexão PostgreSQL com psycopg2
- Extração de 8 tabelas com metadata
- Serialização JSON customizada
- Upload para BigQuery com schema inferido
- Tratamento de erros e logging
- Parametrização via variáveis de ambiente
```

### dbt Transformations (17 modelos)

**Silver Layer - Modelagem Dimensional:**
```sql
-- silver_dim_customers.sql
SELECT
  {{ dbt_utils.generate_surrogate_key(['customer_id']) }} as customer_key,
  customer_id,
  company_name,
  contact_name,
  country,
  city
FROM {{ ref('bronze_customers') }}
```

**Gold Layer - Métricas de Negócio:**
```sql
-- gold_customer_revenue.sql
SELECT
  customer_id,
  SUM(total_amount) as total_revenue,
  COUNT(order_id) as order_count,
  AVG(total_amount) as avg_order_value
FROM {{ ref('silver_fact_orders') }}
GROUP BY customer_id
```

### Airflow DAG (295 linhas)

```python
# Principais componentes:
- TaskGroups para Silver e Gold layers
- Dynamic task generation para modelos dbt
- BashOperator para execução dbt
- Dependências configuradas (ingest → silver → gold → tests)
- Schedule configurável (daily/manual)
```

---

## 📈 Impacto e Aprendizados

### Skills Técnicas Demonstradas

✅ **Python Development** - ETL script robusto com tratamento de erros  
✅ **SQL & Data Modeling** - Star schema e agregações complexas  
✅ **Cloud Engineering** - Google Cloud Platform e BigQuery  
✅ **DevOps** - Docker, containerização e automação  
✅ **Data Quality** - Testes automatizados e validações  
✅ **Documentation** - README profissional e código comentado  

### Boas Práticas Implementadas

- **Version Control** - Git com commits semânticos
- **Code Quality** - Código limpo e modular
- **Testing** - 16 testes de qualidade de dados
- **Documentation** - Documentação completa em Markdown
- **Infrastructure as Code** - Docker Compose para reprodutibilidade
- **Separation of Concerns** - Camadas Bronze/Silver/Gold bem definidas

---

## 🔗 Links do Projeto

**GitHub Repository:** [github.com/Gads1208/northwind-data-pipeline](https://github.com/Gads1208/northwind-data-pipeline)

**Documentação Completa:** Ver README.md no repositório

**Tecnologias:** Python | dbt | Airflow | BigQuery | Docker | PostgreSQL

---

## 🎓 Conclusão

Este projeto demonstra capacidade de:

- Projetar e implementar pipelines de dados escaláveis
- Trabalhar com tecnologias modernas de Data Engineering
- Resolver problemas técnicos complexos
- Documentar e versionar código profissionalmente
- Implementar boas práticas de engenharia de dados
- Trabalhar com infraestrutura cloud (GCP)

O pipeline está **funcional**, **testado** e **pronto para produção**, representando um exemplo real de trabalho em Data Engineering.

---

**Desenvolvido por:** Guilherme Alves da Silva  
**Contato:** gads1208@gmail.com  
**GitHub:** @Gads1208  
**Data:** Dezembro 2025
