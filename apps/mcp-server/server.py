import os
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Any, Dict

from tools.db_tools import get_database_schema, execute_safe_sql
from tools.analytics_tools import get_kpis, get_sales_analytics, explain_business_rules, get_context_analytics
from tools.vis_tools import recommend_visualization

app = FastAPI(
    title="Northwind Model Context Protocol (MCP) Server",
    description="Official MCP Server providing standardized tools for Northwind database querying, schema inspection, analytics, and visualization recommendations.",
    version="1.0.0"
)

class ToolCallRequest(BaseModel):
    tool: str
    arguments: Optional[Dict[str, Any]] = {}

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Northwind MCP Server",
        "protocol": "Model Context Protocol (MCP)",
        "version": "1.0.0"
    }

@app.get("/mcp/tools")
def list_tools():
    """Lists all exposed MCP tools following MCP specification."""
    return {
        "tools": [
            {
                "name": "get_database_schema",
                "description": "Returns full PostgreSQL Northwind database tables, columns, and data types.",
                "inputSchema": {"type": "object", "properties": {}}
            },
            {
                "name": "execute_safe_sql",
                "description": "Executes a validated read-only SELECT query against the Northwind database with SQL injection protection.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "sql_query": {"type": "string", "description": "Read-only SQL SELECT query"},
                        "max_rows": {"type": "integer", "default": 500}
                    },
                    "required": ["sql_query"]
                }
            },
            {
                "name": "get_kpis",
                "description": "Extracts high-level executive KPIs (Total Revenue, Orders, Average Order Value, Customers).",
                "inputSchema": {"type": "object", "properties": {}}
            },
            {
                "name": "get_sales_analytics",
                "description": "Generates sales metrics aggregated by category, employee, country, or customer.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "groupby": {"type": "string", "enum": ["category", "employee", "country", "customer"], "default": "category"}
                    }
                }
            },
            {
                "name": "get_context_analytics",
                "description": "Extracts specific KPI cards and preview table data for any given dashboard context tab.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "context": {"type": "string", "description": "Context page identifier (customers, orders, products, employees, etc.)"}
                    }
                }
            },
            {
                "name": "explain_business_rules",
                "description": "Returns formal business logic formulas and calculation rules for Northwind dataset.",
                "inputSchema": {"type": "object", "properties": {}}
            },
            {
                "name": "recommend_visualization",
                "description": "Evaluates dataset shape and suggests optimal visualization type (bar, line, pie, scatter, treemap).",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "data": {"type": "array", "items": {"type": "object"}},
                        "chart_type_override": {"type": "string"}
                    },
                    "required": ["data"]
                }
            }
        ]
    }

@app.post("/mcp/call")
def call_tool(req: ToolCallRequest):
    """Executes a requested MCP tool."""
    tool_name = req.tool
    args = req.arguments or {}
    
    if tool_name == "get_database_schema":
        return get_database_schema()
    elif tool_name == "execute_safe_sql":
        query = args.get("sql_query")
        if not query:
            raise HTTPException(status_code=400, detail="Missing sql_query parameter.")
        max_rows = args.get("max_rows", 500)
        return execute_safe_sql(query, max_rows=max_rows)
    elif tool_name == "get_kpis":
        return get_kpis()
    elif tool_name == "get_sales_analytics":
        groupby = args.get("groupby", "category")
        return get_sales_analytics(groupby)
    elif tool_name == "get_context_analytics":
        context = args.get("context", "customers")
        return get_context_analytics(context)
    elif tool_name == "explain_business_rules":
        return explain_business_rules()
    elif tool_name == "recommend_visualization":
        data = args.get("data", [])
        override = args.get("chart_type_override")
        return recommend_visualization(data, override)
    else:
        raise HTTPException(status_code=404, detail=f"Tool '{tool_name}' not found.")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
