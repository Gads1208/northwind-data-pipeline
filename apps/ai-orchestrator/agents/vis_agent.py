import httpx
import os

MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "http://mcp-server:8001")

class VisualizationAgent:
    """Specialized agent for automatic chart recommendation and specification generation."""
    
    def __init__(self, mcp_url: str = MCP_SERVER_URL):
        self.mcp_url = mcp_url

    async def get_visualization(self, data: list, user_request: str = "") -> dict:
        if not data:
            return {"chart_type": "none", "spec": None}
            
        override = None
        q = user_request.lower()
        if "pizza" in q or "pie" in q:
            override = "pie"
        elif "linha" in q or "line" in q or "evolução" in q:
            override = "line"
        elif "barra" in q or "bar" in q:
            override = "bar"
        elif "dispersao" in q or "scatter" in q:
            override = "scatter"

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{self.mcp_url}/mcp/call",
                json={
                    "tool": "recommend_visualization", 
                    "arguments": {"data": data, "chart_type_override": override}
                }
            )
            return resp.json()
