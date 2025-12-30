-- Silver layer: Cleaned and transformed customer dimension
{{ config(
    materialized='table'
) }}

WITH cleaned_customers AS (
    SELECT
        customer_id,
        TRIM(company_name) AS company_name,
        TRIM(contact_name) AS contact_name,
        TRIM(contact_title) AS contact_title,
        TRIM(address) AS address,
        TRIM(city) AS city,
        TRIM(region) AS region,
        TRIM(postal_code) AS postal_code,
        TRIM(country) AS country,
        TRIM(phone) AS phone,
        TRIM(fax) AS fax
    FROM {{ ref('bronze_customers') }}
    WHERE customer_id IS NOT NULL
)

SELECT
    customer_id,
    company_name,
    contact_name,
    COALESCE(contact_title, 'Unknown') AS contact_title,
    COALESCE(address, 'Unknown') AS address,
    COALESCE(city, 'Unknown') AS city,
    COALESCE(region, 'Unknown') AS region,
    COALESCE(postal_code, 'Unknown') AS postal_code,
    COALESCE(country, 'Unknown') AS country,
    phone,
    fax,
    CURRENT_TIMESTAMP() AS dw_created_at
FROM cleaned_customers
