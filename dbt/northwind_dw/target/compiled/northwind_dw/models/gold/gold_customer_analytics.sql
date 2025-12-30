-- Gold layer: Customer analytics and segmentation


WITH customer_metrics AS (
    SELECT
        c.customer_id,
        c.company_name,
        c.contact_name,
        c.city,
        c.country,
        COUNT(DISTINCT o.order_id) AS total_orders,
        SUM(o.line_total) AS total_spent,
        AVG(o.line_total) AS avg_order_value,
        SUM(o.quantity) AS total_items_purchased,
        SUM(o.line_total * o.discount / (1 - o.discount)) AS total_discounts_received,
        MIN(o.order_date) AS first_order_date,
        MAX(o.order_date) AS last_order_date,
        DATE_DIFF(CURRENT_DATE(), MAX(o.order_date), DAY) AS days_since_last_order
    FROM `portifolio-482811`.`northwind_silver`.`silver_dim_customers` c
    LEFT JOIN `portifolio-482811`.`northwind_silver`.`silver_fact_orders` o ON c.customer_id = o.customer_id
    GROUP BY 
        c.customer_id,
        c.company_name,
        c.contact_name,
        c.city,
        c.country
)

SELECT
    customer_id,
    company_name,
    contact_name,
    city,
    country,
    total_orders,
    ROUND(total_spent, 2) AS total_spent,
    ROUND(avg_order_value, 2) AS avg_order_value,
    total_items_purchased,
    ROUND(total_discounts_received, 2) AS total_discounts_received,
    first_order_date,
    last_order_date,
    days_since_last_order,
    -- Customer segmentation
    CASE 
        WHEN total_orders >= 10 THEN 'VIP'
        WHEN total_orders >= 5 THEN 'Frequent'
        WHEN total_orders >= 2 THEN 'Regular'
        ELSE 'New'
    END AS customer_segment,
    CASE 
        WHEN days_since_last_order <= 30 THEN 'Active'
        WHEN days_since_last_order <= 90 THEN 'At Risk'
        ELSE 'Inactive'
    END AS activity_status,
    CURRENT_TIMESTAMP() AS updated_at
FROM customer_metrics
ORDER BY total_spent DESC