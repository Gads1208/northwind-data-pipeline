import re
import httpx
import os

MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "http://mcp-server:8001")

class SQLAgent:
    """Specialized agent for interpreting natural language into safe, read-only SQL queries for Northwind."""
    
    def __init__(self, mcp_url: str = MCP_SERVER_URL):
        self.mcp_url = mcp_url

    async def generate_sql(self, query_text: str, page_context: str = "general") -> str:
        q = query_text.lower()
        
        # Rule-based natural language to SQL translation for Northwind database
        if "cliente" in q and ("comprou mais" in q or "maior" in q or "top" in q):
            year_match = re.search(r'\b(199[6-8]|202[0-6])\b', q)
            year_filter = f"WHERE EXTRACT(YEAR FROM o.order_date) = {year_match.group(1)}" if year_match else ""
            return f"""
                SELECT 
                    c.company_name,
                    c.contact_name,
                    c.country,
                    COUNT(DISTINCT o.order_id) AS total_orders,
                    ROUND(SUM(od.unit_price * od.quantity * (1 - od.discount))::numeric, 2) AS total_spent
                FROM customers c
                JOIN orders o ON c.customer_id = o.customer_id
                JOIN order_details od ON o.order_id = od.order_id
                {year_filter}
                GROUP BY c.customer_id, c.company_name, c.contact_name, c.country
                ORDER BY total_spent DESC
                LIMIT 10;
            """.strip()

        elif "vendedor" in q or "funcionario" in q or "faturamento" in q and "vendedor" in q:
            return """
                SELECT 
                    e.first_name || ' ' || e.last_name AS employee_name,
                    e.title,
                    COUNT(DISTINCT o.order_id) AS total_orders,
                    ROUND(SUM(od.unit_price * od.quantity * (1 - od.discount))::numeric, 2) AS total_sales
                FROM employees e
                JOIN orders o ON e.employee_id = o.employee_id
                JOIN order_details od ON o.order_id = od.order_id
                GROUP BY e.employee_id, e.first_name, e.last_name, e.title
                ORDER BY total_sales DESC;
            """.strip()

        elif "categoria" in q and ("vende mais" in q or "receita" in q or "faturamento" in q):
            return """
                SELECT 
                    c.category_name,
                    COUNT(DISTINCT od.order_id) AS orders_count,
                    ROUND(SUM(od.unit_price * od.quantity * (1 - od.discount))::numeric, 2) AS total_revenue
                FROM categories c
                JOIN products p ON c.category_id = p.category_id
                JOIN order_details od ON p.product_id = od.product_id
                GROUP BY c.category_name
                ORDER BY total_revenue DESC;
            """.strip()

        elif "produto" in q and ("parado" in q or "pouco" in q or "estoque" in q):
            return """
                SELECT 
                    p.product_name,
                    c.category_name,
                    p.units_in_stock,
                    p.units_on_order,
                    p.reorder_level,
                    p.unit_price
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                WHERE p.units_in_stock < 20 OR p.discontinued = 1
                ORDER BY p.units_in_stock ASC
                LIMIT 15;
            """.strip()

        elif "regiao" in q or "pais" in q or "país" in q:
            return """
                SELECT 
                    o.ship_country AS country,
                    COUNT(DISTINCT o.order_id) AS total_orders,
                    ROUND(SUM(od.unit_price * od.quantity * (1 - od.discount))::numeric, 2) AS total_revenue
                FROM orders o
                JOIN order_details od ON o.order_id = od.order_id
                GROUP BY o.ship_country
                ORDER BY total_revenue DESC;
            """.strip()

        elif "atrasado" in q or "pedido" in q and "atraso" in q:
            return """
                SELECT 
                    o.order_id,
                    c.company_name,
                    o.order_date,
                    o.required_date,
                    o.shipped_date,
                    (o.shipped_date - o.required_date) AS days_late
                FROM orders o
                JOIN customers c ON o.customer_id = c.customer_id
                WHERE o.shipped_date > o.required_date
                ORDER BY days_late DESC;
            """.strip()

        else:
            # Fallback contextual queries based on current dashboard page
            if page_context == "customers":
                return "SELECT customer_id, company_name, contact_name, city, country, phone FROM customers LIMIT 20;"
            elif page_context == "products":
                return "SELECT product_id, product_name, unit_price, units_in_stock FROM products ORDER BY unit_price DESC LIMIT 20;"
            elif page_context == "sales":
                return "SELECT o.order_id, o.order_date, o.ship_country, ROUND(SUM(od.unit_price * od.quantity * (1 - od.discount))::numeric, 2) AS revenue FROM orders o JOIN order_details od ON o.order_id = od.order_id GROUP BY o.order_id, o.order_date, o.ship_country ORDER BY o.order_date DESC LIMIT 20;"
            else:
                return "SELECT category_name, COUNT(*) AS count FROM categories GROUP BY category_name;"

    async def execute_query(self, sql_query: str) -> dict:
        """Calls the MCP tool to safely execute the generated SQL."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{self.mcp_url}/mcp/call",
                json={"tool": "execute_safe_sql", "arguments": {"sql_query": sql_query}}
            )
            return resp.json()
