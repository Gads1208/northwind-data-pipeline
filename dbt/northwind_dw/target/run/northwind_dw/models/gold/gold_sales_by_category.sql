
  
    

    create or replace table `portifolio-482811`.`gold`.`gold_sales_by_category`
      
    
    

    OPTIONS()
    as (
      -- Gold layer: Sales metrics by product category


WITH sales_by_category AS (
    SELECT
        p.category_id,
        p.category_name,
        p.category_description,
        COUNT(DISTINCT od.order_id) AS total_orders,
        COUNT(DISTINCT od.product_id) AS total_products,
        SUM(od.quantity) AS total_units_sold,
        SUM(od.unit_price * od.quantity * (1 - od.discount)) AS total_revenue,
        AVG(od.unit_price * od.quantity * (1 - od.discount)) AS avg_order_line_value,
        SUM(od.unit_price * od.quantity * od.discount) AS total_discounts
    FROM `portifolio-482811`.`northwind_bronze`.`bronze_order_details` od
    INNER JOIN `portifolio-482811`.`northwind_bronze`.`silver_dim_products` p ON od.product_id = p.product_id
    GROUP BY p.category_id, p.category_name, p.category_description
)

SELECT
    category_id,
    category_name,
    category_description,
    total_orders,
    total_products,
    total_units_sold,
    ROUND(total_revenue, 2) AS total_revenue,
    ROUND(avg_order_line_value, 2) AS avg_order_line_value,
    ROUND(total_discounts, 2) AS total_discounts,
    ROUND(total_revenue / total_orders, 2) AS revenue_per_order,
    CURRENT_TIMESTAMP() AS updated_at
FROM sales_by_category
ORDER BY total_revenue DESC
    );
  