import os
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

from agents.sql_agent import SQLAgent
from agents.analyst_agent import DataAnalystAgent
from agents.vis_agent import VisualizationAgent
from agents.insight_agent import BusinessInsightAgent
from agents.doc_agent import DocumentationAgent

app = FastAPI(
    title="Northwind AI Multi-Agent Orchestrator",
    description="Multi-Agent orchestrator coordinating SQLAgent, DataAnalystAgent, VisualizationAgent, BusinessInsightAgent, and DocumentationAgent via Model Context Protocol.",
    version="1.0.0"
)

sql_agent = SQLAgent()
analyst_agent = DataAnalystAgent()
vis_agent = VisualizationAgent()
insight_agent = BusinessInsightAgent()
doc_agent = DocumentationAgent()

class ChatRequest(BaseModel):
    message: str
    page_context: Optional[str] = "general"
    session_id: Optional[str] = "default"

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI Orchestrator Multi-Agent System",
        "agents": [
            "SQLAgent", "DataAnalystAgent", "VisualizationAgent", "BusinessInsightAgent", "DocumentationAgent"
        ]
    }

@app.post("/orchestrate")
async def orchestrate_chat(req: ChatRequest):
    user_msg = req.message
    context = req.page_context or "general"
    
    # 1. SQL Agent translates NL to safe SQL and executes via MCP
    sql = await sql_agent.generate_sql(user_msg, page_context=context)
    query_result = await sql_agent.execute_query(sql)
    
    if not query_result.get("success"):
        return {
            "text": f"Desculpe, ocorreu um erro ao consultar o banco de dados: {query_result.get('error')}",
            "sql": sql,
            "data": [],
            "visualization": None,
            "insights": ["Revise a sintaxe da consulta ou verifique as tabelas disponíveis."],
            "documentation": None
        }
        
    data = query_result.get("data", [])
    
    # 2. Data Analyst Agent
    analysis = analyst_agent.analyze_dataset(data, user_msg)
    
    # 3. Visualization Agent
    vis_res = await vis_agent.get_visualization(data, user_msg)
    
    # 4. Business Insight Agent
    insights = insight_agent.generate_insights(user_msg, data, analysis["metrics"])
    
    # 5. Documentation Agent
    doc = doc_agent.explain_query_and_metrics(sql, context)
    
    # Textual response synthesis
    text_resp = f"Analisei sua pergunta ('{user_msg}') considerando o contexto da página **{context.upper()}**.\n\n"
    text_resp += f"Submeti a consulta via servidor MCP e obtive **{len(data)} registros** com sucesso."

    return {
        "text": text_resp,
        "sql": sql,
        "data": data,
        "visualization": vis_res,
        "insights": insights,
        "documentation": doc
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=port)
