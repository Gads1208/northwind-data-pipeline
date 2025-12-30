-- Gold layer: Product performance metrics
{{ config(
    materialized='table'
) }}

SELECT
    p.product_id,
    p.product_name,
    p.category_name,
    p.supplier_name,
    p.unit_price,
    p.discontinued,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(o.quantity) AS total_quantity_sold,
    SUM(o.line_total) AS total_revenue,
    AVG(o.line_total) AS avg_revenue_per_order,
    CURRENT_TIMESTAMP() AS updated_at
FROM {{ ref('silver_dim_products') }} p
LEFT JOIN {{ ref('silver_fact_orders') }} o ON p.product_id = o.product_id
GROUP BY p.product_id, p.product_name, p.category_name, p.supplier_name, p.unit_price, p.discontinued
ORDER BY total_revenue DESC
