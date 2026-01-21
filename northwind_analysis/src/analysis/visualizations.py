"""
Módulo de visualizações
"""
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from pathlib import Path
import logging
from config import GRAFICOS_DIR, PLOT_CONFIG

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configurar estilo
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette(PLOT_CONFIG['color_palette'])


class SalesVisualizations:
    """Classe para gerar visualizações de vendas"""
    
    def __init__(self, output_dir: Path = GRAFICOS_DIR):
        """
        Inicializa gerador de visualizações
        
        Args:
            output_dir: Diretório para salvar gráficos
        """
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def plot_top_products(self, df: pd.DataFrame, filename: str = '01_top_produtos_receita.png'):
        """Gráfico de barras - Top produtos por receita"""
        logger.info(f"Gerando gráfico: {filename}")
        
        fig, ax = plt.subplots(figsize=PLOT_CONFIG['figsize'])
        
        df_plot = df.head(10).sort_values('revenue')
        ax.barh(df_plot['product_name'], df_plot['revenue'], color='steelblue')
        
        ax.set_xlabel('Receita ($)', fontsize=12)
        ax.set_title('Top 10 Produtos por Receita', fontsize=14, fontweight='bold')
        ax.grid(axis='x', alpha=0.3)
        
        # Adicionar valores
        for i, v in enumerate(df_plot['revenue']):
            ax.text(v, i, f' ${v:,.0f}', va='center', fontsize=9)
        
        plt.tight_layout()
        plt.savefig(self.output_dir / filename, dpi=PLOT_CONFIG['dpi'], bbox_inches='tight')
        plt.close()
        
        logger.info(f"Gráfico salvo: {filename}")
    
    def plot_category_revenue(self, df: pd.DataFrame, filename: str = '02_receita_por_categoria.png'):
        """Gráfico de pizza - Receita por categoria"""
        logger.info(f"Gerando gráfico: {filename}")
        
        fig, ax = plt.subplots(figsize=(10, 8))
        
        colors = sns.color_palette('Set3', len(df))
        wedges, texts, autotexts = ax.pie(
            df['revenue'],
            labels=df['category'],
            autopct='%1.1f%%',
            colors=colors,
            startangle=90,
            textprops={'fontsize': 10}
        )
        
        # Estilizar percentuais
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
        
        ax.set_title('Distribuição de Receita por Categoria', fontsize=14, fontweight='bold')
        
        plt.tight_layout()
        plt.savefig(self.output_dir / filename, dpi=PLOT_CONFIG['dpi'], bbox_inches='tight')
        plt.close()
        
        logger.info(f"Gráfico salvo: {filename}")
    
    def plot_sales_timeline(self, df: pd.DataFrame, filename: str = '03_evolucao_vendas.png'):
        """Gráfico de linha - Evolução de vendas"""
        logger.info(f"Gerando gráfico: {filename}")
        
        fig, ax = plt.subplots(figsize=(14, 6))
        
        ax.plot(df['date'], df['revenue'], marker='o', linewidth=2, markersize=6, color='darkblue')
        ax.fill_between(df['date'], df['revenue'], alpha=0.3, color='skyblue')
        
        ax.set_xlabel('Data', fontsize=12)
        ax.set_ylabel('Receita ($)', fontsize=12)
        ax.set_title('Evolução de Vendas ao Longo do Tempo', fontsize=14, fontweight='bold')
        ax.grid(True, alpha=0.3)
        
        # Rotacionar labels do eixo x
        plt.xticks(rotation=45, ha='right')
        
        # Formatar eixo y
        ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x:,.0f}'))
        
        plt.tight_layout()
        plt.savefig(self.output_dir / filename, dpi=PLOT_CONFIG['dpi'], bbox_inches='tight')
        plt.close()
        
        logger.info(f"Gráfico salvo: {filename}")
    
    def plot_customer_distribution(self, df: pd.DataFrame, filename: str = '04_clientes_por_pais.png'):
        """Gráfico de barras - Distribuição de clientes por país"""
        logger.info(f"Gerando gráfico: {filename}")
        
        fig, ax = plt.subplots(figsize=(12, 8))
        
        df_plot = df.sort_values('customers', ascending=True).tail(15)
        ax.barh(df_plot['country'], df_plot['customers'], color='coral')
        
        ax.set_xlabel('Número de Clientes', fontsize=12)
        ax.set_title('Distribuição de Clientes por País (Top 15)', fontsize=14, fontweight='bold')
        ax.grid(axis='x', alpha=0.3)
        
        # Adicionar valores
        for i, v in enumerate(df_plot['customers']):
            ax.text(v, i, f' {int(v)}', va='center', fontsize=9)
        
        plt.tight_layout()
        plt.savefig(self.output_dir / filename, dpi=PLOT_CONFIG['dpi'], bbox_inches='tight')
        plt.close()
        
        logger.info(f"Gráfico salvo: {filename}")
    
    def plot_rfm_analysis(self, df: pd.DataFrame, filename: str = '05_analise_rfm.html'):
        """Gráfico 3D interativo - Análise RFM"""
        logger.info(f"Gerando gráfico interativo: {filename}")
        
        fig = px.scatter_3d(
            df,
            x='recency',
            y='frequency',
            z='monetary',
            color='segment',
            hover_data=['company_name', 'rfm_score'],
            title='Análise RFM - Segmentação de Clientes',
            labels={
                'recency': 'Recência (dias)',
                'frequency': 'Frequência (pedidos)',
                'monetary': 'Valor Monetário ($)',
                'segment': 'Segmento'
            },
            color_discrete_sequence=px.colors.qualitative.Set2
        )
        
        fig.update_traces(marker=dict(size=8, line=dict(width=0.5, color='DarkSlateGrey')))
        fig.update_layout(height=700, showlegend=True)
        
        fig.write_html(self.output_dir / filename)
        
        logger.info(f"Gráfico salvo: {filename}")
    
    def plot_order_value_distribution(self, df: pd.DataFrame, filename: str = '06_ticket_medio.png'):
        """Histograma - Distribuição de ticket médio"""
        logger.info(f"Gerando gráfico: {filename}")
        
        fig, ax = plt.subplots(figsize=PLOT_CONFIG['figsize'])
        
        ax.hist(df['avg_order_value'], bins=30, color='seagreen', alpha=0.7, edgecolor='black')
        
        # Adicionar linha de média
        mean_val = df['avg_order_value'].mean()
        ax.axvline(mean_val, color='red', linestyle='--', linewidth=2, label=f'Média: ${mean_val:.2f}')
        
        ax.set_xlabel('Valor do Pedido ($)', fontsize=12)
        ax.set_ylabel('Frequência', fontsize=12)
        ax.set_title('Distribuição de Ticket Médio por Cliente', fontsize=14, fontweight='bold')
        ax.legend()
        ax.grid(axis='y', alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(self.output_dir / filename, dpi=PLOT_CONFIG['dpi'], bbox_inches='tight')
        plt.close()
        
        logger.info(f"Gráfico salvo: {filename}")
    
    def plot_correlation_matrix(self, df: pd.DataFrame, filename: str = '07_correlacao.png'):
        """Heatmap - Matriz de correlação"""
        logger.info(f"Gerando gráfico: {filename}")
        
        # Selecionar apenas colunas numéricas
        numeric_cols = df.select_dtypes(include=['float64', 'int64']).columns
        correlation = df[numeric_cols].corr()
        
        fig, ax = plt.subplots(figsize=(10, 8))
        
        sns.heatmap(
            correlation,
            annot=True,
            fmt='.2f',
            cmap='coolwarm',
            center=0,
            square=True,
            linewidths=1,
            cbar_kws={'shrink': 0.8},
            ax=ax
        )
        
        ax.set_title('Matriz de Correlação - Métricas de Vendas', fontsize=14, fontweight='bold')
        
        plt.tight_layout()
        plt.savefig(self.output_dir / filename, dpi=PLOT_CONFIG['dpi'], bbox_inches='tight')
        plt.close()
        
        logger.info(f"Gráfico salvo: {filename}")
    
    def plot_employee_performance(self, df: pd.DataFrame, filename: str = '08_top_funcionarios.png'):
        """Gráfico de barras - Performance de funcionários"""
        logger.info(f"Gerando gráfico: {filename}")
        
        fig, ax = plt.subplots(figsize=PLOT_CONFIG['figsize'])
        
        df_plot = df.sort_values('revenue', ascending=True)
        colors = plt.cm.viridis(range(len(df_plot)))
        
        ax.barh(df_plot['employee_name'], df_plot['revenue'], color=colors)
        
        ax.set_xlabel('Receita Gerada ($)', fontsize=12)
        ax.set_title('Performance de Vendas por Funcionário', fontsize=14, fontweight='bold')
        ax.grid(axis='x', alpha=0.3)
        
        # Adicionar valores
        for i, v in enumerate(df_plot['revenue']):
            ax.text(v, i, f' ${v:,.0f}', va='center', fontsize=9)
        
        plt.tight_layout()
        plt.savefig(self.output_dir / filename, dpi=PLOT_CONFIG['dpi'], bbox_inches='tight')
        plt.close()
        
        logger.info(f"Gráfico salvo: {filename}")
    
    def plot_discount_impact(self, sales_df: pd.DataFrame, filename: str = '09_impacto_descontos.png'):
        """Scatter plot - Impacto de descontos"""
        logger.info(f"Gerando gráfico: {filename}")
        
        fig, ax = plt.subplots(figsize=PLOT_CONFIG['figsize'])
        
        scatter = ax.scatter(
            sales_df['discount'] * 100,
            sales_df['total_price'],
            c=sales_df['quantity'],
            cmap='YlOrRd',
            alpha=0.6,
            s=100,
            edgecolors='black',
            linewidth=0.5
        )
        
        ax.set_xlabel('Desconto (%)', fontsize=12)
        ax.set_ylabel('Valor da Venda ($)', fontsize=12)
        ax.set_title('Impacto do Desconto no Valor das Vendas', fontsize=14, fontweight='bold')
        ax.grid(True, alpha=0.3)
        
        # Adicionar colorbar
        cbar = plt.colorbar(scatter, ax=ax)
        cbar.set_label('Quantidade', fontsize=10)
        
        plt.tight_layout()
        plt.savefig(self.output_dir / filename, dpi=PLOT_CONFIG['dpi'], bbox_inches='tight')
        plt.close()
        
        logger.info(f"Gráfico salvo: {filename}")
    
    def plot_freight_distribution(self, df: pd.DataFrame, filename: str = '10_frete_transportadoras.png'):
        """Box plot - Distribuição de frete por transportadora"""
        logger.info(f"Gerando gráfico: {filename}")
        
        fig, ax = plt.subplots(figsize=(10, 6))
        
        # Preparar dados para box plot
        shipper_labels = [f'Shipper {int(s)}' for s in df['shipper_id'].unique()]
        
        # Buscar dados originais de frete para cada transportadora
        # Nota: Este gráfico precisa dos dados brutos, não agregados
        
        ax.set_xlabel('Transportadora', fontsize=12)
        ax.set_ylabel('Valor do Frete ($)', fontsize=12)
        ax.set_title('Distribuição de Frete por Transportadora', fontsize=14, fontweight='bold')
        ax.grid(axis='y', alpha=0.3)
        
        # Criar barras com média de frete
        ax.bar(range(len(df)), df['avg_freight'], color='lightcoral', alpha=0.7, edgecolor='black')
        ax.set_xticks(range(len(df)))
        ax.set_xticklabels([f'Shipper {int(s)}' for s in df['shipper_id']])
        
        plt.tight_layout()
        plt.savefig(self.output_dir / filename, dpi=PLOT_CONFIG['dpi'], bbox_inches='tight')
        plt.close()
        
        logger.info(f"Gráfico salvo: {filename}")
    
    def create_dashboard_summary(self, metrics: dict, filename: str = '11_dashboard_resumo.png'):
        """Cria dashboard com resumo de métricas"""
        logger.info(f"Gerando dashboard: {filename}")
        
        fig = plt.figure(figsize=(16, 10))
        gs = fig.add_gridspec(3, 3, hspace=0.3, wspace=0.3)
        
        # Métricas principais (KPIs)
        ax_kpi = fig.add_subplot(gs[0, :])
        ax_kpi.axis('off')
        
        kpi_text = f"""
        DASHBOARD DE VENDAS - NORTHWIND
        
        Receita Total: ${metrics.get('total_revenue', 0):,.2f}  |  Total de Pedidos: {metrics.get('total_orders', 0)}  |  
        Ticket Médio: ${metrics.get('avg_order_value', 0):,.2f}  |  Clientes Ativos: {metrics.get('unique_customers', 0)}
        """
        
        ax_kpi.text(0.5, 0.5, kpi_text, ha='center', va='center', 
                   fontsize=14, fontweight='bold',
                   bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.5))
        
        plt.tight_layout()
        plt.savefig(self.output_dir / filename, dpi=PLOT_CONFIG['dpi'], bbox_inches='tight')
        plt.close()
        
        logger.info(f"Dashboard salvo: {filename}")