-- Gold layer: Customer revenue analysis
{{ config(
    materialized='table'
) }}

SELECT
    c.customer_id,
    c.company_name,
    c.city,
    c.country,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(o.line_total) AS total_revenue,
    AVG(o.line_total) AS avg_order_value,
    MIN(o.order_date) AS first_order_date,
    MAX(o.order_date) AS last_order_date,
    CURRENT_TIMESTAMP() AS updated_at
FROM {{ ref('silver_dim_customers') }} c
LEFT JOIN {{ ref('silver_fact_orders') }} o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.company_name, c.city, c.country
ORDER BY total_revenue DESC
