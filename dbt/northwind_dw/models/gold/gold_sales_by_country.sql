-- Gold layer: Sales metrics by country
{{ config(
    materialized='table',
    schema='gold'
) }}

WITH sales_by_country AS (
    SELECT
        c.country,
        COUNT(DISTINCT o.order_id) AS total_orders,
        COUNT(DISTINCT c.customer_id) AS total_customers,
        SUM(o.order_total) AS total_revenue,
        AVG(o.order_total) AS avg_order_value,
        SUM(o.total_quantity) AS total_units_sold,
        SUM(o.total_discount_amount) AS total_discounts,
        MIN(o.order_date) AS first_order_date,
        MAX(o.order_date) AS last_order_date
    FROM {{ ref('silver_fact_orders') }} o
    INNER JOIN {{ ref('silver_dim_customers') }} c ON o.customer_id = c.customer_id
    WHERE o.order_date IS NOT NULL
    GROUP BY c.country
)

SELECT
    country,
    total_orders,
    total_customers,
    ROUND(total_revenue, 2) AS total_revenue,
    ROUND(avg_order_value, 2) AS avg_order_value,
    total_units_sold,
    ROUND(total_discounts, 2) AS total_discounts,
    ROUND(total_revenue / total_customers, 2) AS revenue_per_customer,
    first_order_date,
    last_order_date,
    CURRENT_TIMESTAMP() AS updated_at
FROM sales_by_country
ORDER BY total_revenue DESC
