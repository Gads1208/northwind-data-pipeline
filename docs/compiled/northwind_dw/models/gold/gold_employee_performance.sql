-- Gold layer: Employee performance metrics


SELECT
    e.employee_id,
    e.full_name,
    e.title,
    e.city,
    e.country,
    COUNT(DISTINCT o.order_id) AS total_orders,
    COUNT(DISTINCT o.customer_id) AS total_customers_served,
    SUM(o.line_total) AS total_sales,
    AVG(o.line_total) AS avg_order_value,
    MIN(o.order_date) AS first_sale_date,
    MAX(o.order_date) AS last_sale_date,
    CURRENT_TIMESTAMP() AS updated_at
FROM `portifolio-482811`.`northwind_silver`.`silver_dim_employees` e
LEFT JOIN `portifolio-482811`.`northwind_silver`.`silver_fact_orders` o ON e.employee_id = o.employee_id
GROUP BY e.employee_id, e.full_name, e.title, e.city, e.country
ORDER BY total_sales DESC