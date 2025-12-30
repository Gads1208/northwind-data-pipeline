"""
DAG para o Pipeline de Dados Northwind
Extrai dados do PostgreSQL e carrega no BigQuery usando arquitetura Medallion
"""

import os
import pendulum
from airflow.models.dag import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.utils.task_group import TaskGroup
import sys

# Adicionar o diretório de scripts ao path
sys.path.insert(0, '/opt/airflow/scripts')

# --- Configurações de Ambiente ---
def get_env(key: str, default: str = None):
    """Obtém variável de ambiente de forma segura"""
    try:
        return os.getenv(key, default)
    except Exception as e:
        print(f"Error getting env var {key}: {e}")
        return default

# Configurações do dbt
DBT_PROJECT_PATH = get_env("DBT_PROJECT_PATH", "/opt/airflow/dbt/northwind_dw")
DBT_EXECUTABLE = get_env("DBT_EXECUTABLE", "dbt")
GCP_PROJECT_ID = get_env("GCP_PROJECT_ID", "portifolio-482811")
GCP_CREDENTIALS = get_env("GOOGLE_APPLICATION_CREDENTIALS", "/opt/airflow/gcp-key.json")

# Modelos por camada (Bronze é criado pelo script Python, não pelo dbt)
SILVER_MODELS = [
    "silver_dim_customers", "silver_dim_employees", "silver_dim_products", "silver_fact_orders"
]

GOLD_MODELS = [
    "gold_customer_revenue", "gold_employee_performance", "gold_product_performance", 
    "gold_revenue_by_category", "gold_revenue_by_supplier"
]

