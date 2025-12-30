"""
DAG para backup e manutenção do data warehouse
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.bash import BashOperator

default_args = {
    'owner': 'data-team',
    'depends_on_past': False,
    'email': ['data-team@example.com'],
    'email_on_failure': True,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    'northwind_maintenance',
    default_args=default_args,
    description='Tarefas de manutenção do data warehouse Northwind',
    schedule_interval='0 3 * * 0',  # Todo domingo às 3h
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['northwind', 'maintenance'],
) as dag:

    # Task 1: Executar snapshot das tabelas importantes
    create_snapshots = BashOperator(
        task_id='create_table_snapshots',
        bash_command='cd /opt/airflow/dbt/northwind_dw && dbt snapshot --profiles-dir /opt/airflow/dbt',
    )

    # Task 2: Limpar tabelas temporárias antigas
    cleanup_temp_tables = BashOperator(
        task_id='cleanup_temp_tables',
        bash_command='echo "Cleaning up temporary tables..."',
        # TODO: Implementar limpeza de tabelas temporárias
    )

    # Task 3: Atualizar estatísticas do BigQuery
    update_statistics = BashOperator(
        task_id='update_bigquery_statistics',
        bash_command='echo "Updating BigQuery statistics..."',
        # TODO: Implementar atualização de estatísticas
    )

    create_snapshots >> cleanup_temp_tables >> update_statistics
