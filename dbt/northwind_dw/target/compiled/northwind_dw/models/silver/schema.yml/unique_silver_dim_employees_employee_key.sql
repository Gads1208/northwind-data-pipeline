
    
    

with dbt_test__target as (

  select employee_key as unique_field
  from `portifolio-482811`.`northwind_bronze`.`silver_dim_employees`
  where employee_key is not null

)

select
    unique_field,
    count(*) as n_records

from dbt_test__target
group by unique_field
having count(*) > 1


