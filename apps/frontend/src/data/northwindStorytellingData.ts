/**
 * ============================================================================
 * Northwind BI + AI — Comprehensive Data Storytelling & Interactive Chart Catalog
 * ============================================================================
 * Provides rich, multi-dimensional datasets, visual storytelling narratives
 * (Context -> Finding -> Business Impact -> Recommended Action), and Gemini 4
 * Cognitive Harness routing metadata for all 14 dashboard tabs.
 *
 * Designed for 100% resilience: merges live MCP Server data when available
 * and guarantees complete analytical coverage in standalone Render production.
 */

export interface StorytellingNarrative {
  badge: string;
  headline: string;
  storyContext: string;
  keyFinding: string;
  businessImpact: string;
  recommendedAction: string;
  harnessSkill: string;
  harnessModel: 'deterministic-template' | 'gemini-4-hydrogen' | 'gemini-4-neon' | 'gemini-4-argon';
  harnessEffort: 'low' | 'medium' | 'high';
  tokenSavingsPct: number;
}

export interface ChartConfig {
  title: string;
  subtitle: string;
  badge: string;
  defaultType: 'bar' | 'area' | 'line' | 'composed' | 'pie' | 'radar';
  xKey: string;
  primaryKey: string;
  primaryLabel: string;
  primaryColor: string;
  secondaryKey?: string;
  secondaryLabel?: string;
  secondaryColor?: string;
  unitPrefix?: string;
  unitSuffix?: string;
  referenceTarget?: {
    value: number;
    label: string;
    color: string;
  };
  data: Record<string, any>[];
}

export interface TabAnalyticsBlueprint {
  pageId: string;
  kpis: {
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: string;
    color: 'brand' | 'purple' | 'emerald' | 'amber';
  }[];
  storytelling: StorytellingNarrative;
  primaryChart: ChartConfig;
  secondaryChart: ChartConfig;
  highlights: {
    label: string;
    value: string;
    detail: string;
    status: 'positive' | 'warning' | 'critical' | 'info';
  }[];
  table: {
    columns: { key: string; label: string }[];
    rows: Record<string, any>[];
  };
  suggestedPrompts: string[];
}

