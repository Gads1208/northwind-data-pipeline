#!/bin/bash

# Script de inicialização rápida do projeto Northwind Data Pipeline
# Este script automatiza a configuração inicial do projeto

set -e  # Sair em caso de erro

echo "🚀 Iniciando configuração do Northwind Data Pipeline..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar pré-requisitos
echo "📋 Verificando pré-requisitos..."

if ! command_exists docker; then
    echo -e "${RED}❌ Docker não encontrado. Por favor, instale o Docker.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Docker encontrado${NC}"
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose não encontrado. Por favor, instale o Docker Compose.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Docker Compose encontrado${NC}"
fi

if ! command_exists git; then
    echo -e "${YELLOW}⚠️  Git não encontrado (opcional, mas recomendado)${NC}"
else
    echo -e "${GREEN}✅ Git encontrado${NC}"
fi

echo ""

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo -e "${GREEN}✅ Arquivo .env criado${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edite o arquivo .env com suas configurações do GCP${NC}"
    echo ""
    read -p "Deseja editar o arquivo .env agora? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ${EDITOR:-nano} .env
    fi
else
    echo -e "${GREEN}✅ Arquivo .env já existe${NC}"
fi

echo ""

# Verificar se GCP está configurado
echo "🔧 Verificando configuração do Google Cloud..."
if [ ! -f "gcp-key.json" ]; then
    echo -e "${YELLOW}⚠️  Service Account Key do GCP não encontrada${NC}"
    echo "Por favor, coloque seu arquivo de credenciais do GCP como 'gcp-key.json'"
    echo ""
    read -p "Pressione Enter quando estiver pronto para continuar..."
fi

echo ""

# Iniciar containers
echo "🐳 Iniciando containers Docker..."
docker-compose up -d

echo ""
echo "⏳ Aguardando serviços iniciarem (isso pode levar alguns minutos)..."
sleep 30

# Verificar status dos containers
echo ""
echo "📊 Status dos serviços:"
docker-compose ps

echo ""

# Aguardar Postgres estar pronto
echo "⏳ Aguardando PostgreSQL inicializar..."
until docker exec northwind-postgres pg_isready -U northwind > /dev/null 2>&1; do
    sleep 2
done
echo -e "${GREEN}✅ PostgreSQL pronto${NC}"

# Verificar dados no Postgres
echo ""
echo "🔍 Verificando dados no PostgreSQL..."
CUSTOMER_COUNT=$(docker exec northwind-postgres psql -U northwind -d northwind -t -c "SELECT COUNT(*) FROM customers;" 2>/dev/null | xargs)
echo "   Clientes encontrados: ${CUSTOMER_COUNT:-0}"

if [ "${CUSTOMER_COUNT:-0}" -gt 0 ] 2>/dev/null; then
    echo -e "${GREEN}✅ Dados carregados com sucesso no PostgreSQL${NC}"
else
    echo -e "${RED}❌ Nenhum dado encontrado no PostgreSQL${NC}"
fi

echo ""
echo "="
echo "🎉 Configuração inicial concluída!"
echo "="
echo ""
echo "📍 URLs dos serviços:"
echo "   • Airflow:    http://localhost:8080 (airflow/airflow)"
echo "   • Airbyte:    http://localhost:8000"
echo "   • PostgreSQL: localhost:5432 (postgres/postgres)"
echo ""
echo "📝 Próximos passos:"
echo ""
echo "1️⃣  Configure o Airbyte:"
echo "   - Acesse http://localhost:8000"
echo "   - Crie uma Source (PostgreSQL)"
echo "   - Crie uma Destination (BigQuery)"
echo "   - Crie uma Connection entre eles"
echo ""
echo "2️⃣  Configure o BigQuery no GCP:"
echo "   - Crie os datasets: northwind_bronze, northwind_silver, northwind_gold"
echo "   - Verifique as permissões da Service Account"
echo ""
echo "3️⃣  Execute a primeira sincronização do Airbyte"
echo ""
echo "4️⃣  Execute as transformações dbt:"
echo "   make dbt-run"
echo ""
echo "5️⃣  Ative os DAGs no Airflow:"
echo "   - Acesse http://localhost:8080"
echo "   - Ative o DAG 'northwind_data_pipeline'"
echo ""
echo "💡 Comandos úteis:"
echo "   make help        - Ver todos os comandos disponíveis"
echo "   make logs        - Ver logs de todos os serviços"
echo "   make dbt-run     - Executar transformações dbt"
echo "   make ps          - Ver status dos containers"
echo ""
echo "📖 Para mais detalhes, consulte: docs/SETUP.md"
echo ""