with DAG(
    dag_id="northwind_data_pipeline",
    start_date=pendulum.datetime(2024, 1, 1, tz="UTC"),
    schedule="0 2 * * *",  # Diariamente às 2h
    catchup=False,
    tags=["northwind", "etl", "bigquery", "medallion"],
    default_args={
        "owner": "data-engineer",
        "retries": 2,
        "retry_delay": pendulum.duration(minutes=5),
    },
    description="Pipeline completo Northwind: PostgreSQL -> BigQuery (Bronze -> Silver -> Gold)",
    max_active_runs=1,
) as dag:

    # ========================================
    # TASK 1: INGESTÃO POSTGRES -> BRONZE
    # ========================================
    
    def sync_postgres_to_bigquery():
        """Sincroniza todas as tabelas do PostgreSQL para o BigQuery Bronze Layer"""
        from postgres_to_bigquery import PostgresToBigQueryLoader
        loader = PostgresToBigQueryLoader()
        loader.sync_all_tables()

    ingest_bronze = PythonOperator(
        task_id="ingest_postgres_to_bronze",
        python_callable=sync_postgres_to_bigquery,
    )

    # ========================================
    # TASK 2: CRIAR PROFILES.YML
    # ========================================
    
    create_profile = BashOperator(
        task_id="create_dbt_profile",
        bash_command=f"""
        echo "================================================"
        echo "📝 CRIANDO PROFILES.YML PARA BIGQUERY"
        echo "================================================"
        
        cat > /opt/airflow/dbt/profiles.yml << 'PROFILES_EOF'
northwind_dw:
  target: dev
  outputs:
    dev:
      type: bigquery
      method: service-account
      project: {GCP_PROJECT_ID}
      dataset: northwind_bronze
      threads: 4
      timeout_seconds: 300
      location: US
      priority: interactive
      keyfile: {GCP_CREDENTIALS}
PROFILES_EOF
        
        echo "✅ profiles.yml criado com sucesso!"
        cat /opt/airflow/dbt/profiles.yml
        echo "================================================"
        """,
    )

    # ========================================
    # TASK 3: INSTALAR DEPENDÊNCIAS DBT
    # ========================================
    
    install_deps = BashOperator(
        task_id="install_dbt_deps",
        bash_command=f"""
        echo "================================================"
        echo "📦 INSTALANDO DEPENDÊNCIAS DBT"
        echo "================================================"
        
        cd {DBT_PROJECT_PATH}
        {DBT_EXECUTABLE} deps --profiles-dir /opt/airflow/dbt
        
        echo "✅ Dependências instaladas!"
        echo "================================================"
        """,
    )

    # ========================================
    # TASK 4: DBT DEBUG
    # ========================================
    
    dbt_debug = BashOperator(
        task_id="dbt_debug",
        bash_command=f"""
        echo "================================================"
        echo "🔍 DBT DEBUG"
        echo "================================================"
        
        cd {DBT_PROJECT_PATH}
        {DBT_EXECUTABLE} debug --profiles-dir /opt/airflow/dbt
        
        echo "================================================"
        """,
    )

    # ========================================
    # FUNÇÃO PARA CRIAR TASK DE MODELO
    # ========================================
    
    def create_model_task(model_name: str, layer: str) -> BashOperator:
        """Cria uma task para executar um modelo específico do DBT"""
        return BashOperator(
            task_id=f"build_{model_name}",
            trigger_rule='all_done',
            bash_command=f"""
            echo "================================================"
            echo "🔨 CONSTRUINDO: {model_name}"
            echo "================================================"
            START_TIME=$(date +%s)
            
            cd {DBT_PROJECT_PATH}
            
            {DBT_EXECUTABLE} build \\
                --select {model_name} \\
                --profiles-dir /opt/airflow/dbt \\
                2>&1 | tee /tmp/dbt_{model_name}.log
            
            DBT_EXIT_CODE=${{PIPESTATUS[0]}}
            END_TIME=$(date +%s)
            DURATION=$((END_TIME - START_TIME))
            
            echo "================================================"
            if [ $DBT_EXIT_CODE -eq 0 ]; then
                echo "✅ {model_name} - SUCESSO em ${{DURATION}}s"
            else
                echo "❌ {model_name} - ERRO em ${{DURATION}}s"
            fi
            echo "================================================"
            
            exit $DBT_EXIT_CODE
            """,
            execution_timeout=pendulum.duration(minutes=10),
        )

    # ========================================
    # CAMADA SILVER - TaskGroup
    # ========================================
    
    with TaskGroup(group_id="silver_layer", tooltip="Camada Silver - Modelos Individuais") as silver_group:
        silver_tasks = [create_model_task(model, "silver") for model in SILVER_MODELS]

    # ========================================
    # CAMADA GOLD - TaskGroup
    # ========================================
    
    with TaskGroup(group_id="gold_layer", tooltip="Camada Gold - Modelos Individuais") as gold_group:
        gold_tasks = [create_model_task(model, "gold") for model in GOLD_MODELS]

    # ========================================
    # TASK DE RESUMO
    # ========================================
    
    summary = BashOperator(
        task_id="execution_summary",
        trigger_rule='all_done',
        bash_command=f"""
        echo "================================================"
        echo "📊 RESUMO DA EXECUÇÃO"
        echo "================================================"
        
        SUCCESS_COUNT=0
        ERROR_COUNT=0
        
        for log_file in /tmp/dbt_*.log; do
            if [ -f "$log_file" ]; then
                model_name=$(basename "$log_file" .log | sed 's/dbt_//')
                if grep -q "Completed successfully" "$log_file" || grep -q "OK created" "$log_file"; then
                    echo "  ✅ $model_name"
                    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
                elif grep -q "ERROR" "$log_file" || grep -q "FAIL" "$log_file"; then
                    echo "  ❌ $model_name"
                    ERROR_COUNT=$((ERROR_COUNT + 1))
                fi
            fi
        done
        
        echo ""
        echo "================================================"
        echo "📈 ESTATÍSTICAS FINAIS"
        echo "================================================"
        echo "✅ Sucessos: $SUCCESS_COUNT"
        echo "❌ Erros: $ERROR_COUNT"
        echo "📊 Total: $((SUCCESS_COUNT + ERROR_COUNT))"
        echo "================================================"
        
        exit 0
        """,
    )

    # ========================================
    # TESTES DE QUALIDADE
    # ========================================
    
    run_tests = BashOperator(
        task_id="run_all_tests",
        trigger_rule='all_done',
        bash_command=f"""
        echo "================================================"
        echo "🧪 EXECUTANDO TESTES DBT"
        echo "================================================"
        
        cd {DBT_PROJECT_PATH}
        {DBT_EXECUTABLE} test --profiles-dir /opt/airflow/dbt
        
        echo "✅ Testes concluídos!"
        echo "================================================"
        """,
    )

    # ========================================
    # FLUXO DA DAG
    # ========================================
    
    ingest_bronze >> create_profile >> install_deps >> dbt_debug
    dbt_debug >> silver_group >> gold_group >> summary >> run_tests
