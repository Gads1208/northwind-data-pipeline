-- Silver layer: Cleaned and transformed product dimension
{{ config(
    materialized='table'
) }}

SELECT
    p.product_id,
    TRIM(p.product_name) AS product_name,
    p.supplier_id,
    TRIM(s.company_name) AS supplier_name,
    p.category_id,
    TRIM(c.category_name) AS category_name,
    TRIM(p.quantity_per_unit) AS quantity_per_unit,
    CAST(p.unit_price AS NUMERIC) AS unit_price,
    CAST(p.units_in_stock AS INT64) AS units_in_stock,
    CAST(p.units_on_order AS INT64) AS units_on_order,
    CAST(p.reorder_level AS INT64) AS reorder_level,
    CAST(p.discontinued AS BOOL) AS discontinued,
    CURRENT_TIMESTAMP() AS dw_created_at
FROM {{ ref('bronze_products') }} p
LEFT JOIN {{ ref('bronze_suppliers') }} s ON p.supplier_id = s.supplier_id
LEFT JOIN {{ ref('bronze_categories') }} c ON p.category_id = c.category_id
WHERE p.product_id IS NOT NULL
