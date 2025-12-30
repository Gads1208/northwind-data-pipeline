
  
    

    create or replace table `portifolio-482811`.`northwind_bronze_bronze`.`bronze_products`
      
    
    

    OPTIONS()
    as (
      

SELECT
    product_id,
    product_name,
    supplier_id,
    category_id,
    quantity_per_unit,
    unit_price,
    units_in_stock,
    units_on_order,
    reorder_level,
    discontinued,
    _airbyte_ab_id,
    _airbyte_emitted_at,
    _airbyte_normalized_at
FROM `portifolio-482811`.`northwind_bronze`.`products`
    );
  