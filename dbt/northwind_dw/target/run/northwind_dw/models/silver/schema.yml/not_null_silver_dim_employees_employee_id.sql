select
      count(*) as failures,
      count(*) != 0 as should_warn,
      count(*) != 0 as should_error
    from (
      
    
    



select employee_id
from `portifolio-482811`.`northwind_bronze`.`silver_dim_employees`
where employee_id is null



      
    ) dbt_internal_test