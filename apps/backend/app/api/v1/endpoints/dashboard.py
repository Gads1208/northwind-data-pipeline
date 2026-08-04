from fastapi import APIRouter
import httpx
from app.core.config import settings

router = APIRouter()

@router.get("/summary")
async def get_dashboard_summary():
    """Fetches high-level executive KPIs and charts from MCP server."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        kpis_res = await client.post(f"{settings.MCP_SERVER_URL}/mcp/call", json={"tool": "get_kpis", "arguments": {}})
        cat_res = await client.post(f"{settings.MCP_SERVER_URL}/mcp/call", json={"tool": "get_sales_analytics", "arguments": {"groupby": "category"}})
        emp_res = await client.post(f"{settings.MCP_SERVER_URL}/mcp/call", json={"tool": "get_sales_analytics", "arguments": {"groupby": "employee"}})
        coun_res = await client.post(f"{settings.MCP_SERVER_URL}/mcp/call", json={"tool": "get_sales_analytics", "arguments": {"groupby": "country"}})
        cust_res = await client.post(f"{settings.MCP_SERVER_URL}/mcp/call", json={"tool": "get_sales_analytics", "arguments": {"groupby": "customer"}})

    return {
        "kpis": kpis_res.json().get("kpis", {}),
        "sales_by_category": cat_res.json().get("data", []),
        "sales_by_employee": emp_res.json().get("data", []),
        "sales_by_country": coun_res.json().get("data", []),
        "top_customers": cust_res.json().get("data", [])
    }
