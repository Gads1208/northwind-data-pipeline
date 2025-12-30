-- Bronze layer: Raw data from PostgreSQL ingestion

{{ config(
    materialized='view'
) }}

SELECT *
FROM `portifolio-482811.northwind_bronze.bronze_suppliers`
