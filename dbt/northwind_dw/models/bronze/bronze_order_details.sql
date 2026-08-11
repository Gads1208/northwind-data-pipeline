-- Bronze layer: Raw data from PostgreSQL ingestion

{{ config(
    materialized='view'
) }}

SELECT *
FROM {{ source('airbyte_raw', 'order_details') }}
