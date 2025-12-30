
  
    

    create or replace table `portifolio-482811`.`northwind_bronze_bronze`.`bronze_categories`
      
    
    

    OPTIONS()
    as (
      -- Bronze layer: Raw data from Airbyte ingestion
-- Source: northwind_bronze dataset in BigQuery



SELECT
    category_id,
    category_name,
    description,
    picture,
    _airbyte_ab_id,
    _airbyte_emitted_at,
    _airbyte_normalized_at
FROM `portifolio-482811`.`northwind_bronze`.`categories`
    );
  