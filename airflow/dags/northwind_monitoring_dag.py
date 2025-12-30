"""
DAG para monitoramento e alertas do pipeline Northwind
Monitora métricas chave e envia alertas em caso de anomalias
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.google.cloud.operators.bigquery import BigQueryCheckOperator

default_args = {
    'owner': 'data-team',
    'depends_on_past': False,
    'email': ['data-team@example.com'],
    'email_on_failure': True,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

def check_data_freshness():
    """Verifica se os dados foram atualizados recentemente"""
    import logging
    logging.info("Checking data freshness...")
    # TODO: Implementar verificação de freshness
    return True

def check_data_quality_metrics():
    """Verifica métricas de qualidade dos dados"""
    import logging
    logging.info("Checking data quality metrics...")
    # TODO: Implementar verificações customizadas
    return True

with DAG(
    'northwind_monitoring',
    default_args=default_args,
    description='Monitoramento e alertas do pipeline Northwind',
    schedule_interval='0 */4 * * *',  # A cada 4 horas
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['northwind', 'monitoring'],
) as dag:

    # Check 1: Verificar freshness dos dados
    check_freshness = PythonOperator(
        task_id='check_data_freshness',
        python_callable=check_data_freshness,
    )

    # Check 2: Verificar se há pedidos no último dia
    check_orders_volume = BigQueryCheckOperator(
        task_id='check_orders_volume',
        sql="""
        SELECT COUNT(*) > 0
        FROM `{{ var.value.gcp_project }}.northwind_gold.gold_sales_by_country`
        WHERE updated_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
        """,
        use_legacy_sql=False,
    )

    # Check 3: Verificar qualidade geral dos dados
    check_quality = PythonOperator(
        task_id='check_data_quality',
        python_callable=check_data_quality_metrics,
    )

    check_freshness >> check_orders_volume >> check_quality
