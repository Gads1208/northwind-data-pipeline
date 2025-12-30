# Queries SQL úteis para análise no BigQuery

-- ========================================
-- QUERIES DE VALIDAÇÃO
-- ========================================

-- 1. Verificar quantidade de registros em cada camada
SELECT 
  'Bronze - Customers' as table_name,
  COUNT(*) as record_count
FROM `{project_id}.northwind_bronze.bronze_customers`
UNION ALL
SELECT 
  'Silver - Dim Customers' as table_name,
  COUNT(*) as record_count
FROM `{project_id}.northwind_silver.silver_dim_customers`
UNION ALL
SELECT 
  'Gold - Sales by Country' as table_name,
  COUNT(*) as record_count
FROM `{project_id}.northwind_gold.gold_sales_by_country`;

-- 2. Verificar freshness dos dados (últimas 24h)
SELECT 
  'Bronze Orders' as layer,
  MAX(_airbyte_emitted_at) as last_update,
  TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), MAX(_airbyte_emitted_at), HOUR) as hours_since_update
FROM `{project_id}.northwind_bronze.bronze_orders`
UNION ALL
SELECT 
  'Silver Fact Orders' as layer,
  MAX(dw_updated_at) as last_update,
  TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), MAX(dw_updated_at), HOUR) as hours_since_update
FROM `{project_id}.northwind_silver.silver_fact_orders`;

-- ========================================
-- QUERIES DE ANÁLISE - GOLD LAYER
-- ========================================

-- 3. Top 10 países por receita
SELECT 
  country,
  total_revenue,
  total_orders,
  total_customers,
  avg_order_value,
  revenue_per_customer
FROM `{project_id}.northwind_gold.gold_sales_by_country`
ORDER BY total_revenue DESC
LIMIT 10;

-- 4. Performance por categoria de produto
SELECT 
  category_name,
  total_revenue,
  total_units_sold,
  total_products,
  revenue_per_order,
  ROUND(total_revenue / total_units_sold, 2) as revenue_per_unit
FROM `{project_id}.northwind_gold.gold_sales_by_category`
ORDER BY total_revenue DESC;

-- 5. Top 10 vendedores (funcionários)
SELECT 
  full_name,
  title,
  total_sales,
  total_orders,
  total_customers_served,
  on_time_delivery_rate,
  years_of_service
FROM `{project_id}.northwind_gold.gold_employee_performance`
ORDER BY total_sales DESC
LIMIT 10;

-- 6. Segmentação de clientes
SELECT 
  customer_segment,
  activity_status,
  COUNT(*) as customer_count,
  SUM(total_spent) as total_revenue,
  AVG(total_spent) as avg_customer_value,
  AVG(total_orders) as avg_orders_per_customer
FROM `{project_id}.northwind_gold.gold_customer_analytics`
GROUP BY customer_segment, activity_status
ORDER BY customer_segment, activity_status;

-- 7. Clientes em risco (At Risk ou Inactive com alto valor)
SELECT 
  company_name,
  contact_name,
  country,
  total_spent,
  total_orders,
  last_order_date,
  days_since_last_order,
  activity_status
FROM `{project_id}.northwind_gold.gold_customer_analytics`
WHERE activity_status IN ('At Risk', 'Inactive')
  AND total_spent > 5000
ORDER BY total_spent DESC;

-- 8. Top 20 produtos por receita
SELECT 
  product_name,
  category_name,
  supplier_name,
  total_revenue,
  total_units_sold,
  performance_tier,
  is_discontinued
FROM `{project_id}.northwind_gold.gold_product_performance`
ORDER BY total_revenue DESC
LIMIT 20;

-- ========================================
-- QUERIES ANALÍTICAS AVANÇADAS
-- ========================================

-- 9. Análise de tendência de vendas por mês
SELECT 
  FORMAT_DATE('%Y-%m', order_date) as year_month,
  COUNT(DISTINCT order_id) as total_orders,
  SUM(order_total) as total_revenue,
  AVG(order_total) as avg_order_value,
  COUNT(DISTINCT customer_id) as unique_customers
FROM `{project_id}.northwind_silver.silver_fact_orders`
WHERE order_date IS NOT NULL
GROUP BY year_month
ORDER BY year_month;

-- 10. Taxa de desconto por categoria
SELECT 
  p.category_name,
  COUNT(DISTINCT od.order_id) as orders_with_discount,
  SUM(od.unit_price * od.quantity) as revenue_before_discount,
  SUM(od.unit_price * od.quantity * (1 - od.discount)) as revenue_after_discount,
  SUM(od.unit_price * od.quantity * od.discount) as total_discount,
  ROUND(AVG(od.discount) * 100, 2) as avg_discount_pct
