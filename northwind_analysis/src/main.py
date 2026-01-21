"""
Script principal para executar análise completa Northwind
"""
import sys
import json
from pathlib import Path
from datetime import datetime
sys.path.append(str(Path(__file__).parent.parent))

from database import DatabaseConnection
from data_loader import NorthwindDataLoader
from analysis.customer_behavior import CustomerBehaviorAnalysis
from analysis.sales_analysis import SalesAnalysis
from analysis.visualizations import SalesVisualizations
from config import RELATORIOS_DIR, GRAFICOS_DIR
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('analysis.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


def main():
    """Função principal de análise completa"""
    print("="*80)
    print("ANÁLISE NORTHWIND COMPLETA - INICIANDO")
    print("="*80)
    
    try:
        # 1. Conectar ao banco
        print("\n[1/7] Conectando ao banco de dados...")
        db = DatabaseConnection()
        
        if not db.test_connection():
            print("❌ Falha na conexão com banco de dados")
            print("Certifique-se que o PostgreSQL está rodando")
            return
        
        # 2. Carregar dados
        print("\n[2/7] Carregando dados do Northwind...")
        loader = NorthwindDataLoader(db)
        data = loader.load_all()
        sales_df = loader.create_sales_view()
        
        print(f"✓ {len(sales_df)} registros carregados")
        print(f"✓ {data['customers'].shape[0]} clientes")
        print(f"✓ {data['orders'].shape[0]} pedidos")
        print(f"✓ {data['products'].shape[0]} produtos")
        
        # 3. Análise de Comportamento de Clientes
        print("\n[3/7] Analisando comportamento de clientes...")
        customer_analysis = CustomerBehaviorAnalysis(sales_df, data['customers'])
        
        rfm_df = customer_analysis.calculate_rfm()
        clv_df = customer_analysis.customer_lifetime_value()
        segmentation_df = customer_analysis.customer_segmentation()
        geo_df = customer_analysis.geographic_analysis()
        customer_summary = customer_analysis.generate_summary()
        
        # Salvar relatórios de clientes
        rfm_df.to_csv(RELATORIOS_DIR / 'rfm_analysis.csv', index=False)
        clv_df.to_csv(RELATORIOS_DIR / 'customer_lifetime_value.csv', index=False)
        segmentation_df.to_csv(RELATORIOS_DIR / 'customer_segmentation.csv', index=False)
        geo_df.to_csv(RELATORIOS_DIR / 'geographic_analysis.csv', index=False)
        
        print(f"✓ {len(rfm_df)} clientes segmentados (RFM)")
        print(f"✓ {len(geo_df)} países analisados")
        print(f"✓ Relatórios salvos em {RELATORIOS_DIR}")
        
        # 4. Análise de Vendas
        print("\n[4/7] Analisando vendas...")
        sales_analysis = SalesAnalysis(sales_df)
        
        overall_metrics = sales_analysis.overall_metrics()
        top_revenue, top_quantity = sales_analysis.product_performance()
        category_perf = sales_analysis.category_performance()
        daily_sales, weekly_sales, monthly_sales = sales_analysis.time_series_analysis()
        employee_perf = sales_analysis.employee_performance()
        discount_analysis = sales_analysis.discount_analysis()
        shipping_analysis = sales_analysis.shipping_analysis()
        
        # Salvar relatórios de vendas
        top_revenue.to_csv(RELATORIOS_DIR / 'top_products_revenue.csv', index=False)
        category_perf.to_csv(RELATORIOS_DIR / 'category_performance.csv', index=False)
        daily_sales.to_csv(RELATORIOS_DIR / 'daily_sales.csv', index=False)
        employee_perf.to_csv(RELATORIOS_DIR / 'employee_performance.csv', index=False)
        
        print(f"✓ Receita Total: R$ {overall_metrics['total_revenue']:.2f}")
        print(f"✓ Ticket Médio: R$ {overall_metrics['avg_order_value']:.2f}")
        print(f"✓ {len(category_perf)} categorias analisadas")
        
        # 5. Gerar Visualizações
        print("\n[5/7] Gerando visualizações...")
        viz = SalesVisualizations(GRAFICOS_DIR)
        
        try:
            viz.plot_top_products(top_revenue)
            print("✓ Top produtos por receita")
            
            viz.plot_category_revenue(category_perf)
            print("✓ Receita por categoria")
            
            viz.plot_sales_timeline(daily_sales)
            print("✓ Evolução temporal de vendas")
            
            viz.plot_customer_distribution(geo_df)
            print("✓ Distribuição de clientes por país")
            
            viz.plot_rfm_analysis(rfm_df)
            print("✓ Análise RFM interativa")
            
            viz.plot_order_value_distribution(clv_df)
            print("✓ Distribuição de ticket médio")
            
            correlation_df = sales_df[['unit_price_x', 'quantity', 'discount', 'total_price', 'freight']].copy()
            viz.plot_correlation_matrix(correlation_df)
            print("✓ Matriz de correlação")
            
            viz.plot_employee_performance(employee_perf)
            print("✓ Performance de funcionários")
            
            viz.plot_discount_impact(sales_df)
            print("✓ Impacto de descontos")
            
            viz.plot_freight_distribution(shipping_analysis)
            print("✓ Análise de frete")
            
            viz.create_dashboard_summary(overall_metrics)
            print("✓ Dashboard resumo")
            
            print(f"\n✓ {11} gráficos salvos em {GRAFICOS_DIR}")
            
        except Exception as e:
            logger.warning(f"Erro ao gerar algumas visualizações: {e}")
            print(f"⚠️  Algumas visualizações podem não ter sido geradas")
        
        # 6. Gerar Relatório Consolidado
        print("\n[6/7] Gerando relatório consolidado...")
        
        consolidated_report = {
            'timestamp': datetime.now().isoformat(),
            'data_summary': {
                'total_records': len(sales_df),
                'customers': len(data['customers']),
                'orders': len(data['orders']),
                'products': len(data['products']),
                'categories': len(data['categories']),
                'employees': len(data['employees'])
            },
            'customer_metrics': customer_summary,
            'sales_metrics': {
                'total_revenue': float(overall_metrics['total_revenue']),
                'total_orders': int(overall_metrics['total_orders']),
                'avg_order_value': float(overall_metrics['avg_order_value']),
                'total_items_sold': int(overall_metrics['total_items_sold']),
                'unique_products': int(overall_metrics['unique_products']),
                'unique_customers': int(overall_metrics['unique_customers']),
                'avg_discount': float(overall_metrics['avg_discount'])
            }
        }
        
        with open(RELATORIOS_DIR / 'consolidated_report.json', 'w', encoding='utf-8') as f:
            json.dump(consolidated_report, f, indent=2, default=str)
        
        # Gerar insights em texto
        generate_insights(consolidated_report, customer_summary, category_perf, rfm_df)
        
        print("✓ Relatório consolidado salvo")
        
        # 7. Resumo Final
        print("\n[7/7] Resumo da Análise:")
        print("="*80)
        print(f"\n📊 MÉTRICAS PRINCIPAIS:")
        print(f"  • Receita Total: R$ {overall_metrics['total_revenue']:,.2f}")
        print(f"  • Total de Pedidos: {overall_metrics['total_orders']}")
        print(f"  • Ticket Médio: R$ {overall_metrics['avg_order_value']:.2f}")
        print(f"  • Clientes Ativos: {overall_metrics['unique_customers']}")
        print(f"  • Produtos Vendidos: {overall_metrics['unique_products']}")
        
        print(f"\n👥 CLIENTES:")
        print(f"  • Total: {customer_summary['active_customers']}")
        print(f"  • Média pedidos/cliente: {customer_summary['avg_orders_per_customer']:.1f}")
        print(f"  • Receita média/cliente: R$ {customer_summary['avg_revenue_per_customer']:.2f}")
        
        print(f"\n📁 ARQUIVOS GERADOS:")
        print(f"  • Relatórios: {RELATORIOS_DIR}")
        print(f"  • Gráficos: {GRAFICOS_DIR}")
        
        print("\n" + "="*80)
        print("✅ ANÁLISE COMPLETA CONCLUÍDA COM SUCESSO!")
        print("="*80)
        
    except Exception as e:
        logger.error(f"Erro durante análise: {e}", exc_info=True)
        print(f"\n❌ Erro: {e}")
        raise
    
    finally:
        if 'db' in locals():
            db.close()


def generate_insights(consolidated, customer_summary, category_perf, rfm_df):
    """Gera arquivo de insights em texto"""
    insights_file = RELATORIOS_DIR / 'insights.txt'
    
    with open(insights_file, 'w', encoding='utf-8') as f:
        f.write("=" * 80 + "\n")
        f.write("INSIGHTS DA ANÁLISE NORTHWIND\n")
        f.write("=" * 80 + "\n\n")
        
        f.write("1. COMPORTAMENTO DE CLIENTES\n")
        f.write("-" * 80 + "\n")
        f.write(f"• Total de clientes ativos: {customer_summary['active_customers']}\n")
        f.write(f"• Média de pedidos por cliente: {customer_summary['avg_orders_per_customer']:.2f}\n")
        f.write(f"• Receita média por cliente: R$ {customer_summary['avg_revenue_per_customer']:.2f}\n")
        f.write(f"• Países com clientes: {customer_summary['countries_with_customers']}\n\n")
        
        f.write("Segmentação RFM:\n")
        for segment, count in customer_summary['segment_distribution'].items():
            f.write(f"  - {segment}: {count} clientes\n")
        f.write("\n")
        
        f.write("2. PERFORMANCE DE VENDAS\n")
        f.write("-" * 80 + "\n")
        metrics = consolidated['sales_metrics']
        f.write(f"• Receita total: R$ {metrics['total_revenue']:,.2f}\n")
        f.write(f"• Total de pedidos: {metrics['total_orders']}\n")
        f.write(f"• Ticket médio: R$ {metrics['avg_order_value']:.2f}\n")
        f.write(f"• Produtos únicos vendidos: {metrics['unique_products']}\n")
        f.write(f"• Taxa média de desconto: {metrics['avg_discount'] * 100:.1f}%\n\n")
        
        f.write("3. CATEGORIAS\n")
        f.write("-" * 80 + "\n")
        for _, row in category_perf.head(5).iterrows():
            f.write(f"  - {row['category']}: R$ {row['revenue']:,.2f} ({row['revenue_pct']:.1f}%)\n")
        f.write("\n")
        
        f.write("4. RECOMENDAÇÕES\n")
        f.write("-" * 80 + "\n")
        f.write("• Focar em retenção dos clientes 'Champions' e 'Loyal Customers'\n")
        f.write("• Desenvolver estratégias de reativação para clientes 'At Risk' e 'Lost'\n")
        f.write("• Analisar mix de produtos das categorias de maior receita\n")
        f.write("• Avaliar impacto dos descontos na lucratividade\n")
        f.write("• Otimizar custos de frete por região\n")
    
    logger.info(f"Insights salvos em {insights_file}")


if __name__ == '__main__':
    main()
