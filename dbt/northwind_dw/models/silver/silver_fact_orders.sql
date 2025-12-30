-- Silver layer: Order facts with denormalized dimensions
{{ config(
    materialized='table'
) }}

SELECT
    o.order_id,
    o.customer_id,
    o.employee_id,
    o.order_date,
    o.required_date,
    o.shipped_date,
    o.ship_via AS shipper_id,
    od.product_id,
    CAST(od.unit_price AS NUMERIC) AS unit_price,
    CAST(od.quantity AS INT64) AS quantity,
    CAST(od.discount AS NUMERIC) AS discount,
    CAST(od.unit_price AS NUMERIC) * CAST(od.quantity AS INT64) * (1 - CAST(od.discount AS NUMERIC)) AS line_total,
    CURRENT_TIMESTAMP() AS dw_created_at
FROM {{ ref('bronze_orders') }} o
INNER JOIN {{ ref('bronze_order_details') }} od ON o.order_id = od.order_id
WHERE o.order_id IS NOT NULL