FROM `{project_id}.northwind_bronze.bronze_order_details` od
JOIN `{project_id}.northwind_silver.silver_dim_products` p 
  ON od.product_id = p.product_id
WHERE od.discount > 0
GROUP BY p.category_name
ORDER BY total_discount DESC;

-- 11. Análise de cohort de clientes (por mês de primeira compra)
WITH customer_cohorts AS (
  SELECT 
    customer_id,
    FORMAT_DATE('%Y-%m', MIN(order_date)) as cohort_month,
    MIN(order_date) as first_order_date
  FROM `{project_id}.northwind_silver.silver_fact_orders`
  GROUP BY customer_id
)
SELECT 
  cohort_month,
  COUNT(DISTINCT cc.customer_id) as cohort_size,
  SUM(o.order_total) as cohort_revenue,
  AVG(o.order_total) as avg_order_value,
  COUNT(DISTINCT o.order_id) as total_orders
FROM customer_cohorts cc
JOIN `{project_id}.northwind_silver.silver_fact_orders` o 
  ON cc.customer_id = o.customer_id
GROUP BY cohort_month
ORDER BY cohort_month;

-- 12. Produtos que precisam reposição
SELECT 
  product_name,
  category_name,
  units_in_stock,
  units_on_order,
  reorder_level,
  (reorder_level - units_in_stock) as units_to_order,
  total_units_sold,
  ROUND(units_in_stock / NULLIF(total_units_sold / 30, 0), 1) as days_of_stock
FROM `{project_id}.northwind_gold.gold_product_performance`
WHERE units_in_stock < reorder_level
  AND is_discontinued = FALSE
ORDER BY (reorder_level - units_in_stock) DESC;

-- 13. Análise de eficiência de entrega
SELECT 
  CASE 
    WHEN days_to_ship <= 3 THEN '1-3 days'
    WHEN days_to_ship <= 7 THEN '4-7 days'
    WHEN days_to_ship <= 14 THEN '8-14 days'
    ELSE '15+ days'
  END as shipping_time_bucket,
  COUNT(*) as order_count,
  AVG(order_total) as avg_order_value,
  SUM(order_total) as total_revenue
FROM `{project_id}.northwind_silver.silver_fact_orders`
WHERE shipped_date IS NOT NULL
GROUP BY shipping_time_bucket
ORDER BY 
  CASE shipping_time_bucket
    WHEN '1-3 days' THEN 1
    WHEN '4-7 days' THEN 2
    WHEN '8-14 days' THEN 3
    ELSE 4
  END;

-- 14. Cross-selling analysis (produtos frequentemente comprados juntos)
WITH product_pairs AS (
  SELECT 
    od1.product_id as product_a,
    od2.product_id as product_b,
    COUNT(DISTINCT od1.order_id) as times_bought_together
  FROM `{project_id}.northwind_bronze.bronze_order_details` od1
  JOIN `{project_id}.northwind_bronze.bronze_order_details` od2
    ON od1.order_id = od2.order_id
    AND od1.product_id < od2.product_id
  GROUP BY product_a, product_b
  HAVING times_bought_together >= 3
)
SELECT 
  p1.product_name as product_a_name,
  p2.product_name as product_b_name,
  pp.times_bought_together,
  p1.category_name as category_a,
  p2.category_name as category_b
FROM product_pairs pp
JOIN `{project_id}.northwind_silver.silver_dim_products` p1 
  ON pp.product_a = p1.product_id
JOIN `{project_id}.northwind_silver.silver_dim_products` p2 
  ON pp.product_b = p2.product_id
ORDER BY times_bought_together DESC
LIMIT 20;

-- 15. Customer Lifetime Value (CLV) projection
SELECT 
  customer_id,
  company_name,
  country,
  total_spent as historical_ltv,
  total_orders,
  avg_order_value,
  days_since_last_order,
  CASE 
    WHEN days_since_last_order <= 30 THEN avg_order_value * 12  -- Active: project 12 more orders
    WHEN days_since_last_order <= 90 THEN avg_order_value * 6   -- At Risk: project 6 more
    ELSE avg_order_value * 2                                     -- Inactive: project 2 more
  END as projected_future_value,
  total_spent + CASE 
    WHEN days_since_last_order <= 30 THEN avg_order_value * 12
    WHEN days_since_last_order <= 90 THEN avg_order_value * 6
    ELSE avg_order_value * 2
  END as total_clv_projection
FROM `{project_id}.northwind_gold.gold_customer_analytics`
WHERE total_orders > 0
ORDER BY total_clv_projection DESC;
