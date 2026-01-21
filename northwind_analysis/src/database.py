"""
Módulo para gerenciamento de conexão com banco de dados
"""
import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from typing import Optional
import logging
from config import DATABASE_URL

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseConnection:
    """Classe para gerenciar conexão com PostgreSQL"""
    
    def __init__(self, connection_string: str = DATABASE_URL):
        """
        Inicializa conexão com banco de dados
        
        Args:
            connection_string: String de conexão SQLAlchemy
        """
        self.connection_string = connection_string
        self._engine: Optional[Engine] = None
    
    @property
    def engine(self) -> Engine:
        """Retorna engine SQLAlchemy (cria se necessário)"""
        if self._engine is None:
            self._engine = create_engine(self.connection_string)
            logger.info("Conexão com banco de dados estabelecida")
        return self._engine
    
    def query(self, sql: str) -> pd.DataFrame:
        """
        Executa query SQL e retorna DataFrame
        
        Args:
            sql: Query SQL a ser executada
            
        Returns:
            DataFrame com resultados
        """
        try:
            with self.engine.connect() as conn:
                df = pd.read_sql(text(sql), conn)
            logger.info(f"Query executada com sucesso. Linhas retornadas: {len(df)}")
            return df
        except Exception as e:
            logger.error(f"Erro ao executar query: {e}")
            raise
    
    def test_connection(self) -> bool:
        """Testa conexão com banco de dados"""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                result.fetchone()
            logger.info("Teste de conexão bem-sucedido")
            return True
        except Exception as e:
            logger.error(f"Falha no teste de conexão: {e}")
            return False
    
    def close(self):
        """Fecha conexão com banco de dados"""
        if self._engine is not None:
            self._engine.dispose()
            logger.info("Conexão com banco de dados encerrada")