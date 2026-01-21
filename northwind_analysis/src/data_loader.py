"""
Módulo para carregar dados do Northwind
"""
import pandas as pd
from typing import Dict
import logging
from database import DatabaseConnection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NorthwindDataLoader:
    """Carrega dados do banco Northwind"""
    
    def __init__(self, db: DatabaseConnection):
        self.db = db
        self.data: Dict[str, pd.DataFrame] = {}
    
    def load_all(self) -> Dict[str, pd.DataFrame]:
        logger.info("Iniciando carregamento de dados...")
        
        self.data['customers'] = self.load_customers()
        self.data['orders'] = self.load_orders()
        self.data['order_details'] = self.load_order_details()
        self.data['products'] = self.load_products()
        self.data['categories'] = self.load_categories()
        self.data['employees'] = self.load_employees()
        self.data['shippers'] = self.load_shippers()
        
        logger.info(f"Carregamento concluído. {len(self.data)} tabelas carregadas.")
        return self.data
    
    def load_customers(self) -> pd.DataFrame:
        query = """
        SELECT customer_id, company_name, contact_name, contact_title,
               city, region, country, phone
        FROM customers
        """
        df = self.db.query(query)
        logger.info(f"Clientes carregados: {len(df)}")
        return df
    
    def load_orders(self) -> pd.DataFrame:
        query = """
        SELECT order_id, customer_id, employee_id, order_date, required_date,
               shipped_date, ship_via, freight, ship_name, ship_city, ship_country
        FROM orders
        """
        df = self.db.query(query)
        date_cols = ['order_date', 'required_date', 'shipped_date']
        for col in date_cols:
            df[col] = pd.to_datetime(df[col])
        logger.info(f"Pedidos carregados: {len(df)}")
        return df
    
    def load_order_details(self) -> pd.DataFrame:
        query = """
        SELECT order_id, product_id, unit_price, quantity, discount
        FROM order_details
        """
        df = self.db.query(query)
        df['total_price'] = df['unit_price'] * df['quantity'] * (1 - df['discount'])
        logger.info(f"Detalhes de pedidos carregados: {len(df)}")
        return df
    
    def load_products(self) -> pd.DataFrame:
        query = """
        SELECT product_id, product_name, supplier_id, category_id,
               quantity_per_unit, unit_price, units_in_stock,
               units_on_order, reorder_level, discontinued
        FROM products
        """
        df = self.db.query(query)
        logger.info(f"Produtos carregados: {len(df)}")
        return df
    
    def load_categories(self) -> pd.DataFrame:
        query = "SELECT category_id, category_name, description FROM categories"
        df = self.db.query(query)
        logger.info(f"Categorias carregadas: {len(df)}")
        return df
    
    def load_employees(self) -> pd.DataFrame:
        query = """
        SELECT employee_id, first_name, last_name, title,
               birth_date, hire_date, city, country
        FROM employees
        """
        df = self.db.query(query)
        df['full_name'] = df['first_name'] + ' ' + df['last_name']
        logger.info(f"Funcionários carregados: {len(df)}")
        return df
    
    def load_shippers(self) -> pd.DataFrame:
        query = "SELECT shipper_id, company_name, phone FROM shippers"
        df = self.db.query(query)
        logger.info(f"Transportadoras carregadas: {len(df)}")
        return df
    
    def create_sales_view(self) -> pd.DataFrame:
        sales = self.data['order_details'].merge(
            self.data['orders'], on='order_id', how='left'
        ).merge(
            self.data['products'], on='product_id', how='left'
        ).merge(
            self.data['categories'], on='category_id', how='left'
        ).merge(
            self.data['employees'], on='employee_id', how='left'
        ).merge(
            self.data['customers'], on='customer_id', how='left'
        )
        
        logger.info(f"Visão de vendas criada: {len(sales)} registros")
        return sales
