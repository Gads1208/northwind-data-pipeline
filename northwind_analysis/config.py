"""
Configurações do projeto de análise Northwind
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Diretórios do projeto
BASE_DIR = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / 'output'
GRAFICOS_DIR = OUTPUT_DIR / 'graficos'
RELATORIOS_DIR = OUTPUT_DIR / 'relatorios'

# Criar diretórios se não existirem
GRAFICOS_DIR.mkdir(parents=True, exist_ok=True)
RELATORIOS_DIR.mkdir(parents=True, exist_ok=True)

# Configurações do banco de dados
DB_CONFIG = {
    'host': os.getenv('POSTGRES_HOST', 'localhost'),
    'port': os.getenv('POSTGRES_PORT', '5432'),
    'database': os.getenv('POSTGRES_DB', 'northwind'),
    'user': os.getenv('POSTGRES_USER', 'postgres'),
    'password': os.getenv('POSTGRES_PASSWORD', 'postgres'),
}

# String de conexão SQLAlchemy
DATABASE_URL = f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"

# Configurações de visualização
PLOT_CONFIG = {
    'style': 'seaborn-v0_8-darkgrid',
    'figsize': (12, 6),
    'dpi': 300,
    'color_palette': 'Set2',
}

# Configurações de análise
ANALYSIS_CONFIG = {
    'top_n_products': 10,
    'top_n_customers': 10,
    'top_n_employees': 10,
    'rfm_quantiles': 4,
}