
  
    

    create or replace table `portifolio-482811`.`northwind_bronze_bronze`.`bronze_employees`
      
    
    

    OPTIONS()
    as (
      

SELECT
    employee_id,
    last_name,
    first_name,
    title,
    title_of_courtesy,
    birth_date,
    hire_date,
    address,
    city,
    region,
    postal_code,
    country,
    home_phone,
    extension,
    notes,
    reports_to,
    _airbyte_ab_id,
    _airbyte_emitted_at,
    _airbyte_normalized_at
FROM `portifolio-482811`.`northwind_bronze`.`employees`
    );
  