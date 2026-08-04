from .db_tools import execute_safe_sql

def get_kpis() -> dict:
    """Calculates top-level Northwind business KPIs."""
    sql = """
    SELECT 
        (SELECT COUNT(*) FROM orders) AS total_orders,
        (SELECT COUNT(*) FROM customers) AS total_customers,
        (SELECT COUNT(*) FROM products WHERE discontinued = 0) AS active_products,
        (SELECT ROUND(SUM(unit_price * quantity * (1 - discount))::numeric, 2) FROM order_details) AS total_revenue,
        (SELECT ROUND(AVG(sub.order_total)::numeric, 2) FROM (
            SELECT order_id, SUM(unit_price * quantity * (1 - discount)) AS order_total
            FROM order_details GROUP BY order_id
        ) sub) AS avg_order_value;
    """
    res = execute_safe_sql(sql)
    if res["success"] and res["data"]:
        return {"success": True, "kpis": res["data"][0]}
    return {"success": False, "error": res.get("error", "Failed to retrieve KPIs")}

def get_sales_analytics(groupby: str = "category") -> dict:
    """Generates sales metrics grouped by category, customer, employee, country, or month."""
    queries = {
        "category": """
            SELECT 
                c.category_name,
                COUNT(DISTINCT o.order_id) AS total_orders,
                ROUND(SUM(od.unit_price * od.quantity * (1 - od.discount))::numeric, 2) AS revenue
            FROM order_details od
            JOIN products p ON od.product_id = p.product_id
            JOIN categories c ON p.category_id = c.category_id
            JOIN orders o ON od.order_id = o.order_id
            GROUP BY c.category_name
            ORDER BY revenue DESC;
        """,
        "employee": """
            SELECT 
                e.first_name || ' ' || e.last_name AS employee_name,
                e.title,
                COUNT(DISTINCT o.order_id) AS total_orders,
                ROUND(SUM(od.unit_price * od.quantity * (1 - od.discount))::numeric, 2) AS total_sales
            FROM orders o
            JOIN employees e ON o.employee_id = e.employee_id
            JOIN order_details od ON o.order_id = od.order_id
            GROUP BY e.employee_id, e.first_name, e.last_name, e.title
            ORDER BY total_sales DESC;
        """,
        "country": """
            SELECT 
                o.ship_country AS country,
                COUNT(DISTINCT o.order_id) AS total_orders,
                ROUND(SUM(od.unit_price * od.quantity * (1 - od.discount))::numeric, 2) AS total_revenue
            FROM orders o
            JOIN order_details od ON o.order_id = od.order_id
            GROUP BY o.ship_country
            ORDER BY total_revenue DESC;
        """,
        "customer": """
            SELECT 
                c.company_name,
                c.country,
                COUNT(DISTINCT o.order_id) AS order_count,
                ROUND(SUM(od.unit_price * od.quantity * (1 - od.discount))::numeric, 2) AS total_spent
            FROM customers c
            JOIN orders o ON c.customer_id = o.customer_id
            JOIN order_details od ON o.order_id = od.order_id
            GROUP BY c.customer_id, c.company_name, c.country
            ORDER BY total_spent DESC
            LIMIT 15;
        """
    }
    sql = queries.get(groupby.lower(), queries["category"])
    return execute_safe_sql(sql)

def explain_business_rules() -> dict:
    """Returns documentation of key Northwind business logic rules and formulas."""
    return {
        "extended_price_formula": "unit_price * quantity * (1 - discount)",
        "freight_handling": "Freight cost is stored per order in the orders table and is paid to the shipper.",
        "discount_policy": "Discount is expressed as a decimal float (0.0 to 0.25).",
        "employee_hierarchy": "Employees report to higher managers specified in the reports_to field.",
        "reorder_logic": "Product should be reordered if (units_in_stock + units_on_order) <= reorder_level."
    }
