
  
    

    create or replace table `portifolio-482811`.`northwind_bronze`.`silver_dim_employees`
      
    
    

    OPTIONS()
    as (
      -- Silver layer: Cleaned and transformed employee dimension


SELECT
    employee_id,
    TRIM(CONCAT(first_name, ' ', last_name)) AS full_name,
    TRIM(first_name) AS first_name,
    TRIM(last_name) AS last_name,
    TRIM(title) AS title,
    TRIM(title_of_courtesy) AS title_of_courtesy,
    birth_date,
    hire_date,
    TRIM(address) AS address,
    TRIM(city) AS city,
    TRIM(region) AS region,
    TRIM(postal_code) AS postal_code,
    TRIM(country) AS country,
    TRIM(home_phone) AS home_phone,
    TRIM(extension) AS extension,
    reports_to,
    CURRENT_TIMESTAMP() AS dw_created_at
FROM `portifolio-482811`.`northwind_bronze`.`bronze_employees`
WHERE employee_id IS NOT NULL
    );
  