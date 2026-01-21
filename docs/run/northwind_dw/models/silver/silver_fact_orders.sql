
  
    

    create or replace table `portifolio-482811`.`northwind_silver`.`silver_fact_orders`
      
    
    

    OPTIONS()
    as (
      -- Silver layer: Order facts with denormalized dimensions


SELECT
    o.order_id,
    o.customer_id,
    o.employee_id,
    o.order_date,
    o.required_date,
    o.shipped_date,
    o.ship_via AS shipper_id,
    od.product_id,
    CAST(od.unit_price AS NUMERIC) AS unit_price,
    CAST(od.quantity AS INT64) AS quantity,
    CAST(od.discount AS NUMERIC) AS discount,
    CAST(od.unit_price AS NUMERIC) * CAST(od.quantity AS INT64) * (1 - CAST(od.discount AS NUMERIC)) AS line_total,
    CURRENT_TIMESTAMP() AS dw_created_at
FROM `portifolio-482811`.`northwind_bronze`.`bronze_orders` o
INNER JOIN `portifolio-482811`.`northwind_bronze`.`bronze_order_details` od ON o.order_id = od.order_id
WHERE o.order_id IS NOT NULL
    );
  