#!/usr/bin/env python
"""
Script para criar conexão GCP no Airflow
Executa automaticamente durante inicialização do container
"""

import os
from airflow import settings
from airflow.models import Connection
from sqlalchemy.orm import exc

def create_gcp_connection():
    """
    Cria ou atualiza a conexão gcp_default no Airflow
    """
    conn_id = "gcp_default"
    
    # Verificar se a conexão já existe
    session = settings.Session()
    try:
        existing_conn = session.query(Connection).filter(Connection.conn_id == conn_id).first()
        
        if existing_conn:
            print(f"Conexão {conn_id} já existe. Atualizando...")
            session.delete(existing_conn)
            session.commit()
        
        # Criar nova conexão
        new_conn = Connection(
            conn_id=conn_id,
            conn_type="google_cloud_platform",
            description="Google Cloud Platform connection for BigQuery",
            extra={
                "extra__google_cloud_platform__project": os.getenv("GCP_PROJECT_ID", "portifolio-482811"),
                "extra__google_cloud_platform__key_path": os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "/opt/airflow/gcp-key.json"),
                "extra__google_cloud_platform__scope": "https://www.googleapis.com/auth/cloud-platform",
            }
        )
        
        session.add(new_conn)
        session.commit()
        print(f"✓ Conexão {conn_id} criada com sucesso!")
        
    except Exception as e:
        print(f"✗ Erro ao criar conexão: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    create_gcp_connection()
