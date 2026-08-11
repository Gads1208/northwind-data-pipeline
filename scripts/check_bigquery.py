#!/usr/bin/env python3
"""
Script para verificar e diagnosticar problemas com BigQuery
"""

import os
from google.cloud import bigquery
from google.oauth2 import service_account
from google.api_core import exceptions

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "portifolio-482811")
KEY_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "gcp-key.json")
if not os.path.exists(KEY_PATH) and os.path.exists("/opt/airflow/gcp-key.json"):
    KEY_PATH = "/opt/airflow/gcp-key.json"

def check_bigquery_setup():
    """Verifica configuração do BigQuery"""
    
    print("🔍 DIAGNÓSTICO DO BIGQUERY")
    print("=" * 60)
    
    try:
        # Autenticar
        credentials = service_account.Credentials.from_service_account_file(
            KEY_PATH,
            scopes=["https://www.googleapis.com/auth/bigquery"]
        )
        
        client = bigquery.Client(
            credentials=credentials,
            project=PROJECT_ID
        )
        
        print(f"✅ Autenticação OK")
        print(f"📁 Projeto: {PROJECT_ID}")
        print()
        
        # Listar datasets existentes
        print("📊 DATASETS EXISTENTES:")
        print("-" * 60)
        datasets = list(client.list_datasets())
        
        if datasets:
            for dataset in datasets:
                print(f"  ✓ {dataset.dataset_id}")
                
                # Verificar se é um dos nossos datasets esperados
                if dataset.dataset_id in ['northwind_bronze', 'northwind_silver', 'northwind_gold']:
                    try:
                        # Tentar obter detalhes do dataset
                        ds = client.get_dataset(f"{PROJECT_ID}.{dataset.dataset_id}")
                        print(f"    Location: {ds.location}")
                        print(f"    Created: {ds.created}")
                        
                        # Tentar listar tabelas
                        tables = list(client.list_tables(ds))
                        print(f"    Tables: {len(tables)}")
                        
                    except exceptions.Forbidden as e:
                        print(f"    ⚠️  Sem permissão para ver detalhes")
                    except Exception as e:
                        print(f"    ⚠️  Erro: {str(e)[:50]}")
        else:
            print("  ❌ Nenhum dataset encontrado")
        
        print()
        
        # Verificar datasets esperados
        print("🎯 DATASETS NECESSÁRIOS:")
        print("-" * 60)
        
        required_datasets = ['northwind_bronze', 'northwind_silver', 'northwind_gold']
        
        for ds_name in required_datasets:
            ds_full = f"{PROJECT_ID}.{ds_name}"
            try:
                ds = client.get_dataset(ds_full)
                print(f"  ✅ {ds_name} existe")
                
                # Tentar criar uma tabela de teste para verificar permissões
                test_table_id = f"{ds_full}._test_permissions"
                try:
                    # Tentar listar tabelas (precisa de permissão)
                    tables = list(client.list_tables(ds))
                    print(f"      ✓ Permissão de leitura OK ({len(tables)} tabelas)")
                    
                    # Verificar se podemos criar tabela
                    print(f"      ⚠️  Permissão de escrita: PRECISA TESTAR")
                    
                except exceptions.Forbidden:
                    print(f"      ❌ Sem permissão de leitura")
                    
            except exceptions.NotFound:
                print(f"  ❌ {ds_name} NÃO EXISTE - PRECISA CRIAR")
            except exceptions.Forbidden:
                print(f"  ⚠️  {ds_name} pode existir mas sem permissão de leitura")
            except Exception as e:
                print(f"  ❌ Erro ao verificar {ds_name}: {str(e)[:50]}")
        
        print()
        print("=" * 60)
        
        # Instruções
        print("\n📝 AÇÕES NECESSÁRIAS:\n")
        
        if not datasets or not any(d.dataset_id.startswith('northwind') for d in datasets):
            print("1️⃣  CRIAR DATASETS:")
            print("   Acesse: https://console.cloud.google.com/bigquery?project=portifolio-482811")
            print()
            print("   Crie 3 datasets com CREATE DATASET:")
            print("   • northwind_bronze (Location: US)")
            print("   • northwind_silver (Location: US)")
            print("   • northwind_gold (Location: US)")
            print()
        
        print("2️⃣  CONCEDER PERMISSÕES à Service Account:")
        print("   Acesse: https://console.cloud.google.com/iam-admin/iam?project=portifolio-482811")
        print()
        print("   Opção A - Mais Simples (Recomendado):")
        print("   • Adicione o papel: BigQuery Data Editor")
        print("   • Ou: BigQuery Admin (permissão total)")
        print()
        print("   Opção B - Permissões Específicas por Dataset:")
        print("   Para cada dataset (northwind_bronze, silver, gold):")
        print("   • Vá em BigQuery > Dataset > SHARING > PERMISSIONS")
        print("   • ADD PRINCIPAL")
        print("   • Cole o email da Service Account")
        print("   • Selecione: BigQuery Data Editor")
        print()
        
    except FileNotFoundError:
        print(f"❌ Arquivo de credenciais não encontrado: {KEY_PATH}")
    except Exception as e:
        print(f"❌ Erro: {type(e).__name__}: {str(e)}")

if __name__ == "__main__":
    check_bigquery_setup()
