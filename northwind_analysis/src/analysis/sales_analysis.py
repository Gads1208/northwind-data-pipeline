"""
Análise de vendas
"""
import pandas as pd
import numpy as np
from typing import Dict, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SalesAnalysis:
    """Análise de vendas"""
    
    def __init__(self, sales_df: pd.DataFrame):
        """
        Inicializa análise
        
        Args:
            sales_df: DataFrame com dados de vendas consolidados
        """
        self.sales_df = sales_df
    
    def overall_metrics(self) -> Dict:
        """
        Calcula métricas gerais de vendas
        
        Returns:
            Dicionário com métricas principais
        """
        logger.info("Calculando métricas gerais...")
        
        metrics = {
            'total_revenue': self.sales_df['total_price'].sum(),
            'total_orders': self.sales_df['order_id'].nunique(),
            'total_items_sold': self.sales_df['quantity'].sum(),
            'unique_products': self.sales_df['product_id'].nunique(),
            'unique_customers': self.sales_df['customer_id'].nunique(),
            'avg_order_value': self.sales_df.groupby('order_id')['total_price'].sum().mean(),
            'avg_items_per_order': self.sales_df.groupby('order_id')['quantity'].sum().mean(),
            'avg_discount': self.sales_df['discount'].mean(),
            'total_freight': self.sales_df.groupby('order_id')['freight'].first().sum(),
            'date_range': {
                'start': self.sales_df['order_date'].min(),
                'end': self.sales_df['order_date'].max(),
                'days': (self.sales_df['order_date'].max() - self.sales_df['order_date'].min()).days
            }
        }
        
        logger.info("Métricas gerais calculadas")
        return metrics
    
    def product_performance(self, top_n: int = 10) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Análise de performance de produtos
        
        Args:
            top_n: Número de produtos top a retornar
            
        Returns:
            Tupla com (top por receita, top por quantidade)
        """
        logger.info(f"Analisando performance de produtos (top {top_n})...")
        
        # Usar unit_price_x que vem de order_details
        price_col = 'unit_price_x' if 'unit_price_x' in self.sales_df.columns else 'unit_price'
        
        product_metrics = self.sales_df.groupby('product_name').agg({
            'total_price': 'sum',
            'quantity': 'sum',
            'order_id': 'nunique',
            'discount': 'mean',
            price_col: 'mean'
        }).reset_index()
        
        product_metrics.columns = [
            'product_name', 'revenue', 'units_sold', 
            'orders', 'avg_discount', 'avg_price'
        ]
        
        # Top por receita
        top_revenue = product_metrics.nlargest(top_n, 'revenue')
        
        # Top por quantidade
        top_quantity = product_metrics.nlargest(top_n, 'units_sold')
        
        logger.info(f"Performance calculada para {len(product_metrics)} produtos")
        return top_revenue, top_quantity
    
    def category_performance(self) -> pd.DataFrame:
        """
        Análise de performance por categoria
        
        Returns:
            DataFrame com métricas por categoria
        """
        logger.info("Analisando performance por categoria...")
        
        category_metrics = self.sales_df.groupby('category_name').agg({
            'total_price': 'sum',
            'quantity': 'sum',
            'order_id': 'nunique',
            'product_id': 'nunique',
            'discount': 'mean'
        }).reset_index()
        
        category_metrics.columns = [
            'category', 'revenue', 'units_sold', 
            'orders', 'products', 'avg_discount'
        ]
        
        # Calcular percentual da receita total
        total_revenue = category_metrics['revenue'].sum()
        category_metrics['revenue_pct'] = (category_metrics['revenue'] / total_revenue * 100).round(2)
        
        # Ordenar por receita
        category_metrics = category_metrics.sort_values('revenue', ascending=False)
        
        logger.info(f"Performance calculada para {len(category_metrics)} categorias")
        return category_metrics
    
    def time_series_analysis(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Análise temporal de vendas
        
        Returns:
            Tupla com (diário, semanal, mensal)
        """
        logger.info("Realizando análise temporal...")
        
        # Preparar dados
        daily_sales = self.sales_df.groupby('order_date').agg({
            'total_price': 'sum',
            'order_id': 'nunique',
            'quantity': 'sum'
        }).reset_index()
        daily_sales.columns = ['date', 'revenue', 'orders', 'items']
        
        # Análise semanal
        weekly_sales = self.sales_df.copy()
        weekly_sales['week'] = weekly_sales['order_date'].dt.to_period('W')
        weekly_sales = weekly_sales.groupby('week').agg({
            'total_price': 'sum',
            'order_id': 'nunique',
            'quantity': 'sum'
        }).reset_index()
        weekly_sales.columns = ['week', 'revenue', 'orders', 'items']
        weekly_sales['week'] = weekly_sales['week'].astype(str)
        
        # Análise mensal
        monthly_sales = self.sales_df.copy()
        monthly_sales['month'] = monthly_sales['order_date'].dt.to_period('M')
        monthly_sales = monthly_sales.groupby('month').agg({
            'total_price': 'sum',
            'order_id': 'nunique',
            'quantity': 'sum'
        }).reset_index()
        monthly_sales.columns = ['month', 'revenue', 'orders', 'items']
        monthly_sales['month'] = monthly_sales['month'].astype(str)
        
        logger.info("Análise temporal concluída")
        return daily_sales, weekly_sales, monthly_sales
    
    def employee_performance(self) -> pd.DataFrame:
        """
        Análise de performance de funcionários
        
        Returns:
            DataFrame com métricas por funcionário
        """
        logger.info("Analisando performance de funcionários...")
        
        employee_metrics = self.sales_df.groupby(['employee_id', 'full_name']).agg({
            'total_price': 'sum',
            'order_id': 'nunique',
            'customer_id': 'nunique',
            'quantity': 'sum'
        }).reset_index()
        
        employee_metrics.columns = [
            'employee_id', 'employee_name', 'revenue', 
            'orders', 'customers', 'items_sold'
        ]
        
        # Calcular médias
        employee_metrics['avg_order_value'] = employee_metrics['revenue'] / employee_metrics['orders']
        
        # Ordenar por receita
        employee_metrics = employee_metrics.sort_values('revenue', ascending=False)
        
        logger.info(f"Performance calculada para {len(employee_metrics)} funcionários")
        return employee_metrics
    
    def discount_analysis(self) -> pd.DataFrame:
        """
        Análise do impacto de descontos
        
        Returns:
            DataFrame com análise de descontos
        """
        logger.info("Analisando impacto de descontos...")
        
        # Criar faixas de desconto
        self.sales_df['discount_range'] = pd.cut(
            self.sales_df['discount'],
            bins=[-0.01, 0, 0.05, 0.10, 0.15, 1.0],
            labels=['No Discount', '0-5%', '5-10%', '10-15%', '>15%']
        )
        
        discount_metrics = self.sales_df.groupby('discount_range').agg({
            'total_price': 'sum',
            'order_id': 'nunique',
            'quantity': 'sum',
            'discount': 'mean'
        }).reset_index()
        
        discount_metrics.columns = [
            'discount_range', 'revenue', 'orders', 
            'units_sold', 'avg_discount'
        ]
        
        # Calcular ticket médio
        discount_metrics['avg_order_value'] = discount_metrics['revenue'] / discount_metrics['orders']
        
        logger.info("Análise de descontos concluída")
        return discount_metrics
    
    def shipping_analysis(self) -> pd.DataFrame:
        """
        Análise de frete e transportadoras
        
        Returns:
            DataFrame com análise de shipping
        """
        logger.info("Analisando dados de frete...")
        
        # Agrupar por pedido para evitar duplicação
        order_shipping = self.sales_df.groupby('order_id').agg({
            'freight': 'first',
            'ship_via': 'first',
            'shipped_date': 'first',
            'order_date': 'first',
            'ship_country': 'first',
            'total_price': 'sum'
        }).reset_index()
        
        # Calcular tempo de envio
        order_shipping['shipping_days'] = (
            order_shipping['shipped_date'] - order_shipping['order_date']
        ).dt.days
        
        # Análise por transportadora
        shipper_metrics = order_shipping.groupby('ship_via').agg({
            'freight': ['mean', 'sum', 'count'],
            'shipping_days': 'mean',
            'total_price': 'sum'
        }).reset_index()
        
        shipper_metrics.columns = [
            'shipper_id', 'avg_freight', 'total_freight', 
            'shipments', 'avg_shipping_days', 'total_revenue'
        ]
        
        # Calcular frete como % da receita
        shipper_metrics['freight_pct'] = (
            shipper_metrics['total_freight'] / shipper_metrics['total_revenue'] * 100
        ).round(2)
        
        logger.info("Análise de frete concluída")
        return shipper_metrics
    
    def generate_summary(self) -> Dict:
        """
        Gera resumo completo das análises de vendas
        
        Returns:
            Dicionário com todas as métricas
        """
        logger.info("Gerando resumo completo...")
        
        overall = self.overall_metrics()
        top_revenue, top_quantity = self.product_performance(top_n=5)
        category = self.category_performance()
        
        summary = {
            'overall_metrics': overall,
            'top_5_products_by_revenue': top_revenue[['product_name', 'revenue']].to_dict('records'),
            'top_category': category.iloc[0]['category'] if len(category) > 0 else None,
            'categories_count': len(category),
        }
        
        return summary