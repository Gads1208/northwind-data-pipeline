#!/usr/bin/env python3
"""
Script para criar datasets no BigQuery
"""

import os
from google.cloud import bigquery
from google.oauth2 import service_account

# Configurações
PROJECT_ID = "portifolio-482811"
KEY_PATH = "/opt/airflow/gcp-key.json"  # Caminho dentro do container
LOCATION = "US"

# Datasets a criar
DATASETS = [
    ("northwind_bronze", "Camada Bronze - Dados brutos do PostgreSQL"),
    ("northwind_silver", "Camada Silver - Dados limpos e enriquecidos"),
    ("northwind_gold", "Camada Gold - Agregações de negócio")
]

def create_datasets():
    """Cria os datasets necessários no BigQuery"""
    
    # Autenticar
    credentials = service_account.Credentials.from_service_account_file(
        KEY_PATH,
        scopes=["https://www.googleapis.com/auth/bigquery"]
    )
    
    client = bigquery.Client(
        credentials=credentials,
        project=PROJECT_ID
    )
    
    print(f"🔵 Criando datasets no projeto: {PROJECT_ID}")
    print(f"📍 Localização: {LOCATION}\n")
    
    for dataset_id, description in DATASETS:
        dataset_full = f"{PROJECT_ID}.{dataset_id}"
        
        try:
            # Tentar obter dataset existente
            client.get_dataset(dataset_full)
            print(f"✅ Dataset {dataset_id} já existe")
        except Exception:
            # Criar novo dataset
            dataset = bigquery.Dataset(dataset_full)
            dataset.location = LOCATION
            dataset.description = description
            
            dataset = client.create_dataset(dataset, timeout=30)
            print(f"✨ Dataset {dataset_id} criado com sucesso!")
    
    print(f"\n🎉 Todos os datasets estão prontos!")
    
    # Listar datasets
    print(f"\n📊 Datasets no projeto {PROJECT_ID}:")
    datasets = list(client.list_datasets())
    if datasets:
        for dataset in datasets:
            print(f"  - {dataset.dataset_id}")
    else:
        print("  (nenhum dataset encontrado)")

if __name__ == "__main__":
    create_datasets()
