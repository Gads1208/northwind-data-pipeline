
  
    

    create or replace table `portifolio-482811`.`northwind_bronze_bronze`.`bronze_suppliers`
      
    
    

    OPTIONS()
    as (
      

SELECT
    supplier_id,
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
    homepage,
    _airbyte_ab_id,
    _airbyte_emitted_at,
    _airbyte_normalized_at
FROM `portifolio-482811`.`northwind_bronze`.`suppliers`
    );
  