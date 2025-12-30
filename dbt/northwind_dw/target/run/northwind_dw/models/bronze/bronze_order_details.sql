
  
    

    create or replace table `portifolio-482811`.`northwind_bronze_bronze`.`bronze_order_details`
      
    
    

    OPTIONS()
    as (
      

SELECT
    order_id,
    product_id,
    unit_price,
    quantity,
    discount,
    _airbyte_ab_id,
    _airbyte_emitted_at,
    _airbyte_normalized_at
FROM `portifolio-482811`.`northwind_bronze`.`order_details`
    );
  