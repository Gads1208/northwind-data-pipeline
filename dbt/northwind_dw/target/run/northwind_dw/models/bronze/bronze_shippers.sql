
  
    

    create or replace table `portifolio-482811`.`northwind_bronze_bronze`.`bronze_shippers`
      
    
    

    OPTIONS()
    as (
      

SELECT
    shipper_id,
    company_name,
    phone,
    _airbyte_ab_id,
    _airbyte_emitted_at,
    _airbyte_normalized_at
FROM `portifolio-482811`.`northwind_bronze`.`shippers`
    );
  