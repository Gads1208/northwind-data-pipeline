"""
Script para ingestão de dados do PostgreSQL para BigQuery.
Extrai dados das tabelas do Northwind e carrega na camada Bronze do BigQuery.
"""

import os
import logging
from datetime import datetime, date
from decimal import Decimal
from typing import List, Dict
import psycopg2
from psycopg2.extras import RealDictCursor
from google.cloud import bigquery
from google.oauth2 import service_account

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class PostgresToBigQueryLoader:
    """Classe para carregar dados do PostgreSQL para BigQuery"""
    
    def __init__(
        self,
        postgres_conn_id: str = None,
        bigquery_project_id: str = None,
        bigquery_dataset: str = "northwind_bronze",
        service_account_path: str = None
    ):
        """
        Inicializa o loader.
        
        Args:
            postgres_conn_id: Connection ID do Airflow (ou None para usar variáveis de ambiente)
            bigquery_project_id: ID do projeto BigQuery
            bigquery_dataset: Nome do dataset de destino
            service_account_path: Caminho para o arquivo de credenciais do GCP
        """
        self.postgres_config = {
            'host': os.getenv('POSTGRES_HOST', 'postgres'),
            'port': int(os.getenv('POSTGRES_PORT', 5432)),
            'database': os.getenv('POSTGRES_DB', 'northwind'),
            'user': os.getenv('POSTGRES_USER', 'postgres'),
            'password': os.getenv('POSTGRES_PASSWORD', 'postgres')
        }
        
        self.bigquery_project_id = bigquery_project_id or os.getenv('GCP_PROJECT_ID')
        self.bigquery_dataset = bigquery_dataset
        
        # Configurar cliente BigQuery
        if service_account_path and os.path.exists(service_account_path):
            credentials = service_account.Credentials.from_service_account_file(
                service_account_path,
                scopes=["https://www.googleapis.com/auth/bigquery"]
            )
            self.bq_client = bigquery.Client(
                credentials=credentials,
                project=self.bigquery_project_id
            )
        else:
            # Usa Application Default Credentials
            self.bq_client = bigquery.Client(project=self.bigquery_project_id)
        
        logger.info(f"Loader inicializado - Projeto: {self.bigquery_project_id}, Dataset: {self.bigquery_dataset}")
    
    def get_postgres_connection(self):
        """Cria conexão com PostgreSQL"""
        try:
            conn = psycopg2.connect(**self.postgres_config)
            logger.info("Conexão com PostgreSQL estabelecida")
            return conn
        except Exception as e:
            logger.error(f"Erro ao conectar no PostgreSQL: {e}")
            raise
    
    def get_table_schema(self, table_name: str) -> List[bigquery.SchemaField]:
        """
        Mapeia schema do PostgreSQL para BigQuery.
        
        Args:
            table_name: Nome da tabela
            
        Returns:
            Lista de campos para o schema do BigQuery
        """
        # Schema mapping básico para as tabelas do Northwind
        schemas = {
            'customers': [
                bigquery.SchemaField('customer_id', 'STRING', mode='REQUIRED'),
                bigquery.SchemaField('company_name', 'STRING'),
                bigquery.SchemaField('contact_name', 'STRING'),
                bigquery.SchemaField('contact_title', 'STRING'),
                bigquery.SchemaField('address', 'STRING'),
                bigquery.SchemaField('city', 'STRING'),
                bigquery.SchemaField('region', 'STRING'),
                bigquery.SchemaField('postal_code', 'STRING'),
                bigquery.SchemaField('country', 'STRING'),
                bigquery.SchemaField('phone', 'STRING'),
                bigquery.SchemaField('fax', 'STRING'),
                bigquery.SchemaField('_airbyte_extracted_at', 'TIMESTAMP'),
                bigquery.SchemaField('_airbyte_loaded_at', 'TIMESTAMP'),
            ],
            'orders': [
                bigquery.SchemaField('order_id', 'INTEGER', mode='REQUIRED'),
                bigquery.SchemaField('customer_id', 'STRING'),
                bigquery.SchemaField('employee_id', 'INTEGER'),
                bigquery.SchemaField('order_date', 'DATE'),
                bigquery.SchemaField('required_date', 'DATE'),
                bigquery.SchemaField('shipped_date', 'DATE'),
                bigquery.SchemaField('ship_via', 'INTEGER'),
                bigquery.SchemaField('freight', 'NUMERIC'),
                bigquery.SchemaField('ship_name', 'STRING'),
                bigquery.SchemaField('ship_address', 'STRING'),
                bigquery.SchemaField('ship_city', 'STRING'),
                bigquery.SchemaField('ship_region', 'STRING'),
                bigquery.SchemaField('ship_postal_code', 'STRING'),
                bigquery.SchemaField('ship_country', 'STRING'),
                bigquery.SchemaField('_airbyte_extracted_at', 'TIMESTAMP'),
                bigquery.SchemaField('_airbyte_loaded_at', 'TIMESTAMP'),
            ],
            'order_details': [
                bigquery.SchemaField('order_id', 'INTEGER', mode='REQUIRED'),
                bigquery.SchemaField('product_id', 'INTEGER', mode='REQUIRED'),
                bigquery.SchemaField('unit_price', 'NUMERIC'),
                bigquery.SchemaField('quantity', 'INTEGER'),
                bigquery.SchemaField('discount', 'FLOAT'),
                bigquery.SchemaField('_airbyte_extracted_at', 'TIMESTAMP'),
                bigquery.SchemaField('_airbyte_loaded_at', 'TIMESTAMP'),
            ],
            'products': [
                bigquery.SchemaField('product_id', 'INTEGER', mode='REQUIRED'),
                bigquery.SchemaField('product_name', 'STRING'),
                bigquery.SchemaField('supplier_id', 'INTEGER'),
                bigquery.SchemaField('category_id', 'INTEGER'),
                bigquery.SchemaField('quantity_per_unit', 'STRING'),
                bigquery.SchemaField('unit_price', 'NUMERIC'),
                bigquery.SchemaField('units_in_stock', 'INTEGER'),
                bigquery.SchemaField('units_on_order', 'INTEGER'),
                bigquery.SchemaField('reorder_level', 'INTEGER'),
                bigquery.SchemaField('discontinued', 'BOOLEAN'),
                bigquery.SchemaField('_airbyte_extracted_at', 'TIMESTAMP'),
                bigquery.SchemaField('_airbyte_loaded_at', 'TIMESTAMP'),
            ],
            'employees': [
                bigquery.SchemaField('employee_id', 'INTEGER', mode='REQUIRED'),
                bigquery.SchemaField('last_name', 'STRING'),
                bigquery.SchemaField('first_name', 'STRING'),
                bigquery.SchemaField('title', 'STRING'),
                bigquery.SchemaField('title_of_courtesy', 'STRING'),
                bigquery.SchemaField('birth_date', 'DATE'),
                bigquery.SchemaField('hire_date', 'DATE'),
                bigquery.SchemaField('address', 'STRING'),
                bigquery.SchemaField('city', 'STRING'),
                bigquery.SchemaField('region', 'STRING'),
                bigquery.SchemaField('postal_code', 'STRING'),
                bigquery.SchemaField('country', 'STRING'),
                bigquery.SchemaField('home_phone', 'STRING'),
                bigquery.SchemaField('extension', 'STRING'),
                bigquery.SchemaField('notes', 'STRING'),
                bigquery.SchemaField('reports_to', 'INTEGER'),
                bigquery.SchemaField('_airbyte_extracted_at', 'TIMESTAMP'),
                bigquery.SchemaField('_airbyte_loaded_at', 'TIMESTAMP'),
            ],
            'suppliers': [
                bigquery.SchemaField('supplier_id', 'INTEGER', mode='REQUIRED'),
                bigquery.SchemaField('company_name', 'STRING'),
                bigquery.SchemaField('contact_name', 'STRING'),
                bigquery.SchemaField('contact_title', 'STRING'),
                bigquery.SchemaField('address', 'STRING'),
                bigquery.SchemaField('city', 'STRING'),
                bigquery.SchemaField('region', 'STRING'),
                bigquery.SchemaField('postal_code', 'STRING'),
                bigquery.SchemaField('country', 'STRING'),
                bigquery.SchemaField('phone', 'STRING'),
                bigquery.SchemaField('fax', 'STRING'),
                bigquery.SchemaField('homepage', 'STRING'),
                bigquery.SchemaField('_airbyte_extracted_at', 'TIMESTAMP'),
                bigquery.SchemaField('_airbyte_loaded_at', 'TIMESTAMP'),
            ],
            'categories': [
                bigquery.SchemaField('category_id', 'INTEGER', mode='REQUIRED'),
                bigquery.SchemaField('category_name', 'STRING'),
                bigquery.SchemaField('description', 'STRING'),
                bigquery.SchemaField('_airbyte_extracted_at', 'TIMESTAMP'),
                bigquery.SchemaField('_airbyte_loaded_at', 'TIMESTAMP'),
            ],
            'shippers': [
                bigquery.SchemaField('shipper_id', 'INTEGER', mode='REQUIRED'),
                bigquery.SchemaField('company_name', 'STRING'),
                bigquery.SchemaField('phone', 'STRING'),
                bigquery.SchemaField('_airbyte_extracted_at', 'TIMESTAMP'),
                bigquery.SchemaField('_airbyte_loaded_at', 'TIMESTAMP'),
            ]
        }
        
        return schemas.get(table_name, [])
    
    def extract_table_data(self, table_name: str) -> List[Dict]:
        """
        Extrai dados de uma tabela do PostgreSQL.
        
        Args:
            table_name: Nome da tabela
            
        Returns:
            Lista de dicionários com os dados
        """
        conn = None
        try:
            conn = self.get_postgres_connection()
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            query = f"SELECT * FROM {table_name}"
            cursor.execute(query)
            
            rows = cursor.fetchall()
            logger.info(f"Extraídos {len(rows)} registros da tabela {table_name}")
            
            # Adicionar metadados de extração (compatível com Airbyte)
            current_time = datetime.utcnow()
            
            # Converter dados para formato JSON serializável
            result = []
            for row in rows:
                row_dict = dict(row)
                
                # Converter tipos Python para strings/números JSON-compatíveis
                for key, value in row_dict.items():
                    if isinstance(value, datetime):
                        row_dict[key] = value.isoformat()
                    elif isinstance(value, date):
                        row_dict[key] = value.isoformat()
                    elif isinstance(value, Decimal):
                        row_dict[key] = float(value)
                    elif value is None:
                        row_dict[key] = None
                
                # Adicionar metadados
                row_dict['_airbyte_extracted_at'] = current_time.isoformat()
                row_dict['_airbyte_loaded_at'] = current_time.isoformat()
                
                result.append(row_dict)
            
            return result
            
        except Exception as e:
            logger.error(f"Erro ao extrair dados da tabela {table_name}: {e}")
            raise
        finally:
            if conn:
                conn.close()
    
    def create_or_update_table(self, table_name: str, schema: List[bigquery.SchemaField]):
        """
        Cria ou atualiza tabela no BigQuery.
        
        Args:
            table_name: Nome da tabela
            schema: Schema da tabela
        """
        dataset_ref = self.bq_client.dataset(self.bigquery_dataset)
        table_ref = dataset_ref.table(f"bronze_{table_name}")
        
        try:
            # Tenta obter a tabela existente
            table = self.bq_client.get_table(table_ref)
            logger.info(f"Tabela {table_ref} já existe")
        except Exception:
            # Cria a tabela se não existir
            table = bigquery.Table(table_ref, schema=schema)
            table = self.bq_client.create_table(table)
            logger.info(f"Tabela {table_ref} criada")
    
    def load_data_to_bigquery(self, table_name: str, data: List[Dict]):
        """
        Carrega dados no BigQuery.
        
        Args:
            table_name: Nome da tabela
            data: Dados a serem carregados
        """
        if not data:
            logger.warning(f"Nenhum dado para carregar na tabela {table_name}")
            return
        
        dataset_ref = self.bq_client.dataset(self.bigquery_dataset)
        table_ref = dataset_ref.table(f"bronze_{table_name}")
        
        # Configuração do job de carga
        job_config = bigquery.LoadJobConfig(
            write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,  # Sobrescreve dados existentes
            source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
        )
        
        try:
            job = self.bq_client.load_table_from_json(
                data,
                table_ref,
                job_config=job_config
            )
            
            job.result()  # Aguarda conclusão
            
            logger.info(f"Carregados {len(data)} registros na tabela {table_ref}")
            
        except Exception as e:
            logger.error(f"Erro ao carregar dados no BigQuery: {e}")
            raise
    
    def sync_table(self, table_name: str) -> Dict:
        """
        Sincroniza uma tabela do PostgreSQL para BigQuery.
        
        Args:
            table_name: Nome da tabela
            
        Returns:
            Dicionário com estatísticas da sincronização
        """
        logger.info(f"Iniciando sincronização da tabela {table_name}")
        start_time = datetime.utcnow()
        
        try:
            # 1. Extrair schema
            schema = self.get_table_schema(table_name)
            if not schema:
                raise ValueError(f"Schema não definido para a tabela {table_name}")
            
            # 2. Criar ou atualizar tabela no BigQuery
            self.create_or_update_table(table_name, schema)
            
            # 3. Extrair dados do PostgreSQL
            data = self.extract_table_data(table_name)
            
            # 4. Carregar dados no BigQuery
            self.load_data_to_bigquery(table_name, data)
            
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()
            
            stats = {
                'table_name': table_name,
                'records_synced': len(data),
                'start_time': start_time.isoformat(),
                'end_time': end_time.isoformat(),
                'duration_seconds': duration,
                'status': 'success'
            }
            
            logger.info(f"Sincronização concluída: {table_name} - {len(data)} registros em {duration:.2f}s")
            return stats
            
        except Exception as e:
            logger.error(f"Erro na sincronização da tabela {table_name}: {e}")
            return {
                'table_name': table_name,
                'records_synced': 0,
                'status': 'failed',
                'error': str(e)
            }
    
    def sync_all_tables(self, tables: List[str] = None) -> Dict:
        """
        Sincroniza todas as tabelas do Northwind.
        
        Args:
            tables: Lista de tabelas (ou None para sincronizar todas)
            
        Returns:
            Dicionário com estatísticas da sincronização
        """
        if tables is None:
            tables = [
                'customers',
                'orders',
                'order_details',
                'products',
                'employees',
                'suppliers',
                'categories',
                'shippers'
            ]
        
        logger.info(f"Iniciando sincronização de {len(tables)} tabelas")
        results = []
        
        for table in tables:
            result = self.sync_table(table)
            results.append(result)
        
        # Resumo
        total_records = sum(r.get('records_synced', 0) for r in results)
        successful = sum(1 for r in results if r['status'] == 'success')
        failed = len(results) - successful
        
        summary = {
            'total_tables': len(tables),
            'successful': successful,
            'failed': failed,
            'total_records': total_records,
            'results': results
        }
        
        logger.info(f"Sincronização finalizada - {successful}/{len(tables)} tabelas, {total_records} registros")
        return summary


def main():
    """Função principal para execução standalone"""
    import sys
    
    # Configuração via variáveis de ambiente
    project_id = os.getenv('GCP_PROJECT_ID')
    dataset = os.getenv('BIGQUERY_DATASET', 'northwind_bronze')
    service_account = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    
    if not project_id:
        logger.error("Variável de ambiente GCP_PROJECT_ID não configurada")
        sys.exit(1)
    
    # Criar loader
    loader = PostgresToBigQueryLoader(
        bigquery_project_id=project_id,
        bigquery_dataset=dataset,
        service_account_path=service_account
    )
    
    # Sincronizar todas as tabelas
    results = loader.sync_all_tables()
    
    # Exibir resultados
    print("\n" + "="*50)
    print("RESUMO DA SINCRONIZAÇÃO")
    print("="*50)
    print(f"Total de tabelas: {results['total_tables']}")
    print(f"Sucesso: {results['successful']}")
    print(f"Falhas: {results['failed']}")
    print(f"Total de registros: {results['total_records']}")
    print("="*50)
    
    # Retornar código de saída
    sys.exit(0 if results['failed'] == 0 else 1)


if __name__ == "__main__":
    main()