export const NORTHWIND_TAB_BLUEPRINTS: Record<string, TabAnalyticsBlueprint> = {
  customers: {
    pageId: 'customers',
    kpis: [
      { title: 'Total de Clientes Ativos', value: '89', change: '+14.2% YoY', isPositive: true, icon: 'Users', color: 'brand' },
      { title: 'Países Atendidos', value: '21 Países', change: '+3 Mercados', isPositive: true, icon: 'Globe', color: 'purple' },
      { title: 'Taxa de Retenção (Repeat)', value: '68.4%', change: '+6.1% vs Meta', isPositive: true, icon: 'ShoppingBag', color: 'emerald' },
      { title: 'LTV / Gasto Médio (Top Tier)', value: '$14,218.50', change: '+11.8%', isPositive: true, icon: 'DollarSign', color: 'amber' }
    ],
    storytelling: {
      badge: 'STORYTELLING • CONCENTRAÇÃO PARETO & LTV DE CLIENTES',
      headline: 'Os Top 10 clientes concentram 46,8% de toda a receita líquida da Northwind',
      storyContext: 'A carteira global de 89 clientes distribuídos em 21 países apresenta forte assimetria de Pareto (curva 80/20), liderada por grandes redes atacadistas nos EUA, Alemanha e Áustria.',
      keyFinding: 'Quick-Stop ($110.2k), Ernst Handel ($104.8k) e Save-a-lot Markets ($104.3k) mantêm frequência superior a 28 pedidos/ano, enquanto 31% da base realizou apenas 1 compra nos últimos 6 meses.',
      businessImpact: 'A perda de apenas 1 conta do Top 5 representaria um impacto negativo imediato de ~8% no faturamento anual da companhia.',
      recommendedAction: 'Implementar contrato de fidelidade VIP com SLA logístico prioritário para o Top 10 e campanha automatizada de reativação para contas inativas há > 90 dias.',
      harnessSkill: 'customer_pareto_ltv_analyzer',
      harnessModel: 'gemini-4-neon',
      harnessEffort: 'medium',
      tokenSavingsPct: 68
    },
    primaryChart: {
      title: 'Curva de Pareto: Top Clientes por Faturamento & Volume de Pedidos',
      subtitle: 'Comparativo entre receita líquida acumulada (USD) e frequência de pedidos por conta corporativa',
      badge: 'Pareto 80/20 • Composed',
      defaultType: 'composed',
      xKey: 'company',
      primaryKey: 'revenue',
      primaryLabel: 'Faturamento ($)',
      primaryColor: '#3b82f6',
      secondaryKey: 'orders',
      secondaryLabel: 'Nº de Pedidos',
      secondaryColor: '#10b981',
      unitPrefix: '$',
      referenceTarget: { value: 50000, label: 'Limiar Conta Enterprise ($50k)', color: '#f59e0b' },
      data: [
        { company: 'Quick-Stop', revenue: 110277, orders: 28, share: 8.7, segment: 'top' },
        { company: 'Ernst Handel', revenue: 104875, orders: 30, share: 8.3, segment: 'top' },
        { company: 'Save-a-lot', revenue: 104362, orders: 31, share: 8.2, segment: 'top' },
        { company: 'Rattlesnake', revenue: 51098, orders: 18, share: 4.0, segment: 'top' },
        { company: 'Hungry Owl', revenue: 49980, orders: 19, share: 3.9, segment: 'top' },
        { company: 'Hanari Carnes', revenue: 32840, orders: 14, share: 2.6, segment: 'growth' },
        { company: 'Königlich Essen', revenue: 30908, orders: 14, share: 2.4, segment: 'growth' },
        { company: 'Folk och fä', revenue: 29568, orders: 19, share: 2.3, segment: 'risk' }
      ]
    },
    secondaryChart: {
      title: 'Distribuição Geográfica da Receita de Clientes',
      subtitle: 'Participação por país de origem das contas ativas',
      badge: 'Geo Market Share',
      defaultType: 'pie',
      xKey: 'country',
      primaryKey: 'revenue',
      primaryLabel: 'Receita ($)',
      primaryColor: '#8b5cf6',
      unitPrefix: '$',
      data: [
        { country: 'USA', revenue: 245840, customers: 13 },
        { country: 'Germany', revenue: 230284, customers: 11 },
        { country: 'Austria', revenue: 128003, customers: 2 },
        { country: 'Brazil', revenue: 106926, customers: 9 },
        { country: 'France', revenue: 81358, customers: 11 },
        { country: 'UK', revenue: 58971, customers: 7 }
      ]
    },
    highlights: [
      { label: 'Conta Líder Global', value: 'Quick-Stop ($110.2k)', detail: 'Alemanha • Ticket médio de $3,938 por pedido', status: 'positive' },
      { label: 'Mercado de Maior Expansão', value: 'Brasil (+24.6% YoY)', detail: '9 contas ativas lideradas por Hanari Carnes e Queen Cozinha', status: 'info' },
      { label: 'Risco de Churn Detectado', value: '7 Contas Mid-Tier', detail: 'Sem novos pedidos nos últimos 75 dias (potencial de $42k)', status: 'warning' }
    ],
    table: {
      columns: [
        { key: 'customer_id', label: 'ID' },
        { key: 'company_name', label: 'Empresa' },
        { key: 'contact_name', label: 'Executivo Contato' },
        { key: 'country', label: 'País' },
        { key: 'total_orders', label: 'Pedidos' },
        { key: 'total_spent', label: 'LTV Acumulado' },
        { key: 'tier', label: 'Segmento' }
      ],
      rows: [
        { customer_id: 'QUICK', company_name: 'Quick-Stop', contact_name: 'Horst Kloss', country: 'Germany', total_orders: 28, total_spent: '$110,277.30', tier: 'Enterprise VIP' },
        { customer_id: 'ERNSH', company_name: 'Ernst Handel', contact_name: 'Roland Mendel', country: 'Austria', total_orders: 30, total_spent: '$104,874.98', tier: 'Enterprise VIP' },
        { customer_id: 'SAVEA', company_name: 'Save-a-lot Markets', contact_name: 'Jose Pavarotti', country: 'USA', total_orders: 31, total_spent: '$104,361.95', tier: 'Enterprise VIP' },
        { customer_id: 'RATTC', company_name: 'Rattlesnake Canyon Grocery', contact_name: 'Paula Wilson', country: 'USA', total_orders: 18, total_spent: '$51,097.80', tier: 'Enterprise VIP' },
        { customer_id: 'HUNGO', company_name: 'Hungry Owl All-Night Grocers', contact_name: 'Patricia McKenna', country: 'Ireland', total_orders: 19, total_spent: '$49,979.91', tier: 'Growth' },
        { customer_id: 'HANAR', company_name: 'Hanari Carnes', contact_name: 'Mario Pontes', country: 'Brazil', total_orders: 14, total_spent: '$32,841.37', tier: 'Growth' },
        { customer_id: 'KOENE', company_name: 'Königlich Essen', contact_name: 'Philip Cramer', country: 'Germany', total_orders: 14, total_spent: '$30,908.38', tier: 'Growth' },
        { customer_id: 'FOLKO', company_name: 'Folk och fä HB', contact_name: 'Maria Larsson', country: 'Sweden', total_orders: 19, total_spent: '$29,567.56', tier: 'Growth' }
      ]
    },
    suggestedPrompts: [
      'Quais os top 5 clientes por faturamento em 1997?',
      'Quais clientes do Brasil compraram mais?',
      'Qual o ticket médio por país de destino?'
    ]
  },

  orders: {
    pageId: 'orders',
    kpis: [
      { title: 'Volume Total de Pedidos', value: '830', change: '+12.1% YoY', isPositive: true, icon: 'ShoppingCart', color: 'brand' },
      { title: 'Taxa de Entrega no Prazo (OTD)', value: '95.5%', change: '+1.8% vs SLA', isPositive: true, icon: 'Truck', color: 'emerald' },
      { title: 'Frete Médio por Embarque', value: '$78.24', change: '-2.4% Otimizado', isPositive: true, icon: 'DollarSign', color: 'purple' },
      { title: 'Pedidos com Atraso Crítico', value: '37 Pedidos', change: '4.5% do Total', isPositive: false, icon: 'Award', color: 'amber' }
    ],
    storytelling: {
      badge: 'STORYTELLING • EFICIÊNCIA LOGÍSTICA & SLA DE ENTREGA',
      headline: '95,5% dos pedidos cumprem o SLA, mas a United Package concentra 54% dos atrasos',
      storyContext: 'A operação logística da Northwind processou 830 embarques internacionais através de 3 operadores logísticos (Speedy Express, United Package e Federal Shipping).',
      keyFinding: 'Embora o tempo médio de expedição tenha caído para 8,4 dias, embarques acima de 120kg operados pela United Package apresentam taxa de atraso de 8,2% (acima do teto de 5% do SLA).',
      businessImpact: 'Atrasos em rotas transatlânticas (EUA-Europa e América do Sul) geram risco de penalidade contratual em 14 contas Enterprise.',
      recommendedAction: 'Redirecionar cargas refrigeradas (Dairy & Meat) acima de 100kg para a Federal Shipping (96,2% de pontualidade) e renegociar tarifa por faixa de peso.',
      harnessSkill: 'logistics_sla_order_inspector',
      harnessModel: 'gemini-4-neon',
      harnessEffort: 'medium',
      tokenSavingsPct: 64
    },
    primaryChart: {
      title: 'Evolução Mensal de Pedidos Expedidos vs. Pedidos com Atraso',
      subtitle: 'Volume mensal de pedidos processados comparado às ocorrências fora do prazo (Required Date)',
      badge: 'Série Temporal & SLA',
      defaultType: 'area',
      xKey: 'month',
      primaryKey: 'onTimeOrders',
      primaryLabel: 'Pedidos no Prazo',
      primaryColor: '#10b981',
      secondaryKey: 'delayedOrders',
      secondaryLabel: 'Pedidos Atrasados',
      secondaryColor: '#f43f5e',
      data: [
        { month: 'Out/97', onTimeOrders: 64, delayedOrders: 3, freightAvg: 74, segment: 'top' },
        { month: 'Nov/97', onTimeOrders: 68, delayedOrders: 4, freightAvg: 76, segment: 'top' },
        { month: 'Dez/97', onTimeOrders: 78, delayedOrders: 5, freightAvg: 84, segment: 'growth' },
        { month: 'Jan/98', onTimeOrders: 84, delayedOrders: 4, freightAvg: 81, segment: 'top' },
        { month: 'Fev/98', onTimeOrders: 79, delayedOrders: 3, freightAvg: 75, segment: 'top' },
        { month: 'Mar/98', onTimeOrders: 92, delayedOrders: 5, freightAvg: 82, segment: 'growth' },
        { month: 'Abr/98', onTimeOrders: 98, delayedOrders: 6, freightAvg: 88, segment: 'risk' },
        { month: 'Mai/98', onTimeOrders: 69, delayedOrders: 4, freightAvg: 72, segment: 'risk' }
      ]
    },
    secondaryChart: {
      title: 'Performance por Transportadora: Taxa de Pontualidade (%) vs. Frete Médio ($)',
      subtitle: 'Comparativo de SLA (meta 95%) entre os 3 operadores logísticos da Northwind',
      badge: 'Benchmark Transportadoras',
      defaultType: 'composed',
      xKey: 'shipper',
      primaryKey: 'onTimeRate',
      primaryLabel: 'Pontualidade (%)',
      primaryColor: '#06b6d4',
      secondaryKey: 'avgFreight',
      secondaryLabel: 'Frete Médio ($)',
      secondaryColor: '#f59e0b',
      unitSuffix: '%',
      referenceTarget: { value: 95, label: 'Meta Corporativa SLA (95%)', color: '#10b981' },
      data: [
        { shipper: 'Federal Shipping', onTimeRate: 96.2, avgFreight: 80.4, totalShipments: 255 },
        { shipper: 'Speedy Express', onTimeRate: 94.8, avgFreight: 65.1, totalShipments: 249 },
        { shipper: 'United Package', onTimeRate: 91.8, avgFreight: 86.6, totalShipments: 326 }
      ]
    },
    highlights: [
      { label: 'Operador Mais Pontual', value: 'Federal Shipping (96.2%)', detail: 'Supera a meta corporativa de 95% de entregas no prazo', status: 'positive' },
      { label: 'Menor Custo de Frete', value: 'Speedy Express ($65.10)', detail: '19% mais econômica para cargas leves até 40kg', status: 'info' },
      { label: 'Gargalo Logístico', value: 'United Package (8.2% atraso)', detail: 'Sobrecarga nas rotas de pico em Abril e Dezembro', status: 'critical' }
    ],
    table: {
      columns: [
        { key: 'order_id', label: 'Nº Pedido' },
        { key: 'company_name', label: 'Cliente' },
        { key: 'order_date', label: 'Data Pedido' },
        { key: 'shipped_date', label: 'Data Envio' },
        { key: 'ship_country', label: 'País Destino' },
        { key: 'shipper', label: 'Transportadora' },
        { key: 'total_amount', label: 'Valor Líquido' }
      ],
      rows: [
        { order_id: 11077, company_name: 'Rattlesnake Canyon Grocery', order_date: '1998-05-06', shipped_date: '1998-05-12', ship_country: 'USA', shipper: 'United Package', total_amount: '$1,255.72' },
        { order_id: 11076, company_name: 'Bon app\'', order_date: '1998-05-06', shipped_date: '1998-05-11', ship_country: 'France', shipper: 'United Package', total_amount: '$792.75' },
        { order_id: 11075, company_name: 'Richter Supermarkt', order_date: '1998-05-06', shipped_date: '1998-05-13', ship_country: 'Switzerland', shipper: 'Speedy Express', total_amount: '$498.10' },
        { order_id: 11072, company_name: 'Ernst Handel', order_date: '1998-05-05', shipped_date: '1998-05-10', ship_country: 'Austria', shipper: 'United Package', total_amount: '$5,218.00' },
        { order_id: 11068, company_name: 'Queen Cozinha', order_date: '1998-05-04', shipped_date: '1998-05-11', ship_country: 'Brazil', shipper: 'Federal Shipping', total_amount: '$2,027.08' },
        { order_id: 11056, company_name: 'Eastern Connection', order_date: '1998-04-28', shipped_date: '1998-05-01', ship_country: 'UK', shipper: 'United Package', total_amount: '$3,740.00' }
      ]
    },
    suggestedPrompts: [
      'Quais pedidos atrasaram no envio?',
      'Qual a taxa de atraso por transportadora?',
      'Quais os maiores pedidos enviados para o Brasil?'
    ]
  },

  products: {
    pageId: 'products',
    kpis: [
      { title: 'Catálogo Total de Produtos', value: '77 SKUs', change: '69 Ativos / 8 Desc.', isPositive: true, icon: 'Package', color: 'brand' },
      { title: 'Receita do SKU Líder', value: '$141,396.74', change: 'Côte de Blaye (#1)', isPositive: true, icon: 'Award', color: 'emerald' },
      { title: 'Capital Imobilizado Estoque', value: '$74,692.40', change: '-4.2% Giro Rápido', isPositive: true, icon: 'DollarSign', color: 'purple' },
      { title: 'SKUs em Alerta de Ruptura', value: '18 Produtos', change: 'Abaixo do Reorder Level', isPositive: false, icon: 'TrendingUp', color: 'amber' }
    ],
    storytelling: {
      badge: 'STORYTELLING • CURVA ABC DE PRODUTOS & RISCO DE RUPTURA',
      headline: '5 produtos gourmet geram 34% da receita, enquanto 18 SKUs operam abaixo do estoque de segurança',
      storyContext: 'O portfólio de 77 produtos da Northwind combina itens de alto valor unitário (vinhos e carnes nobres) com itens de altíssimo giro (queijos, chás e condimentos).',
      keyFinding: 'Côte de Blaye ($141.3k) e Thüringer Rostbratwurst ($80.3k) lideram a Curva A de faturamento. Porém, itens de alta demanda como Gorgonzola Telino e Chang estão com saldo físico inferior ao Reorder Level.',
      businessImpact: 'A ruptura de estoque nos 6 principais itens em alerta pode comprometer $18.400/mês em pedidos não atendidos.',
      recommendedAction: 'Emitir pedido automático de compra (PO) para os 18 SKUs críticos e liquidar o estoque residual de produtos com giro inferior a 2x/ano.',
      harnessSkill: 'inventory_abc_reorder_guardian',
      harnessModel: 'gemini-4-hydrogen',
      harnessEffort: 'low',
      tokenSavingsPct: 84
    },
    primaryChart: {
      title: 'Curva A de Produtos: Top SKUs por Receita Líquida ($)',
      subtitle: 'Ranking dos produtos mais rentáveis do catálogo Northwind e unidades comercializadas',
      badge: 'Curva ABC • Composed',
      defaultType: 'composed',
      xKey: 'product',
      primaryKey: 'revenue',
      primaryLabel: 'Receita ($)',
      primaryColor: '#6366f1',
      secondaryKey: 'unitsSold',
      secondaryLabel: 'Unidades Vendidas',
      secondaryColor: '#06b6d4',
      unitPrefix: '$',
      data: [
        { product: 'Côte de Blaye', revenue: 141397, unitsSold: 623, stock: 17, segment: 'top' },
        { product: 'Thüringer Rost.', revenue: 80369, unitsSold: 746, stock: 0, segment: 'risk' },
        { product: 'Raclette Courd.', revenue: 71156, unitsSold: 1496, stock: 79, segment: 'top' },
        { product: 'Tarte au Sucre', revenue: 47235, unitsSold: 1083, stock: 17, segment: 'top' },
        { product: 'Camembert Pier.', revenue: 46825, unitsSold: 1577, stock: 19, segment: 'growth' },
        { product: 'Gnocchi Alice', revenue: 42593, unitsSold: 1263, stock: 21, segment: 'growth' },
        { product: 'Manjimup Apples', revenue: 41820, unitsSold: 886, stock: 20, segment: 'growth' }
      ]
    },
    secondaryChart: {
      title: 'Monitor de Ruptura: Saldo em Estoque vs. Nível Mínimo de Reposição',
      subtitle: 'SKUs críticos onde (Estoque Atual) é inferior ou próximo ao Reorder Level',
      badge: 'Alerta Supply Chain',
      defaultType: 'bar',
      xKey: 'product',
      primaryKey: 'inStock',
      primaryLabel: 'Estoque Atual (un)',
      primaryColor: '#f43f5e',
      secondaryKey: 'reorderLevel',
      secondaryLabel: 'Nível Mínimo (Reorder)',
      secondaryColor: '#f59e0b',
      referenceTarget: { value: 20, label: 'Faixa de Segurança (20 un)', color: '#10b981' },
      data: [
        { product: 'Gorgonzola Telino', inStock: 0, reorderLevel: 20, onOrder: 70 },
        { product: 'Sir Rodney Scones', inStock: 3, reorderLevel: 5, onOrder: 40 },
        { product: 'Louisiana Pepper', inStock: 4, reorderLevel: 20, onOrder: 70 },
        { product: 'Longlife Tofu', inStock: 4, reorderLevel: 5, onOrder: 20 },
        { product: 'Rogede sild', inStock: 5, reorderLevel: 15, onOrder: 70 },
        { product: 'Scottish Shortbread', inStock: 6, reorderLevel: 15, onOrder: 10 },
        { product: 'Chang Beer', inStock: 17, reorderLevel: 25, onOrder: 40 }
      ]
    },
    highlights: [
      { label: 'Campeão de Faturamento', value: 'Côte de Blaye ($141.4k)', detail: 'Preço unitário $263.50 • Representa 11.2% da receita global', status: 'positive' },
      { label: 'Campeão em Volume Físico', value: 'Camembert Pierrot (1.577 un)', detail: 'Seguido por Raclette Courdavault (1.496 unidades)', status: 'info' },
      { label: 'Alerta de Ruptura Imediata', value: 'Gorgonzola & Pepper Sauce', detail: 'Estoque abaixo de 5 unidades com pedidos em trânsito', status: 'critical' }
    ],
    table: {
      columns: [
        { key: 'product_name', label: 'Produto' },
        { key: 'category_name', label: 'Categoria' },
        { key: 'unit_price', label: 'Preço Unit.' },
        { key: 'units_in_stock', label: 'Estoque' },
        { key: 'reorder_level', label: 'Mínimo' },
        { key: 'units_on_order', label: 'Em Compra' },
        { key: 'status', label: 'Status Operacional' }
      ],
      rows: [
        { product_name: 'Côte de Blaye', category_name: 'Beverages', unit_price: '$263.50', units_in_stock: 17, reorder_level: 15, units_on_order: 0, status: 'Curva A • Saudável' },
        { product_name: 'Raclette Courdavault', category_name: 'Dairy Products', unit_price: '$55.00', units_in_stock: 79, reorder_level: 0, units_on_order: 0, status: 'Curva A • Saudável' },
        { product_name: 'Camembert Pierrot', category_name: 'Dairy Products', unit_price: '$34.00', units_in_stock: 19, reorder_level: 0, units_on_order: 0, status: 'Alto Giro' },
        { product_name: 'Chang', category_name: 'Beverages', unit_price: '$19.00', units_in_stock: 17, reorder_level: 25, units_on_order: 40, status: 'Reposição em Trânsito' },
        { product_name: 'Gorgonzola Telino', category_name: 'Dairy Products', unit_price: '$12.50', units_in_stock: 0, reorder_level: 20, units_on_order: 70, status: 'Ruptura Crítica' },
        { product_name: 'Louisiana Hot Spiced Okra', category_name: 'Condiments', unit_price: '$17.00', units_in_stock: 4, reorder_level: 20, units_on_order: 100, status: 'Ruptura Crítica' }
      ]
    },
    suggestedPrompts: [
      'Quais produtos estão com estoque baixo ou parados?',
      'Quais são os 10 produtos com maior faturamento?',
      'Quais produtos pertencem à categoria Beverages?'
    ]
  },

  employees: {
    pageId: 'employees',
    kpis: [
      { title: 'Força de Vendas Ativa', value: '9 Executivos', change: 'USA & UK Hubs', isPositive: true, icon: 'UserCheck', color: 'brand' },
      { title: 'Vendedora #1 em Receita', value: 'Margaret Peacock', change: '$232,890.85 (18.4%)', isPositive: true, icon: 'Award', color: 'emerald' },
      { title: 'Média de Pedidos / Executivo', value: '92.2 Pedidos', change: '+11.5% Produtividade', isPositive: true, icon: 'ShoppingCart', color: 'purple' },
      { title: 'Maior Ticket Médio Individual', value: '$1,842.60', change: 'Robert King (UK)', isPositive: true, icon: 'DollarSign', color: 'amber' }
    ],
    storytelling: {
      badge: 'STORYTELLING • PERFORMANCE DA FORÇA DE VENDAS & QUOTA ATTAINMENT',
      headline: 'Top 3 executivas geram 51% das vendas; escritório de Londres tem maior ticket médio, mas menor volume',
      storyContext: 'A equipe comercial da Northwind é dividida entre o hub de Seattle/Redmond (EUA, 5 executivos) e o hub de Londres (Reino Unido, 4 executivos).',
      keyFinding: 'Margaret Peacock ($232.9k, 156 pedidos), Janet Leverling ($202.8k, 127 pedidos) e Nancy Davolio ($192.1k, 123 pedidos) superaram a cota anual de $150k com folga.',
      businessImpact: 'Os representantes do hub UK (Michael Suyama, Anne Dodsworth e Steven Buchanan) fecham pedidos com ticket alto, mas têm 55% menos frequência de visitas que o hub EUA.',
      recommendedAction: 'Replicar o playbook de cadência comercial de Margaret Peacock no escritório de Londres para elevar a conversão trimestral em +20%.',
      harnessSkill: 'sales_force_quota_analyzer',
      harnessModel: 'gemini-4-neon',
      harnessEffort: 'medium',
      tokenSavingsPct: 65
    },
    primaryChart: {
      title: 'Ranking de Faturamento por Executivo vs. Meta Anual ($140k)',
      subtitle: 'Receita líquida fechada por vendedor comparada à linha de meta corporativa',
      badge: 'Quota Attainment',
      defaultType: 'composed',
      xKey: 'employee',
      primaryKey: 'sales',
      primaryLabel: 'Vendas Líquidas ($)',
      primaryColor: '#10b981',
      secondaryKey: 'orders',
      secondaryLabel: 'Pedidos Fechados',
      secondaryColor: '#3b82f6',
      unitPrefix: '$',
      referenceTarget: { value: 140000, label: 'Meta Individual ($140k)', color: '#f59e0b' },
      data: [
        { employee: 'M. Peacock', sales: 232891, orders: 156, avgTicket: 1493, segment: 'top' },
        { employee: 'J. Leverling', sales: 202813, orders: 127, avgTicket: 1597, segment: 'top' },
        { employee: 'N. Davolio', sales: 192108, orders: 123, avgTicket: 1562, segment: 'top' },
        { employee: 'A. Fuller (VP)', sales: 166538, orders: 96, avgTicket: 1735, segment: 'top' },
        { employee: 'L. Callahan', sales: 126862, orders: 104, avgTicket: 1220, segment: 'growth' },
        { employee: 'R. King', sales: 124568, orders: 72, avgTicket: 1730, segment: 'growth' },
        { employee: 'A. Dodsworth', sales: 77308, orders: 43, avgTicket: 1798, segment: 'risk' },
        { employee: 'M. Suyama', sales: 73913, orders: 67, avgTicket: 1103, segment: 'risk' },
        { employee: 'S. Buchanan', sales: 68792, orders: 42, avgTicket: 1638, segment: 'risk' }
      ]
    },
    secondaryChart: {
      title: 'Ticket Médio por Pedido ($) por Executivo Comercial',
      subtitle: 'Eficiência de valor capturado por transação fechada',
      badge: 'Qualidade de Venda',
      defaultType: 'bar',
      xKey: 'employee',
      primaryKey: 'avgTicket',
      primaryLabel: 'Ticket Médio ($)',
      primaryColor: '#8b5cf6',
      unitPrefix: '$',
      referenceTarget: { value: 1525, label: 'Média Global ($1,525)', color: '#06b6d4' },
      data: [
        { employee: 'A. Dodsworth', avgTicket: 1798 },
        { employee: 'A. Fuller', avgTicket: 1735 },
        { employee: 'R. King', avgTicket: 1730 },
        { employee: 'S. Buchanan', avgTicket: 1638 },
        { employee: 'J. Leverling', avgTicket: 1597 },
        { employee: 'N. Davolio', avgTicket: 1562 },
        { employee: 'M. Peacock', avgTicket: 1493 },
        { employee: 'L. Callahan', avgTicket: 1220 }
      ]
    },
    highlights: [
      { label: 'Líder Absoluta de Vendas', value: 'Margaret Peacock ($232.9k)', detail: '166% de atingimento de meta • 156 pedidos concluídos', status: 'positive' },
      { label: 'Maior Ticket por Pedido', value: 'Anne Dodsworth ($1,798)', detail: 'Foco em contas premium de bebidas e laticínios no Reino Unido', status: 'info' },
      { label: 'Oportunidade de Coaching', value: 'Hub Londres (3 Executivos)', detail: 'Aumentar volume de prospecção mantendo o alto ticket médio', status: 'warning' }
    ],
    table: {
      columns: [
        { key: 'full_name', label: 'Executivo' },
        { key: 'title', label: 'Cargo' },
        { key: 'city', label: 'Base' },
        { key: 'total_orders', label: 'Pedidos' },
        { key: 'total_sales', label: 'Faturamento Gerado' },
        { key: 'quota_pct', label: '% da Meta' }
      ],
      rows: [
        { full_name: 'Margaret Peacock', title: 'Sales Representative', city: 'Redmond (USA)', total_orders: 156, total_sales: '$232,890.85', quota_pct: '166.4%' },
        { full_name: 'Janet Leverling', title: 'Sales Representative', city: 'Kirkland (USA)', total_orders: 127, total_sales: '$202,812.84', quota_pct: '144.9%' },
        { full_name: 'Nancy Davolio', title: 'Sales Representative', city: 'Seattle (USA)', total_orders: 123, total_sales: '$192,107.60', quota_pct: '137.2%' },
        { full_name: 'Andrew Fuller', title: 'Vice President, Sales', city: 'Tacoma (USA)', total_orders: 96, total_sales: '$166,537.76', quota_pct: '119.0%' },
        { full_name: 'Laura Callahan', title: 'Inside Sales Coordinator', city: 'Seattle (USA)', total_orders: 104, total_sales: '$126,862.28', quota_pct: '90.6%' },
        { full_name: 'Robert King', title: 'Sales Representative', city: 'London (UK)', total_orders: 72, total_sales: '$124,568.23', quota_pct: '89.0%' },
        { full_name: 'Anne Dodsworth', title: 'Sales Representative', city: 'London (UK)', total_orders: 43, total_sales: '$77,308.07', quota_pct: '55.2%' }
      ]
    },
    suggestedPrompts: [
      'Quais vendedores tiveram maior faturamento?',
      'Quantos pedidos Margaret Peacock fechou?',
      'Compare o desempenho dos vendedores dos EUA e Reino Unido.'
    ]
  },

  categories: {
    pageId: 'categories',
    kpis: [
      { title: 'Categorias de Catálogo', value: '8 Linhas', change: '77 SKUs Totais', isPositive: true, icon: 'Layers', color: 'brand' },
      { title: 'Categoria Líder (Receita)', value: 'Beverages', change: '$267,868.18 (21.2%)', isPositive: true, icon: 'Award', color: 'emerald' },
      { title: '2ª Maior Categoria', value: 'Dairy Products', change: '$234,507.29 (18.5%)', isPositive: true, icon: 'Package', color: 'purple' },
      { title: 'Maior Margem Bruta Média', value: '38.4%', change: 'Confections & Beverages', isPositive: true, icon: 'TrendingUp', color: 'amber' }
    ],
    storytelling: {
      badge: 'STORYTELLING • MIX DE CATEGORIAS & RENTABILIDADE POR LINHA',
      headline: 'Beverages, Dairy Products e Confections respondem por 53% de todo o faturamento da Northwind',
      storyContext: 'O portfólio gastronômico está estruturado em 8 famílias de produtos, desde bebidas finas e laticínios artesanais até frutos do mar e cereais.',
      keyFinding: 'Beverages ($267.8k) e Dairy Products ($234.5k) tracionam a receita principal, enquanto Confections (13 SKUs) é a categoria campeã de cross-sell em cestas de compras (presente em 41% dos pedidos).',
      businessImpact: 'A categoria Grains/Cereals ($95.7k) possui a menor penetração internacional, representando oportunidade de expansão de mix em clientes que já compram Dairy.',
      recommendedAction: 'Ativar recomendação automática via motor Jev IA pareando Queijos (Dairy) com Pães/Biscoitos (Grains/Cereals) e Vinhos/Chás (Beverages) com Confections.',
      harnessSkill: 'category_mix_profitability_skill',
      harnessModel: 'gemini-4-hydrogen',
      harnessEffort: 'low',
      tokenSavingsPct: 86
    },
    primaryChart: {
      title: 'Faturamento Líquido ($) vs. Volume de Pedidos por Categoria',
      subtitle: 'Desempenho consolidado das 8 categorias gastronômicas da Northwind',
      badge: 'Mix de Receita • Composed',
      defaultType: 'composed',
      xKey: 'category',
      primaryKey: 'revenue',
      primaryLabel: 'Receita Líquida ($)',
      primaryColor: '#3b82f6',
      secondaryKey: 'orders',
      secondaryLabel: 'Pedidos com a Categoria',
      secondaryColor: '#f59e0b',
      unitPrefix: '$',
      data: [
        { category: 'Beverages', revenue: 267868, orders: 404, skus: 12, segment: 'top' },
        { category: 'Dairy Products', revenue: 234507, orders: 366, skus: 10, segment: 'top' },
        { category: 'Confections', revenue: 167357, orders: 334, skus: 13, segment: 'top' },
        { category: 'Meat/Poultry', revenue: 163022, orders: 173, skus: 6, segment: 'growth' },
        { category: 'Seafood', revenue: 131262, orders: 330, skus: 12, segment: 'growth' },
        { category: 'Condiments', revenue: 106047, orders: 216, skus: 12, segment: 'growth' },
        { category: 'Produce', revenue: 99985, orders: 136, skus: 5, segment: 'risk' },
        { category: 'Grains/Cereals', revenue: 95745, orders: 196, skus: 7, segment: 'risk' }
      ]
    },
    secondaryChart: {
      title: 'Participação Percentual no Faturamento Global (Market Share Interno)',
      subtitle: 'Distribuição proporcional de receita entre as 8 categorias',
      badge: 'Share de Receita',
      defaultType: 'pie',
      xKey: 'category',
      primaryKey: 'revenue',
      primaryLabel: 'Receita ($)',
      primaryColor: '#10b981',
      unitPrefix: '$',
      data: [
        { category: 'Beverages', revenue: 267868 },
        { category: 'Dairy Products', revenue: 234507 },
        { category: 'Confections', revenue: 167357 },
        { category: 'Meat/Poultry', revenue: 163022 },
        { category: 'Seafood', revenue: 131262 },
        { category: 'Condiments', revenue: 106047 },
        { category: 'Produce', revenue: 99985 },
        { category: 'Grains/Cereals', revenue: 95745 }
      ]
    },
    highlights: [
      { label: 'Maior Receita por SKU', value: 'Meat/Poultry ($27.1k/SKU)', detail: 'Apenas 6 produtos geram $163k em vendas', status: 'positive' },
      { label: 'Âncora de Cross-Sell', value: 'Confections (13 SKUs)', detail: 'Maior taxa de compra casada com Beverages (Chás & Cafés)', status: 'info' },
      { label: 'Potencial de Expansão', value: 'Produce & Grains', detail: 'Apenas 12 SKUs somados; espaço para novos fornecedores', status: 'warning' }
    ],
    table: {
      columns: [
        { key: 'category_name', label: 'Categoria' },
        { key: 'description', label: 'Especialidade Gastronômica' },
        { key: 'total_products', label: 'Qtd SKUs' },
        { key: 'total_orders', label: 'Pedidos' },
        { key: 'total_revenue', label: 'Receita Líquida' },
        { key: 'share', label: 'Share (%)' }
      ],
      rows: [
        { category_name: 'Beverages', description: 'Soft drinks, coffees, teas, beers, and fine wines', total_products: 12, total_orders: 404, total_revenue: '$267,868.18', share: '21.2%' },
        { category_name: 'Dairy Products', description: 'Artisan cheeses and gourmet dairy specialties', total_products: 10, total_orders: 366, total_revenue: '$234,507.29', share: '18.5%' },
        { category_name: 'Confections', description: 'Desserts, candies, chocolates, and sweet breads', total_products: 13, total_orders: 334, total_revenue: '$167,357.23', share: '13.2%' },
        { category_name: 'Meat/Poultry', description: 'Prepared meats and European charcuterie', total_products: 6, total_orders: 173, total_revenue: '$163,022.36', share: '12.9%' },
        { category_name: 'Seafood', description: 'Seaweed, caviar, smoked salmon, and fish', total_products: 12, total_orders: 330, total_revenue: '$131,261.74', share: '10.4%' },
        { category_name: 'Condiments', description: 'Sweet and savory sauces, relishes, spreads, and seasonings', total_products: 12, total_orders: 216, total_revenue: '$106,047.09', share: '8.4%' },
        { category_name: 'Produce', description: 'Dried fruit, organic apples, and bean curd', total_products: 5, total_orders: 136, total_revenue: '$99,984.58', share: '7.9%' },
        { category_name: 'Grains/Cereals', description: 'Breads, crackers, pasta, and cereal', total_products: 7, total_orders: 196, total_revenue: '$95,744.59', share: '7.5%' }
      ]
    },
    suggestedPrompts: [
      'Qual categoria vende mais em volume e valor?',
      'Compare o faturamento de Beverages e Dairy Products.',
      'Qual categoria possui o maior ticket médio?'
    ]
  },

  suppliers: {
    pageId: 'suppliers',
    kpis: [
      { title: 'Parceiros Fornecedores', value: '29 Empresas', change: '16 Países de Origem', isPositive: true, icon: 'Truck', color: 'brand' },
      { title: 'Fornecedor #1 em Receita', value: 'Aux joyeux ecclés.', change: '$153,691.20 (França)', isPositive: true, icon: 'Award', color: 'emerald' },
      { title: 'Concentração Top 5', value: '44.2%', change: 'Risco Moderado', isPositive: true, icon: 'Globe', color: 'purple' },
      { title: 'Lead Time Médio Suprimento', value: '6.8 Dias', change: '-0.9 dias vs 1997', isPositive: true, icon: 'Package', color: 'amber' }
    ],
    storytelling: {
      badge: 'STORYTELLING • RESILIÊNCIA DE SUPPLY CHAIN & DEPENDÊNCIA DE FORNECEDORES',
      headline: 'Os 3 maiores fornecedores europeus sustentam 33% do faturamento total da Northwind',
      storyContext: 'A cadeia de suprimentos conecta 29 produtores artesanais na Europa, América do Norte, Ásia-Pacífico e América do Sul.',
      keyFinding: 'Aux joyeux ecclésiastiques (França, $153.7k), Plutzer Lebensmittelgroßmärkte AG (Alemanha, $145.3k) e Gai pâturage (França, $117.9k) são os pilares de receita das linhas Beverages, Meat e Dairy.',
      businessImpact: 'A alta dependência de produtores franceses (21,4% do faturamento total da Northwind) exige estoque pulmão para mitigar variações cambiais ou greves portuárias.',
      recommendedAction: 'Homologar fornecedor secundário para vinhos e queijos maturados e estabelecer contrato de fornecimento trimestral com a Plutzer AG.',
      harnessSkill: 'supply_chain_vendor_risk_skill',
      harnessModel: 'gemini-4-neon',
      harnessEffort: 'medium',
      tokenSavingsPct: 66
    },
    primaryChart: {
      title: 'Top Fornecedores por Receita Gerada no Catálogo Northwind ($)',
      subtitle: 'Volume financeiro movimentado pelos produtos de cada parceiro fornecedor',
      badge: 'Vendor Revenue Impact',
      defaultType: 'composed',
      xKey: 'supplier',
      primaryKey: 'revenue',
      primaryLabel: 'Receita Vinculada ($)',
      primaryColor: '#06b6d4',
      secondaryKey: 'skus',
      secondaryLabel: 'SKUs Fornecidos',
      secondaryColor: '#8b5cf6',
      unitPrefix: '$',
      data: [
        { supplier: 'Aux joyeux (FR)', revenue: 153691, skus: 2, segment: 'top' },
        { supplier: 'Plutzer AG (DE)', revenue: 145372, skus: 5, segment: 'top' },
        { supplier: 'Gai pâturage (FR)', revenue: 117981, skus: 2, segment: 'top' },
        { supplier: 'Pavlova Ltd (AU)', revenue: 63670, skus: 5, segment: 'growth' },
        { supplier: 'G\'day, Mate (AU)', revenue: 63218, skus: 3, segment: 'growth' },
        { supplier: 'Forêts d\'érables (CA)', revenue: 60472, skus: 2, segment: 'growth' },
        { supplier: 'Pasta Buttini (IT)', revenue: 52028, skus: 2, segment: 'risk' }
      ]
    },
    secondaryChart: {
      title: 'Distribuição da Cadeia de Suprimentos por Região Geográfica',
      subtitle: 'Receita suportada por continente/país de origem dos fornecedores',
      badge: 'Sourcing Global',
      defaultType: 'pie',
      xKey: 'region',
      primaryKey: 'revenue',
      primaryLabel: 'Receita ($)',
      primaryColor: '#f59e0b',
      unitPrefix: '$',
      data: [
        { region: 'França (3 Fornec.)', revenue: 282140 },
        { region: 'Alemanha (3 Fornec.)', revenue: 194520 },
        { region: 'EUA & Canadá (6 Fornec.)', revenue: 218490 },
        { region: 'Austrália & Ásia (6 Fornec.)', revenue: 198310 },
        { region: 'Reino Unido & Nórdicos (6 Fornec.)', revenue: 179830 },
        { region: 'Itália & Sul Europa (5 Fornec.)', revenue: 192503 }
      ]
    },
    highlights: [
      { label: 'Parceiro Mais Estratégico', value: 'Aux joyeux ecclésiastiques', detail: 'Fornecedor de Côte de Blaye e Chartreuse verte ($153.7k)', status: 'positive' },
      { label: 'Maior Diversidade de Catálogo', value: 'Plutzer AG & Pavlova (5 SKUs)', detail: 'Mix completo de carnes, cervejas, condimentos e doces', status: 'info' },
      { label: 'Risco de Single-Sourcing', value: 'França (21.4% da Receita)', detail: '2 fornecedores concentram os 3 produtos mais rentáveis', status: 'warning' }
    ],
    table: {
      columns: [
        { key: 'company_name', label: 'Fornecedor' },
        { key: 'contact_name', label: 'Contato Comercial' },
        { key: 'country', label: 'País Origem' },
        { key: 'skus_count', label: 'SKUs' },
        { key: 'revenue_generated', label: 'Receita Gerada' },
        { key: 'reliability', label: 'Score SLA' }
      ],
      rows: [
        { company_name: 'Aux joyeux ecclésiastiques', contact_name: 'Guylène Nodier', country: 'France', skus_count: 2, revenue_generated: '$153,691.20', reliability: '98.5% (Elite)' },
        { company_name: 'Plutzer Lebensmittelgroßmärkte AG', contact_name: 'Martin Bein', country: 'Germany', skus_count: 5, revenue_generated: '$145,372.40', reliability: '97.2% (Elite)' },
        { company_name: 'Gai pâturage', contact_name: 'Eliane Noz', country: 'France', skus_count: 2, revenue_generated: '$117,981.00', reliability: '96.8% (Elite)' },
        { company_name: 'Pavlova, Ltd.', contact_name: 'Ian Devling', country: 'Australia', skus_count: 5, revenue_generated: '$63,670.10', reliability: '94.5% (Bom)' },
        { company_name: 'G\'day, Mate', contact_name: 'Wendy Mackenzie', country: 'Australia', skus_count: 3, revenue_generated: '$63,218.00', reliability: '95.1% (Bom)' },
        { company_name: 'Forêts d\'érables', contact_name: 'Chantal Goulet', country: 'Canada', skus_count: 2, revenue_generated: '$60,472.30', reliability: '96.0% (Elite)' }
      ]
    },
    suggestedPrompts: [
      'Quais fornecedores atendem o maior catálogo de produtos?',
      'Quais fornecedores geram maior receita para a Northwind?',
      'Quais produtos são fornecidos pela Plutzer AG?'
    ]
  },

  sales: {
    pageId: 'sales',
    kpis: [
      { title: 'Volume Global de Vendas', value: '$1,265,793.04', change: '+22.4% YoY', isPositive: true, icon: 'TrendingUp', color: 'brand' },
      { title: 'Unidades Físicas Vendidas', value: '51,317 un', change: '+16.8% YoY', isPositive: true, icon: 'Package', color: 'purple' },
      { title: 'Crescimento Trimestral (QoQ)', value: '+19.3%', change: 'Q1 1998 Recorde', isPositive: true, icon: 'DollarSign', color: 'emerald' },
      { title: 'Itens Médios por Pedido', value: '2.59 SKUs', change: '+0.4 Cross-sell', isPositive: true, icon: 'ShoppingCart', color: 'amber' }
    ],
    storytelling: {
      badge: 'STORYTELLING • ACELERAÇÃO COMERCIAL & SAZONALIDADE DE VENDAS',
      headline: 'O 1º Quadrimestre de 1998 atingiu recorde histórico de $445k (+38% sobre o mesmo período de 1997)',
      storyContext: 'A curva de vendas da Northwind mostra uma transição clara de consolidação em 1997 para forte aceleração comercial no início de 1998.',
      keyFinding: 'O pico histórico ocorreu em Abril/1998 ($123.798 em um único mês), impulsionado pela expansão de pedidos recorrentes nos EUA, Alemanha e Áustria.',
      businessImpact: 'A velocidade de vendas (Run-Rate) do 1º trimestre de 1998 projeta um faturamento anualizado superior a $1,45M caso o estoque de Curva A seja mantido.',
      recommendedAction: 'Antecipar compras de estoque sazonal em 45 dias antes dos picos de Março/Abril e Novembro/Dezembro.',
      harnessSkill: 'time_series_sales_momentum_skill',
      harnessModel: 'gemini-4-neon',
      harnessEffort: 'medium',
      tokenSavingsPct: 62
    },
    primaryChart: {
      title: 'Série Temporal de Vendas Mensais ($ USD) & Volume de Unidades',
      subtitle: 'Evolução mensal do faturamento líquido e aceleração de demanda física (Set/97 a Abr/98)',
      badge: 'Tendência Mensal • Area',
      defaultType: 'area',
      xKey: 'period',
      primaryKey: 'sales',
      primaryLabel: 'Vendas Líquidas ($)',
      primaryColor: '#3b82f6',
      secondaryKey: 'units',
      secondaryLabel: 'Unidades Vendidas',
      secondaryColor: '#10b981',
      unitPrefix: '$',
      referenceTarget: { value: 85000, label: 'Meta Mensal ($85k)', color: '#f59e0b' },
      data: [
        { period: 'Set/97', sales: 55629, units: 2340, orders: 55, segment: 'growth' },
        { period: 'Out/97', sales: 66749, units: 2810, orders: 67, segment: 'growth' },
        { period: 'Nov/97', sales: 43533, units: 1890, orders: 54, segment: 'risk' },
        { period: 'Dez/97', sales: 71398, units: 3020, orders: 78, segment: 'top' },
        { period: 'Jan/98', sales: 94222, units: 3890, orders: 84, segment: 'top' },
        { period: 'Fev/98', sales: 99415, units: 4120, orders: 82, segment: 'top' },
        { period: 'Mar/98', sales: 104854, units: 4410, orders: 97, segment: 'top' },
        { period: 'Abr/98', sales: 123799, units: 5180, orders: 104, segment: 'top' }
      ]
    },
    secondaryChart: {
      title: 'Vendas por País de Destino (Top 7 Mercados Globais)',
      subtitle: 'Comparativo de receita acumulada e número de pedidos por país',
      badge: 'Mercados Internacionais',
      defaultType: 'composed',
      xKey: 'country',
      primaryKey: 'revenue',
      primaryLabel: 'Receita ($)',
      primaryColor: '#6366f1',
      secondaryKey: 'orders',
      secondaryLabel: 'Pedidos',
      secondaryColor: '#06b6d4',
      unitPrefix: '$',
      data: [
        { country: 'USA', revenue: 245840, orders: 122 },
        { country: 'Germany', revenue: 230284, orders: 122 },
        { country: 'Austria', revenue: 128003, orders: 40 },
        { country: 'Brazil', revenue: 106926, orders: 83 },
        { country: 'France', revenue: 81358, orders: 77 },
        { country: 'UK', revenue: 58971, orders: 56 },
        { country: 'Venezuela', revenue: 56810, orders: 46 }
      ]
    },
    highlights: [
      { label: 'Mês Recorde da História', value: 'Abril/1998 ($123.8k)', detail: '104 pedidos fechados (+45.6% acima da meta mensal)', status: 'positive' },
      { label: 'Liderança Binacional', value: 'EUA & Alemanha (37.6%)', detail: 'Juntos somam $476.1k e 244 pedidos embarcados', status: 'info' },
      { label: 'Maior Ticket Internacional', value: 'Áustria ($3,200/pedido)', detail: '40 pedidos geraram $128.0k em faturamento líquido', status: 'positive' }
    ],
    table: {
      columns: [
        { key: 'country', label: 'País de Destino' },
        { key: 'orders', label: 'Total Pedidos' },
        { key: 'units_sold', label: 'Unidades' },
        { key: 'revenue', label: 'Receita Líquida' },
        { key: 'avg_ticket', label: 'Ticket Médio' },
        { key: 'yoy_growth', label: 'Crescimento YoY' }
      ],
      rows: [
        { country: 'USA', orders: 122, units_sold: 9330, revenue: '$245,840.40', avg_ticket: '$2,015.08', yoy_growth: '+24.1%' },
        { country: 'Germany', orders: 122, units_sold: 9213, revenue: '$230,284.63', avg_ticket: '$1,887.58', yoy_growth: '+21.8%' },
        { country: 'Austria', orders: 40, units_sold: 5167, revenue: '$128,003.84', avg_ticket: '$3,200.10', yoy_growth: '+29.4%' },
        { country: 'Brazil', orders: 83, units_sold: 4247, revenue: '$106,925.78', avg_ticket: '$1,288.26', yoy_growth: '+24.6%' },
        { country: 'France', orders: 77, units_sold: 3254, revenue: '$81,358.32', avg_ticket: '$1,056.60', yoy_growth: '+15.2%' },
        { country: 'UK', orders: 56, units_sold: 2742, revenue: '$58,971.31', avg_ticket: '$1,053.06', yoy_growth: '+12.7%' }
      ]
    },
    suggestedPrompts: [
      'Qual foi a evolução temporal de vendas por país?',
      'Qual mês teve o maior volume de vendas?',
      'Compare as vendas entre EUA, Alemanha e Brasil.'
    ]
  },

  revenue: {
    pageId: 'revenue',
    kpis: [
      { title: 'Faturamento Bruto Total', value: '$1,354,458.59', change: '+19.8% YoY', isPositive: true, icon: 'DollarSign', color: 'brand' },
      { title: 'Faturamento Líquido Real', value: '$1,265,793.04', change: '93.5% Realização', isPositive: true, icon: 'Award', color: 'emerald' },
      { title: 'Total Concedido em Descontos', value: '$88,665.55', change: '6.5% Taxa Média', isPositive: true, icon: 'TrendingUp', color: 'amber' },
      { title: 'Margem Líquida Pós-Frete', value: '$1,200,850.35', change: '+20.1% YoY', isPositive: true, icon: 'ShoppingCart', color: 'purple' }
    ],
    storytelling: {
      badge: 'STORYTELLING • ENGENHARIA DE RECEITA, DESCONTOS & PROTEÇÃO DE MARGEM',
      headline: 'Descontos comerciais consomem 6,5% da receita bruta ($88.6k), com excesso na categoria Beverages',
      storyContext: 'A reconciliação financeira entre Faturamento Bruto ($1,354M) e Faturamento Líquido ($1,265M) revela onde a política de descontos (0% a 25%) gera elasticidade real vs. erosão de margem.',
      keyFinding: 'Produtos de alta demanda inelástica como Côte de Blaye tiveram $12.100 concedidos em descontos desnecessários, enquanto em Confections o desconto de 10% aumentou o volume do pedido em 2,8x.',
      businessImpact: 'Limitar o desconto máximo em SKUs Curva A (estoque restrito) para 5% recuperaria +$28.400/ano diretamente no EBITDA sem perda de volume.',
      recommendedAction: 'Implementar trava de alçada na política de descontos: > 10% permitido apenas para combos multi-categoria ou pedidos acima de $3.500.',
      harnessSkill: 'revenue_margin_waterfall_skill',
      harnessModel: 'gemini-4-neon',
      harnessEffort: 'medium',
      tokenSavingsPct: 61
    },
    primaryChart: {
      title: 'Faturamento Bruto vs. Faturamento Líquido & Erosão por Desconto ($)',
      subtitle: 'Decomposição financeira por categoria: quanto do valor bruto é retido como receita líquida',
      badge: 'Gross-to-Net Revenue',
      defaultType: 'bar',
      xKey: 'category',
      primaryKey: 'grossRevenue',
      primaryLabel: 'Receita Bruta ($)',
      primaryColor: '#6366f1',
      secondaryKey: 'netRevenue',
      secondaryLabel: 'Receita Líquida ($)',
      secondaryColor: '#10b981',
      unitPrefix: '$',
      data: [
        { category: 'Beverages', grossRevenue: 286526, netRevenue: 267868, discountCost: 18658, segment: 'top' },
        { category: 'Dairy Products', grossRevenue: 251330, netRevenue: 234507, discountCost: 16823, segment: 'top' },
        { category: 'Confections', grossRevenue: 177099, netRevenue: 167357, discountCost: 9742, segment: 'top' },
        { category: 'Meat/Poultry', grossRevenue: 178189, netRevenue: 163022, discountCost: 15167, segment: 'risk' },
        { category: 'Seafood', grossRevenue: 141623, netRevenue: 131262, discountCost: 10361, segment: 'growth' },
        { category: 'Condiments', grossRevenue: 113695, netRevenue: 106047, discountCost: 7648, segment: 'growth' },
        { category: 'Produce', grossRevenue: 105268, netRevenue: 99985, discountCost: 5283, segment: 'growth' },
        { category: 'Grains/Cereals', grossRevenue: 100727, netRevenue: 95745, discountCost: 4982, segment: 'growth' }
      ]
    },
    secondaryChart: {
      title: 'Impacto de Descontos Concedidos por Categoria ($ USD)',
      subtitle: 'Volume financeiro abdicado em descontos promocionais por linha de produto',
      badge: 'Auditoria de Descontos',
      defaultType: 'bar',
      xKey: 'category',
      primaryKey: 'discountCost',
      primaryLabel: 'Desconto Concedido ($)',
      primaryColor: '#f59e0b',
      unitPrefix: '$',
      referenceTarget: { value: 10000, label: 'Teto Orçamentário Desconto ($10k)', color: '#f43f5e' },
      data: [
        { category: 'Beverages', discountCost: 18658 },
        { category: 'Dairy Products', discountCost: 16823 },
        { category: 'Meat/Poultry', discountCost: 15167 },
        { category: 'Seafood', discountCost: 10361 },
        { category: 'Confections', discountCost: 9742 },
        { category: 'Condiments', discountCost: 7648 },
        { category: 'Produce', discountCost: 5283 },
        { category: 'Grains/Cereals', discountCost: 4982 }
      ]
    },
    highlights: [
      { label: 'Retenção Bruto-Líquido', value: '93.45% de Realização', detail: 'Apenas 6.55% de desconto médio ponderado na operação global', status: 'positive' },
      { label: 'Maior Erosão Nominal', value: 'Beverages ($18.6k desc.)', detail: 'Oportunidade de reduzir descontos em vinhos premium de alta procura', status: 'warning' },
      { label: 'Melhor Proteção de Preço', value: 'Grains & Produce (~5.0%)', detail: 'Baixa necessidade de desconto para fechamento de pedidos', status: 'info' }
    ],
    table: {
      columns: [
        { key: 'category', label: 'Categoria' },
        { key: 'gross', label: 'Faturamento Bruto' },
        { key: 'discount', label: 'Descontos ($)' },
        { key: 'discount_pct', label: '% Desconto' },
        { key: 'net', label: 'Faturamento Líquido' },
        { key: 'policy_status', label: 'Governança de Preço' }
      ],
      rows: [
        { category: 'Beverages', gross: '$286,526.00', discount: '$18,657.82', discount_pct: '6.51%', net: '$267,868.18', policy_status: 'Revisar Alçada Curva A' },
        { category: 'Dairy Products', gross: '$251,330.50', discount: '$16,823.21', discount_pct: '6.69%', net: '$234,507.29', policy_status: 'Dentro da Meta' },
        { category: 'Confections', gross: '$177,099.10', discount: '$9,741.87', discount_pct: '5.50%', net: '$167,357.23', policy_status: 'Ótima Elasticidade' },
        { category: 'Meat/Poultry', gross: '$178,188.80', discount: '$15,166.44', discount_pct: '8.51%', net: '$163,022.36', policy_status: 'Acima do Teto (8.5%)' },
        { category: 'Seafood', gross: '$141,623.09', discount: '$10,361.35', discount_pct: '7.32%', net: '$131,261.74', policy_status: 'Monitorar' },
        { category: 'Condiments', gross: '$113,694.75', discount: '$7,647.66', discount_pct: '6.73%', net: '$106,047.09', policy_status: 'Dentro da Meta' }
      ]
    },
    suggestedPrompts: [
      'Compare o faturamento líquido e descontos por categoria.',
      'Qual categoria concede mais descontos em valor absoluto?',
      'Qual o impacto dos descontos no faturamento total?'
    ]
  },

  kpis: {
    pageId: 'kpis',
    kpis: [
      { title: 'Atingimento OKR Receita', value: '112.8%', change: '+$145.7k vs Meta', isPositive: true, icon: 'Award', color: 'emerald' },
      { title: 'Atingimento Ticket Médio', value: '107.5%', change: '$1,525 vs $1,418', isPositive: true, icon: 'DollarSign', color: 'brand' },
      { title: 'SLA Logístico Global', value: '95.5%', change: 'Meta: 95.0%', isPositive: true, icon: 'Truck', color: 'purple' },
      { title: 'Score Geral de Saúde (BI)', value: '94.2 / 100', change: 'Rating AAA', isPositive: true, icon: 'Sparkles', color: 'amber' }
    ],
    storytelling: {
      badge: 'STORYTELLING • SCORECARD C-LEVEL & CUMPRIMENTO DE OKRs CORPORATIVOS',
      headline: '5 de 6 OKRs estratégicos superaram a meta anual; disponibilidade de estoque Curva A é o único ponto de atenção',
      storyContext: 'O painel C-Level consolida os indicadores-chave de desempenho (OKRs) pactuados pelo conselho da Northwind nas dimensões Financeira, Clientes, Processos Internos e Aprendizado/IA.',
      keyFinding: 'Receita Líquida (112,8% da meta), Retenção de Clientes (110,7%) e Ticket Médio (107,5%) operam em zona de excelência. O indicador de Cobertura de Estoque sem Ruptura está em 91,7% (meta: 96%).',
      businessImpact: 'A sincronização entre a camada Gold (dbt) e o Orquestrador de IA reduziu o tempo de resposta a decisões executivas de 2 dias para < 2 segundos.',
      recommendedAction: 'Manter a política comercial atual e focar o sprint operacional na reposição automatizada dos 18 SKUs com baixo saldo.',
      harnessSkill: 'c_level_okr_scorecard_skill',
      harnessModel: 'gemini-4-hydrogen',
      harnessEffort: 'low',
      tokenSavingsPct: 89
    },
    primaryChart: {
      title: 'Atingimento de Metas OKR por Pilar Estratégico (% da Meta Anual)',
      subtitle: 'Comparativo percentual de execução real contra o alvo corporativo (100% = Meta Atingida)',
      badge: 'OKR Scorecard (%)',
      defaultType: 'bar',
      xKey: 'kpi',
      primaryKey: 'achievement',
      primaryLabel: 'Atingimento (%)',
      primaryColor: '#10b981',
      secondaryKey: 'target',
      secondaryLabel: 'Meta Base (%)',
      secondaryColor: '#64748b',
      unitSuffix: '%',
      referenceTarget: { value: 100, label: 'Alvo 100% OKR', color: '#f59e0b' },
      data: [
        { kpi: 'Faturamento Global', achievement: 112.8, target: 100, segment: 'top' },
        { kpi: 'Retenção Clientes', achievement: 110.7, target: 100, segment: 'top' },
        { kpi: 'Ticket Médio', achievement: 107.5, target: 100, segment: 'top' },
        { kpi: 'Margem Líquida', achievement: 104.2, target: 100, segment: 'top' },
        { kpi: 'SLA Entrega (OTD)', achievement: 100.5, target: 100, segment: 'growth' },
        { kpi: 'Estoque sem Ruptura', achievement: 91.7, target: 100, segment: 'risk' }
      ]
    },
    secondaryChart: {
      title: 'Radar Multidimensional de Saúde Corporativa Northwind (0 a 100)',
      subtitle: 'Equilíbrio entre Crescimento, Rentabilidade, Logística, Retenção, Governança IA e Estoque',
      badge: 'Balanced Scorecard Radar',
      defaultType: 'radar',
      xKey: 'dimension',
      primaryKey: 'score',
      primaryLabel: 'Score Atual',
      primaryColor: '#3b82f6',
      secondaryKey: 'benchmark',
      secondaryLabel: 'Benchmark Setor',
      secondaryColor: '#8b5cf6',
      data: [
        { dimension: 'Crescimento', score: 96, benchmark: 82 },
        { dimension: 'Margem', score: 93, benchmark: 85 },
        { dimension: 'Retenção LTV', score: 95, benchmark: 80 },
        { dimension: 'SLA Logístico', score: 95, benchmark: 90 },
        { dimension: 'Governança IA', score: 100, benchmark: 75 },
        { dimension: 'Saúde Estoque', score: 86, benchmark: 88 }
      ]
    },
    highlights: [
      { label: 'OKR Financeiro Superado', value: '112.8% da Meta Anual', detail: 'Superávit de +$145.7k sobre o orçamento planejado', status: 'positive' },
      { label: 'Governança de Dados & IA', value: '100% Conformidade', detail: '16 testes dbt aprovados + 0 violações AST SQL', status: 'positive' },
      { label: 'Único OKR Abaixo de 100%', value: 'Disponibilidade SKU (91.7%)', detail: 'Plano de ação ativo para zerar ruptura de estoque', status: 'warning' }
    ],
    table: {
      columns: [
        { key: 'metric', label: 'Indicador Estratégico (OKR)' },
        { key: 'value', label: 'Realizado' },
        { key: 'target', label: 'Meta Corporativa' },
        { key: 'status', label: 'Status de Atingimento' }
      ],
      rows: [
        { metric: 'Faturamento Líquido Global', value: '$1,265,793.04', target: '$1,120,000.00', status: '112.8% (Superada)' },
        { metric: 'Ticket Médio por Pedido', value: '$1,525.05', target: '$1,418.00', status: '107.5% (Superada)' },
        { metric: 'Taxa de Retenção de Clientes', value: '68.4%', target: '61.8%', status: '110.7% (Superada)' },
        { metric: 'On-Time Delivery (SLA Logístico)', value: '95.5%', target: '95.0%', status: '100.5% (Atingida)' },
        { metric: 'Disponibilidade de Catálogo (Zero Ruptura)', value: '76.6%', target: '83.5%', status: '91.7% (Em Recuperação)' }
      ]
    },
    suggestedPrompts: [
      'Apresente uma análise executiva de cumprimento de metas.',
      'Quais indicadores estratégicos superaram a meta?',
      'Onde está o principal gargalo operacional da Northwind?'
    ]
  },

  analysis: {
    pageId: 'analysis',
    kpis: [
      { title: 'Afinidade de Cesta (Lift)', value: '2.84x Lift', change: 'Beverages + Confections', isPositive: true, icon: 'TrendingUp', color: 'emerald' },
      { title: 'Retenção Coorte Mês 6', value: '64.2%', change: '+5.8% vs Benchmark', isPositive: true, icon: 'Users', color: 'brand' },
      { title: 'Elasticidade-Preço Média', value: '-1.42', change: 'Alta Resposta Promo', isPositive: true, icon: 'DollarSign', color: 'purple' },
      { title: 'Correlação Frete vs. Peso', value: 'r = 0.89', change: 'Forte Linearidade', isPositive: true, icon: 'Award', color: 'amber' }
    ],
    storytelling: {
      badge: 'STORYTELLING • MARKET BASKET AFFINITY, COORTES & ELASTICIDADE',
      headline: 'Clientes que compram ≥ 3 categorias diferentes possuem LTV 3,4x maior e churn quase zero',
      storyContext: 'A análise estatística multivariada sobre 609k registros históricos e 830 pedidos avalia o comportamento de co-ocorrência de produtos (Market Basket) e retenção por coorte.',
      keyFinding: 'O par [Beverages + Confections] possui Lift de 2,84x e o par [Dairy Products + Grains/Cereals] possui Lift de 2,61x. Contas monocategoria têm 42% de chance de inatividade após a 2ª compra.',
      businessImpact: 'Aumentar o número médio de categorias por pedido de 2,1 para 2,8 eleva o ticket médio em +$410 por transação.',
      recommendedAction: 'Utilizar os scores de afinidade na equipe de Inside Sales e no checkout da Loja Jev IA para sugerir a 3ª categoria complementar.',
      harnessSkill: 'multivariate_cohort_affinity_skill',
      harnessModel: 'gemini-4-argon',
      harnessEffort: 'high',
      tokenSavingsPct: 35
    },
    primaryChart: {
      title: 'Impacto da Diversidade de Categorias no LTV do Cliente ($ USD) & Retenção (%)',
      subtitle: 'Relação entre quantas categorias distintas o cliente compra, seu gasto anual e probabilidade de retenção',
      badge: 'Cross-Category LTV • Composed',
      defaultType: 'composed',
      xKey: 'bucket',
      primaryKey: 'avgLtv',
      primaryLabel: 'LTV Médio Anual ($)',
      primaryColor: '#8b5cf6',
      secondaryKey: 'retentionRate',
      secondaryLabel: 'Taxa de Retenção (%)',
      secondaryColor: '#10b981',
      unitPrefix: '$',
      data: [
        { bucket: '1 Categoria', avgLtv: 3420, retentionRate: 42, customers: 14, segment: 'risk' },
        { bucket: '2 Categorias', avgLtv: 7850, retentionRate: 58, customers: 22, segment: 'growth' },
        { bucket: '3 Categorias', avgLtv: 14920, retentionRate: 76, customers: 24, segment: 'top' },
        { bucket: '4 Categorias', avgLtv: 24680, retentionRate: 88, customers: 16, segment: 'top' },
        { bucket: '5+ Categorias', avgLtv: 48950, retentionRate: 96, customers: 13, segment: 'top' }
      ]
    },
    secondaryChart: {
      title: 'Top Pares de Co-ocorrência (Market Basket Lift Score)',
      subtitle: 'Multiplicador de probabilidade de compra conjunta entre pares de categorias (Lift > 1.0 = Sinergia)',
      badge: 'Afinidade de Cesta',
      defaultType: 'bar',
      xKey: 'pair',
      primaryKey: 'lift',
      primaryLabel: 'Lift Score (x)',
      primaryColor: '#06b6d4',
      referenceTarget: { value: 1.5, label: 'Limiar Forte Sinergia (1.5x)', color: '#f59e0b' },
      data: [
        { pair: 'Beverages + Confections', lift: 2.84, confidence: 68 },
        { pair: 'Dairy + Grains/Cereals', lift: 2.61, confidence: 64 },
        { pair: 'Meat + Condiments', lift: 2.38, confidence: 59 },
        { pair: 'Seafood + Condiments', lift: 2.12, confidence: 54 },
        { pair: 'Dairy + Beverages', lift: 1.95, confidence: 51 },
        { pair: 'Produce + Dairy', lift: 1.74, confidence: 46 }
      ]
    },
    highlights: [
      { label: 'Maior Sinergia de Cesta', value: 'Beverages + Confections (2.84x)', detail: '68% de confiança de compra conjunta em pedidos gourmet', status: 'positive' },
      { label: 'Alavanca de Retenção', value: 'Barreira das 3 Categorias', detail: 'Retenção salta de 58% para 76% ao introduzir a 3ª categoria', status: 'info' },
      { label: 'Segmento Vulnerável', value: '14 Clientes Monocategoria', detail: 'Alto risco de churn (58%); priorizar oferta de cross-sell', status: 'warning' }
    ],
    table: {
      columns: [
        { key: 'dimension', label: 'Dimensão Analítica' },
        { key: 'finding', label: 'Descoberta Estatística' },
        { key: 'metric_proof', label: 'Evidência / Métrica' },
        { key: 'impact', label: 'Impacto Estratégico' }
      ],
      rows: [
        { dimension: 'Market Basket (Beverages + Confections)', finding: 'Clientes de chás/cafés compram biscoitos finos 2.84x acima da média', metric_proof: 'Lift = 2.84 | Confiança = 68%', impact: 'Alto (+Ticket)' },
        { dimension: 'Market Basket (Dairy + Grains)', finding: 'Queijos europeus puxam pães e massas artesanais na mesma cesta', metric_proof: 'Lift = 2.61 | Confiança = 64%', impact: 'Alto (+Cross-sell)' },
        { dimension: 'Coorte Multi-Categoria', finding: 'Contas com ≥ 4 categorias têm retenção anual de 88% a 96%', metric_proof: 'LTV 3.4x superior à média', impact: 'Crítico (Retenção)' },
        { dimension: 'Logística (Speedy Express)', finding: 'Entregas intra-continentais são 2.1 dias mais rápidas e 19% mais baratas', metric_proof: 'p-value < 0.01 (ANOVA)', impact: 'Alto (Margem)' }
      ]
    },
    suggestedPrompts: [
      'Quais as principais correlações e oportunidades analíticas?',
      'Quais categorias têm maior afinidade de compra conjunta?',
      'Como o número de categorias impacta a retenção de clientes?'
    ]
  },

  forecasting: {
    pageId: 'forecasting',
    kpis: [
      { title: 'Receita Projetada (Próx. Trim.)', value: '$368,400.00', change: '+16.4% vs Trim. Ant.', isPositive: true, icon: 'TrendingUp', color: 'emerald' },
      { title: 'Demanda Física Estimada', value: '14,820 un', change: '+1,940 unidades', isPositive: true, icon: 'Package', color: 'brand' },
      { title: 'Acurácia do Modelo (Backtest)', value: '94.2%', change: 'MAPE = 5.8% | R² = 0.94', isPositive: true, icon: 'Award', color: 'purple' },
      { title: 'Risco Preditivo de Ruptura', value: '6 SKUs Críticos', change: 'Janela de 21 dias', isPositive: false, icon: 'Sparkles', color: 'amber' }
    ],
    storytelling: {
      badge: 'STORYTELLING • TIME-SERIES FORECASTING & PLANEJAMENTO DE DEMANDA',
      headline: 'Projeção indica crescimento de +16,4% no próximo trimestre ($368.4k), exigindo reforço de estoque em Dairy e Beverages',
      storyContext: 'O modelo preditivo combina decomposição de tendência e sazonalidade histórica da Northwind com intervalos de confiança de 95% para os próximos 4 meses.',
      keyFinding: 'A trajetória ascendente iniciada em Jan-Abr/1998 projeta vendas mensais entre $118k e $129k nos meses seguintes, com limite inferior conservador acima de $109k/mês.',
      businessImpact: 'Sem reabastecimento preventivo, a demanda projetada esgotará o estoque atual de Côte de Blaye, Chang e Camembert Pierrot em 19 dias.',
      recommendedAction: 'Aprovar orçamento de compras de $48.000 para reforçar o estoque das categorias Beverages e Dairy Products antes do início do próximo mês.',
      harnessSkill: 'predictive_demand_forecaster_skill',
      harnessModel: 'gemini-4-argon',
      harnessEffort: 'high',
      tokenSavingsPct: 38
    },
    primaryChart: {
      title: 'Histórico Real vs. Projeção Preditiva de Receita ($ USD) & Limite Superior',
      subtitle: 'Série histórica realizada e curva projetada pelo modelo de IA com banda superior de confiança (95%)',
      badge: 'Forecast IA (R² = 0.94)',
      defaultType: 'area',
      xKey: 'period',
      primaryKey: 'expectedRevenue',
      primaryLabel: 'Receita Real / Projetada ($)',
      primaryColor: '#10b981',
      secondaryKey: 'upperBound',
      secondaryLabel: 'Cenário Otimista IC 95% ($)',
      secondaryColor: '#3b82f6',
      unitPrefix: '$',
      referenceTarget: { value: 100000, label: 'Patamar $100k/mês', color: '#f59e0b' },
      data: [
        { period: 'Jan (Real)', expectedRevenue: 94222, upperBound: 94222, lowerBound: 94222, segment: 'top' },
        { period: 'Fev (Real)', expectedRevenue: 99415, upperBound: 99415, lowerBound: 99415, segment: 'top' },
        { period: 'Mar (Real)', expectedRevenue: 104854, upperBound: 104854, lowerBound: 104854, segment: 'top' },
        { period: 'Abr (Real)', expectedRevenue: 123799, upperBound: 123799, lowerBound: 123799, segment: 'top' },
        { period: 'Mês +1 (Proj)', expectedRevenue: 118500, upperBound: 126200, lowerBound: 110800, segment: 'growth' },
        { period: 'Mês +2 (Proj)', expectedRevenue: 121800, upperBound: 130400, lowerBound: 113200, segment: 'growth' },
        { period: 'Mês +3 (Proj)', expectedRevenue: 128100, upperBound: 138500, lowerBound: 117700, segment: 'growth' }
      ]
    },
    secondaryChart: {
      title: 'Demanda Física Projetada vs. Estoque Atual por Categoria (Unidades)',
      subtitle: 'Identificação de déficit de cobertura de estoque para atender os próximos 60 dias',
      badge: 'Gap de Demanda vs. Estoque',
      defaultType: 'composed',
      xKey: 'category',
      primaryKey: 'projectedDemand',
      primaryLabel: 'Demanda 60d (un)',
      primaryColor: '#8b5cf6',
      secondaryKey: 'currentStock',
      secondaryLabel: 'Estoque Atual (un)',
      secondaryColor: '#06b6d4',
      data: [
        { category: 'Beverages', projectedDemand: 2850, currentStock: 559 },
        { category: 'Dairy Products', projectedDemand: 2640, currentStock: 393 },
        { category: 'Confections', projectedDemand: 2190, currentStock: 386 },
        { category: 'Seafood', projectedDemand: 1920, currentStock: 701 },
        { category: 'Condiments', projectedDemand: 1480, currentStock: 507 },
        { category: 'Meat/Poultry', projectedDemand: 1290, currentStock: 165 }
      ]
    },
    highlights: [
      { label: 'Trimestre Projetado', value: '$368,400 (+16.4%)', detail: 'Intervalo de confiança de 95%: [$341.7k — $395.1k]', status: 'positive' },
      { label: 'Maior Pressão de Demanda', value: 'Dairy & Meat/Poultry', detail: 'Cobertura atual de estoque dura apenas 14 dias de vendas', status: 'critical' },
      { label: 'Confiabilidade Estatística', value: 'MAPE 5.8% (Erro Baixo)', detail: 'Validação cruzada sobre 22 meses do histórico Northwind', status: 'info' }
    ],
    table: {
      columns: [
        { key: 'period', label: 'Horizonte Temporal' },
        { key: 'projected_sales', label: 'Receita Projetada (Base)' },
        { key: 'confidence_interval', label: 'Intervalo IC 95%' },
        { key: 'projected_units', label: 'Volume Físico' },
        { key: 'trend', label: 'Tendência & Ação' }
      ],
      rows: [
        { period: 'Mês +1 (Curto Prazo)', projected_sales: '$118,500.00', confidence_interval: '± $7,700.00', projected_units: '4,740 un', trend: 'Alta (+15.4% YoY) • Reforçar Curva A' },
        { period: 'Mês +2 (Médio Prazo)', projected_sales: '$121,800.00', confidence_interval: '± $8,600.00', projected_units: '4,890 un', trend: 'Alta (+16.1% YoY) • Expandir Cross-sell' },
        { period: 'Mês +3 (Trimestral)', projected_sales: '$128,100.00', confidence_interval: '± $10,400.00', projected_units: '5,190 un', trend: 'Pico Sazonal (+17.8% YoY) • Slot Logístico' }
      ]
    },
    suggestedPrompts: [
      'Qual a projeção de receita e demanda para o próximo trimestre?',
      'Quais categorias terão maior déficit de estoque nos próximos 60 dias?',
      'Qual o intervalo de confiança da previsão de vendas?'
    ]
  },

  insights: {
    pageId: 'insights',
    kpis: [
      { title: 'Potencial Total Mapeado (ROI)', value: '+$148,500/ano', change: '6 Alavancas IA', isPositive: true, icon: 'Sparkles', color: 'emerald' },
      { title: 'Oportunidade Cross-Sell', value: '+$54,200/ano', change: 'Combos Jev IA', isPositive: true, icon: 'DollarSign', color: 'brand' },
      { title: 'Economia em Descontos', value: '+$28,400/ano', change: 'Trava Alçada Curva A', isPositive: true, icon: 'Award', color: 'purple' },
      { title: 'Prevenção de Churn VIP', value: '+$42,000/ano', change: '7 Contas Mid-Tier', isPositive: true, icon: 'Users', color: 'amber' }
    ],
    storytelling: {
      badge: 'STORYTELLING • SÍNTESE EXECUTIVA DE AGENTES & PLANO DE CRESCIMENTO ($ ROI)',
      headline: 'Os agentes de IA mapearam $148.500 em ganho líquido anual combinando Cross-Sell, Precificação e Retenção',
      storyContext: 'O Business Insight Agent cruzou os dados de vendas, descontos, ruptura de estoque e SLA logístico para priorizar ações pelo maior retorno financeiro (ROI) e menor esforço operacional.',
      keyFinding: 'As 3 maiores alavancas imediatas são: (1) Cross-sell automatizado Beverages + Confections (+$54.2k), (2) Reativação de 7 contas Mid-Tier (+$42.0k) e (3) Trava de desconto de 5% em itens Curva A (+$28.4k).',
      businessImpact: 'A execução combinada dessas recomendações eleva a margem operacional da Northwind em +11,7% sem aumento de custo fixo.',
      recommendedAction: 'Executar as 3 ações Quick-Win (Esforço Baixo / Impacto Alto) nas próximas 2 semanas com acompanhamento pelo Scorecard de KPIs.',
      harnessSkill: 'executive_roi_insight_synthesizer',
      harnessModel: 'gemini-4-neon',
      harnessEffort: 'medium',
      tokenSavingsPct: 67
    },
    primaryChart: {
      title: 'Impacto Financeiro Anual Estimado por Recomendação da IA ($ USD)',
      subtitle: 'Ranking de retorno financeiro potencial (ROI) vs. score de confiança do agente (0-100%)',
      badge: 'ROI por Iniciativa • Composed',
      defaultType: 'composed',
      xKey: 'initiative',
      primaryKey: 'roiUsd',
      primaryLabel: 'Ganho Anual Estimado ($)',
      primaryColor: '#10b981',
      secondaryKey: 'confidence',
      secondaryLabel: 'Confiança IA (%)',
      secondaryColor: '#3b82f6',
      unitPrefix: '$',
      data: [
        { initiative: 'Cross-Sell Jev IA', roiUsd: 54200, confidence: 94, segment: 'top' },
        { initiative: 'Retenção 7 Contas', roiUsd: 42000, confidence: 89, segment: 'top' },
        { initiative: 'Trava Desconto 5%', roiUsd: 28400, confidence: 96, segment: 'top' },
        { initiative: 'Zero Ruptura SKU', roiUsd: 18400, confidence: 92, segment: 'growth' },
        { initiative: 'Otimização Frete', roiUsd: 5500, confidence: 88, segment: 'growth' }
      ]
    },
    secondaryChart: {
      title: 'Distribuição do Ganho Potencial por Área de Negócio',
      subtitle: 'Participação de cada frente estratégica na geração de valor (+$148.5k)',
      badge: 'Alavancas de Valor',
      defaultType: 'pie',
      xKey: 'area',
      primaryKey: 'roiUsd',
      primaryLabel: 'Potencial ($)',
      primaryColor: '#8b5cf6',
      unitPrefix: '$',
      data: [
        { area: 'Expansão Cross-Sell', roiUsd: 54200 },
        { area: 'CRM & Retenção VIP', roiUsd: 42000 },
        { area: 'Pricing & Descontos', roiUsd: 28400 },
        { area: 'Estoque & Ruptura', roiUsd: 18400 },
        { area: 'Eficiência de Frete', roiUsd: 5500 }
      ]
    },
    highlights: [
      { label: 'Quick-Win #1 (Pricing)', value: '+$28,400/ano em Margem', detail: 'Limitar desconto em Côte de Blaye e Raclette a no máximo 5%', status: 'positive' },
      { label: 'Quick-Win #2 (Comercial)', value: '+$54,200/ano em Cross-Sell', detail: 'Ofertar Confections em todo pedido de Beverages (Lift 2.84x)', status: 'positive' },
      { label: 'Quick-Win #3 (CRM)', value: '+$42,000/ano Recuperados', detail: 'Contato ativo do time comercial com 7 contas sem compra há 75d', status: 'info' }
    ],
    table: {
      columns: [
        { key: 'insight_title', label: 'Insight Estratégico Gerado pela IA' },
        { key: 'category', label: 'Área' },
        { key: 'estimated_roi', label: 'Impacto Anual ($)' },
        { key: 'effort', label: 'Esforço' },
        { key: 'recommendation', label: 'Plano de Ação Recomendado' }
      ],
      rows: [
        { insight_title: 'Combos Cross-Sell (Beverages + Confections)', category: 'Vendas & Jev IA', estimated_roi: '+$54,200', effort: 'Baixo (Quick-Win)', recommendation: 'Ativar sugestão automática no checkout e script de vendas' },
        { insight_title: 'Blindagem e Reativação de 7 Contas Mid-Tier', category: 'CRM & Clientes', estimated_roi: '+$42,000', effort: 'Baixo (Quick-Win)', recommendation: 'Oferecer condição de frete Speedy Express na próxima compra' },
        { insight_title: 'Governança de Alçada de Descontos (Curva A)', category: 'Pricing & Receita', estimated_roi: '+$28,400', effort: 'Baixo (Quick-Win)', recommendation: 'Travar desconto máximo em 5% para SKUs com alta demanda' },
        { insight_title: 'Reposição Automática de 18 SKUs Abaixo do Mínimo', category: 'Supply Chain', estimated_roi: '+$18,400', effort: 'Médio', recommendation: 'Disparar Purchase Orders automáticas quando estoque <= Reorder' },
        { insight_title: 'Rebalanceamento de Cargas Pesadas (>100kg)', category: 'Logística', estimated_roi: '+$5,500', effort: 'Médio', recommendation: 'Priorizar Federal Shipping em rotas críticas para atingir 96% OTD' }
      ]
    },
    suggestedPrompts: [
      'Quais são os 3 principais insights de negócio para alavancar receita?',
      'Qual iniciativa gera maior retorno financeiro com menor esforço?',
      'Como recuperar margem na política de descontos?'
    ]
  },

  admin: {
    pageId: 'admin',
    kpis: [
      { title: 'Economia FinOps do Harness', value: '71.4%', change: 'Downgrade by Default', isPositive: true, icon: 'Sparkles', color: 'emerald' },
      { title: 'Bloqueios Gate AST (sqlglot)', value: '100% Seguro', change: '0 SQL Injections', isPositive: true, icon: 'Award', color: 'brand' },
      { title: 'Latência Média MCP Server', value: '11.8 ms', change: 'P99 < 28ms', isPositive: true, icon: 'TrendingUp', color: 'purple' },
      { title: 'Disponibilidade Microserviços', value: '99.98%', change: '8 Containers Ativos', isPositive: true, icon: 'Settings', color: 'amber' }
    ],
    storytelling: {
      badge: 'STORYTELLING • OBSERVABILIDADE DO HARNESS GEMINI 4, FINOPS & MCP SECURITY',
      headline: 'O Roteador Cognitivo economiza 71,4% do custo de tokens distribuindo tarefas entre Nível 0, Hydrogen, Neon e Argon',
      storyContext: 'A arquitetura do sistema opera sob o protocolo do Agente Orquestrador (Clean Architecture + MCP), roteando cada subtarefa para o menor tier capaz e validando 100% das saídas SQL via AST (sqlglot).',
      keyFinding: '82% das requisições são resolvidas entre o Nível 0 (Templates/AST a custo zero) e o Tier Baixo (gemini-4-hydrogen), reservando o gemini-4-neon (15%) para joins analíticos e o gemini-4-argon (3%) apenas para Circuit Breaker e análises multivariadas.',
      businessImpact: 'Redução de 3,5x no custo operacional de LLM mantendo 99,4% de precisão analítica graças ao Gate Determinístico e aos Hints Pós-Tool.',
      recommendedAction: 'Manter o limiar do protocolo de Handoff ativo em 350k tokens e monitorar eventos de escalonamento do Circuit Breaker via correlation_id.',
      harnessSkill: 'harness_finops_observability_skill',
      harnessModel: 'deterministic-template',
      harnessEffort: 'low',
      tokenSavingsPct: 100
    },
    primaryChart: {
      title: 'Telemetria FinOps: Distribuição de Requisições (%) vs. Custo Relativo por Tier do Harness',
      subtitle: 'Volume de chamadas roteadas para cada tier do Gemini 4 comparado ao peso de custo por milhão de tokens',
      badge: 'FinOps Model Router',
      defaultType: 'composed',
      xKey: 'tier',
      primaryKey: 'requestsShare',
      primaryLabel: '% das Requisições',
      primaryColor: '#06b6d4',
      secondaryKey: 'relativeCost',
      secondaryLabel: 'Peso de Custo (%)',
      secondaryColor: '#f59e0b',
      unitSuffix: '%',
      data: [
        { tier: 'Nível 0 (Zero-LLM)', requestsShare: 34, relativeCost: 0, latencyMs: 2, segment: 'top' },
        { tier: 'Hydrogen (Low)', requestsShare: 48, relativeCost: 12, latencyMs: 180, segment: 'top' },
        { tier: 'Neon (Medium)', requestsShare: 15, relativeCost: 38, latencyMs: 420, segment: 'growth' },
        { tier: 'Argon (High/CB)', requestsShare: 3, relativeCost: 100, latencyMs: 890, segment: 'risk' }
      ]
    },
    secondaryChart: {
      title: 'Latência Média de Resposta por Microserviço / Componente (ms)',
      subtitle: 'Tempo médio de execução de cada camada da plataforma Northwind AI (meta < 50ms para infraestrutura)',
      badge: 'SLO & Latência (ms)',
      defaultType: 'bar',
      xKey: 'service',
      primaryKey: 'latencyMs',
      primaryLabel: 'Latência (ms)',
      primaryColor: '#10b981',
      referenceTarget: { value: 25, label: 'SLO Infraestrutura (25ms)', color: '#6366f1' },
      data: [
        { service: 'AST Gate (sqlglot)', latencyMs: 1.4 },
        { service: 'Redis Session Cache', latencyMs: 2.1 },
        { service: 'Nginx Gateway', latencyMs: 3.5 },
        { service: 'FastAPI Backend', latencyMs: 8.2 },
        { service: 'MCP Tool Server', latencyMs: 11.8 },
        { service: 'PostgreSQL Star Schema', latencyMs: 14.6 }
      ]
    },
    highlights: [
      { label: 'Economia FinOps Comprovada', value: '71.4% Menos Custo LLM', detail: '82% das tarefas resolvidas em Nível 0 ou gemini-4-hydrogen', status: 'positive' },
      { label: 'Circuit Breaker Self-Healing', value: '100% Recuperação', detail: 'Escalonamento automático Hydrogen -> Neon -> Argon em 1 falha', status: 'info' },
      { label: 'Segurança Sintática AST', value: '0 Vazamentos / 0 DDL', detail: 'Validador sqlglot bloqueia múltiplos statements e mutações', status: 'positive' }
    ],
    table: {
      columns: [
        { key: 'service', label: 'Componente / Microserviço' },
        { key: 'port', label: 'Porta / Tier' },
        { key: 'status', label: 'Status' },
        { key: 'protocol', label: 'Contrato & Governança no Harness' }
      ],
      rows: [
        { service: 'Harness Cognitive Router', port: 'Tier 0..3', status: 'Healthy', protocol: 'Downgrade by Default + Circuit Breaker + JSON Plan' },
        { service: 'AST Security Gate (sqlglot)', port: 'Nível 0', status: 'Healthy', protocol: 'Single-Statement SELECT/UNION Validator' },
        { service: 'MCP Tool Server', port: '8001', status: 'Healthy', protocol: 'Model Context Protocol (Header chat-id isolado)' },
        { service: 'Multi-Agent Orchestrator', port: '8002', status: 'Healthy', protocol: 'FastAPI Async + Working Memory + Post-Tool Hints' },
        { service: 'FastAPI BFF Backend', port: '8000', status: 'Healthy', protocol: 'REST OpenAPI + Prometheus Exporter' },
        { service: 'PostgreSQL 15 (Medallion dbt)', port: '5432', status: 'Healthy', protocol: 'Bronze / Silver Star Schema / Gold Marts (16 dbt tests)' },
        { service: 'Session & Handoff Governor', port: '350k limiar', status: 'Healthy', protocol: 'Handoff automático antes da degradação de contexto' }
      ]
    },
    suggestedPrompts: [
      'Qual o status de saúde dos microserviços e latência do MCP?',
      'Como funciona o roteamento FinOps entre Hydrogen, Neon e Argon?',
      'Como o validador AST protege contra SQL Injection?'
    ]
  }
};
