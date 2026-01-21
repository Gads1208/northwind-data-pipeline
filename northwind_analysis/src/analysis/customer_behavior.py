"""
Análise de comportamento de clientes
"""
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CustomerBehaviorAnalysis:
    """Análise de comportamento de clientes"""
    
    def __init__(self, sales_df: pd.DataFrame, customers_df: pd.DataFrame):
        """
        Inicializa análise
        
        Args:
            sales_df: DataFrame com dados de vendas consolidados
            customers_df: DataFrame com dados de clientes
        """
        self.sales_df = sales_df
        self.customers_df = customers_df
        self.reference_date = self.sales_df['order_date'].max()
    
    def calculate_rfm(self) -> pd.DataFrame:
        """
        Calcula análise RFM (Recency, Frequency, Monetary)
        
        Returns:
            DataFrame com scores RFM por cliente
        """
        logger.info("Calculando análise RFM...")
        
        # Agrupar por cliente
        rfm = self.sales_df.groupby('customer_id').agg({
            'order_date': lambda x: (self.reference_date - x.max()).days,  # Recency
            'order_id': 'nunique',  # Frequency
            'total_price': 'sum'  # Monetary
        }).reset_index()
        
        rfm.columns = ['customer_id', 'recency', 'frequency', 'monetary']
        
        # Calcular quartis para scoring (com tratamento para datasets pequenos)
        try:
            rfm['r_score'] = pd.qcut(rfm['recency'], 4, labels=[4, 3, 2, 1], duplicates='drop')
        except ValueError:
            rfm['r_score'] = pd.cut(rfm['recency'], 4, labels=[4, 3, 2, 1], duplicates='drop')
        
        try:
            rfm['f_score'] = pd.qcut(rfm['frequency'], 4, labels=[1, 2, 3, 4], duplicates='drop')
        except ValueError:
            rfm['f_score'] = pd.cut(rfm['frequency'], 4, labels=[1, 2, 3, 4], duplicates='drop')
        
        try:
            rfm['m_score'] = pd.qcut(rfm['monetary'], 4, labels=[1, 2, 3, 4], duplicates='drop')
        except ValueError:
            rfm['m_score'] = pd.cut(rfm['monetary'], 4, labels=[1, 2, 3, 4], duplicates='drop')
        
        # Score RFM combinado
        rfm['rfm_score'] = (
            rfm['r_score'].astype(int) + 
            rfm['f_score'].astype(int) + 
            rfm['m_score'].astype(int)
        )
        
        # Segmentação
        rfm['segment'] = rfm['rfm_score'].apply(self._categorize_rfm)
        
        # Merge com dados do cliente
        rfm = rfm.merge(
            self.customers_df[['customer_id', 'company_name', 'country']], 
            on='customer_id', 
            how='left'
        )
        
        logger.info(f"RFM calculado para {len(rfm)} clientes")
        return rfm
    
    @staticmethod
    def _categorize_rfm(score: int) -> str:
        """Categoriza cliente baseado no score RFM"""
        if score >= 10:
            return 'Champions'
        elif score >= 8:
            return 'Loyal Customers'
        elif score >= 6:
            return 'Potential Loyalists'
        elif score >= 5:
            return 'At Risk'
        else:
            return 'Lost'
    
    def customer_lifetime_value(self) -> pd.DataFrame:
        """
        Calcula Customer Lifetime Value (CLV)
        
        Returns:
            DataFrame com CLV por cliente
        """
        logger.info("Calculando Customer Lifetime Value...")
        
        clv = self.sales_df.groupby('customer_id').agg({
            'order_id': 'nunique',  # Total de pedidos
            'total_price': 'sum',  # Receita total
            'order_date': ['min', 'max']  # Primeira e última compra
        }).reset_index()
        
        clv.columns = ['customer_id', 'total_orders', 'total_revenue', 'first_order', 'last_order']
        
        # Calcular tempo como cliente (em dias)
        clv['customer_lifespan_days'] = (clv['last_order'] - clv['first_order']).dt.days
        
        # Ticket médio
        clv['avg_order_value'] = clv['total_revenue'] / clv['total_orders']
        
        # Frequência de compra (pedidos por dia)
        clv['purchase_frequency'] = clv['total_orders'] / clv['customer_lifespan_days'].replace(0, 1)
        
        # CLV simplificado
        clv['clv'] = clv['avg_order_value'] * clv['total_orders']
        
        # Merge com dados do cliente
        clv = clv.merge(
            self.customers_df[['customer_id', 'company_name', 'country']], 
            on='customer_id', 
            how='left'
        )
        
        # Ordenar por CLV
        clv = clv.sort_values('clv', ascending=False)
        
        logger.info(f"CLV calculado para {len(clv)} clientes")
        return clv
    
    def customer_segmentation(self) -> pd.DataFrame:
        """
        Segmentação de clientes por valor e frequência
        
        Returns:
            DataFrame com segmentação
        """
        logger.info("Realizando segmentação de clientes...")
        
        segmentation = self.sales_df.groupby('customer_id').agg({
            'order_id': 'nunique',
            'total_price': ['sum', 'mean'],
            'discount': 'mean'
        }).reset_index()
        
        segmentation.columns = ['customer_id', 'order_count', 'total_spent', 'avg_order_value', 'avg_discount']
        
        # Categorizar por valor (com tratamento para datasets pequenos)
        try:
            segmentation['value_segment'] = pd.qcut(
                segmentation['total_spent'], 
                q=3, 
                labels=['Low Value', 'Medium Value', 'High Value'],
                duplicates='drop'
            )
        except (ValueError, TypeError):
            segmentation['value_segment'] = pd.cut(
                segmentation['total_spent'], 
                bins=3, 
                labels=['Low Value', 'Medium Value', 'High Value'],
                duplicates='drop'
            )
        
        # Categorizar por frequência (com tratamento para datasets pequenos)
        try:
            segmentation['frequency_segment'] = pd.qcut(
                segmentation['order_count'], 
                q=3, 
                labels=['Occasional', 'Regular', 'Frequent'],
                duplicates='drop'
            )
        except (ValueError, TypeError):
            segmentation['frequency_segment'] = pd.cut(
                segmentation['order_count'], 
                bins=3, 
                labels=['Occasional', 'Regular', 'Frequent'],
                duplicates='drop'
            )
        
        # Merge com dados do cliente
        segmentation = segmentation.merge(
            self.customers_df[['customer_id', 'company_name', 'country']], 
            on='customer_id', 
            how='left'
        )
        
        logger.info("Segmentação concluída")
        return segmentation
    
    def geographic_analysis(self) -> pd.DataFrame:
        """
        Análise geográfica de clientes
        
        Returns:
            DataFrame com métricas por país
        """
        logger.info("Realizando análise geográfica...")
        
        # Usar country_y que vem da tabela de customers
        country_col = 'country_y' if 'country_y' in self.sales_df.columns else 'country'
        geo = self.sales_df.groupby(country_col).agg({
            'customer_id': 'nunique',
            'order_id': 'nunique',
            'total_price': 'sum',
            'freight': 'mean'
        }).reset_index()
        
        geo.columns = ['country', 'customers', 'orders', 'revenue', 'avg_freight']
        
        # Calcular ticket médio por país
        geo['avg_order_value'] = geo['revenue'] / geo['orders']
        
        # Ordenar por receita
        geo = geo.sort_values('revenue', ascending=False)
        
        logger.info(f"Análise geográfica para {len(geo)} países")
        return geo
    
    def product_affinity(self, top_n: int = 10) -> pd.DataFrame:
        """
        Análise de afinidade de produtos por cliente
        
        Args:
            top_n: Número de produtos top a retornar
            
        Returns:
            DataFrame com produtos mais comprados por cliente
        """
        logger.info(f"Analisando afinidade de produtos (top {top_n})...")
        
        affinity = self.sales_df.groupby(['customer_id', 'product_name']).agg({
            'quantity': 'sum',
            'total_price': 'sum'
        }).reset_index()
        
        # Ranquear produtos por cliente
        affinity['rank'] = affinity.groupby('customer_id')['total_price'].rank(ascending=False, method='dense')
        
        # Filtrar top N por cliente
        top_products = affinity[affinity['rank'] <= top_n].sort_values(['customer_id', 'rank'])
        
        logger.info(f"Afinidade calculada para {len(top_products)} combinações cliente-produto")
        return top_products
    
    def generate_summary(self) -> Dict:
        """
        Gera resumo das análises de comportamento
        
        Returns:
            Dicionário com métricas principais
        """
        total_customers = self.customers_df['customer_id'].nunique()
        active_customers = self.sales_df['customer_id'].nunique()
        
        rfm = self.calculate_rfm()
        clv_data = self.customer_lifetime_value()
        
        summary = {
            'total_customers': total_customers,
            'active_customers': active_customers,
            'avg_orders_per_customer': self.sales_df.groupby('customer_id')['order_id'].nunique().mean(),
            'avg_revenue_per_customer': self.sales_df.groupby('customer_id')['total_price'].sum().mean(),
            'top_customer': clv_data.iloc[0]['company_name'] if len(clv_data) > 0 else None,
            'top_customer_clv': clv_data.iloc[0]['clv'] if len(clv_data) > 0 else 0,
            'segment_distribution': rfm['segment'].value_counts().to_dict(),
            'countries_with_customers': self.customers_df['country'].nunique(),
        }
        
        return summary