
  
    

    create or replace table `portifolio-482811`.`northwind_bronze`.`silver_dim_products`
      
    
    

    OPTIONS()
    as (
      -- Silver layer: Cleaned and transformed product dimension


SELECT
    p.product_id,
    TRIM(p.product_name) AS product_name,
    p.supplier_id,
    TRIM(s.company_name) AS supplier_name,
    p.category_id,
    TRIM(c.category_name) AS category_name,
    TRIM(p.quantity_per_unit) AS quantity_per_unit,
    CAST(p.unit_price AS NUMERIC) AS unit_price,
    CAST(p.units_in_stock AS INT64) AS units_in_stock,
    CAST(p.units_on_order AS INT64) AS units_on_order,
    CAST(p.reorder_level AS INT64) AS reorder_level,
    CAST(p.discontinued AS BOOL) AS discontinued,
    CURRENT_TIMESTAMP() AS dw_created_at
FROM `portifolio-482811`.`northwind_bronze`.`bronze_products` p
LEFT JOIN `portifolio-482811`.`northwind_bronze`.`bronze_suppliers` s ON p.supplier_id = s.supplier_id
LEFT JOIN `portifolio-482811`.`northwind_bronze`.`bronze_categories` c ON p.category_id = c.category_id
WHERE p.product_id IS NOT NULL
    );
  