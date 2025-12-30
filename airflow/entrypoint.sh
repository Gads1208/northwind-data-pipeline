#!/bin/bash
set -e

echo "🔧 Instalando git (necessário para dbt)..."
apt-get update -qq && apt-get install -y -qq git > /dev/null 2>&1 && echo "✅ Git instalado"

echo "🔧 Instalando dependências Python..."
pip install --no-cache-dir -r /requirements.txt

echo "🔧 Inicializando banco de dados do Airflow..."
airflow db migrate

echo "🔧 Criando usuário admin do Airflow..."
airflow users create \
    --username airflow \
    --firstname Air \
    --lastname Flow \
    --role Admin \
    --email admin@example.com \
    --password airflow 2>/dev/null || echo "Usuário já existe"

echo "🔧 Criando conexão GCP no Airflow..."
python /opt/airflow/scripts/create_gcp_connection.py || echo "Aviso: Falha ao criar conexão GCP"

echo "✅ Inicialização completa!"

# Executar comando passado (webserver ou scheduler)
exec "$@"
