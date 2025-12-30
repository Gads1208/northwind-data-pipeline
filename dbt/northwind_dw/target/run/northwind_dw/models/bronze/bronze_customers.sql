
  
    

    create or replace table `portifolio-482811`.`northwind_bronze_bronze`.`bronze_customers`
      
    
    

    OPTIONS()
    as (
      

SELECT
    customer_id,
    company_name,
    contact_name,
    contact_title,
    address,
    city,
    region,
    postal_code,
    country,
    phone,
    fax,
    _airbyte_ab_id,
    _airbyte_emitted_at,
    _airbyte_normalized_at
FROM `portifolio-482811`.`northwind_bronze`.`customers`
    );
  