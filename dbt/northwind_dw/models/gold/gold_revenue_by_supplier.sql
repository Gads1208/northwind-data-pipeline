-- Gold layer: Revenue analysis by supplier
{{ config(
    materialized='table'
) }}

SELECT
    p.supplier_name,
    COUNT(DISTINCT o.order_id) AS total_orders,
    COUNT(DISTINCT p.product_id) AS total_products,
    SUM(o.quantity) AS total_quantity_sold,
    SUM(o.line_total) AS total_revenue,
    AVG(o.line_total) AS avg_revenue_per_order,
    CURRENT_TIMESTAMP() AS updated_at
FROM {{ ref('silver_dim_products') }} p
INNER JOIN {{ ref('silver_fact_orders') }} o ON p.product_id = o.product_id
GROUP BY p.supplier_name
ORDER BY total_revenue DESC
