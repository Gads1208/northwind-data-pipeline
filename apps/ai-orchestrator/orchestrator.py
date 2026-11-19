import os
import time
import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

from agents.sql_agent import SQLAgent
from agents.analyst_agent import DataAnalystAgent
from agents.vis_agent import VisualizationAgent
from agents.insight_agent import BusinessInsightAgent
from agents.doc_agent import DocumentationAgent
from harness import HarnessRouter, HINT_REGISTRY, MODEL_MATRIX

app = FastAPI(
    title="Northwind AI Multi-Agent Orchestrator & Cognitive Harness",
    description=(
        "Skill-based Multi-Agent Harness with Gemini 4 Model Routing (Hydrogen/Neon/Argon), "
        "Downgrade by Default, Deterministic AST Gates, Circuit Breaker Escalation, and MCP execution."
    ),
    version="2.0.0"
)

sql_agent = SQLAgent()
analyst_agent = DataAnalystAgent()
vis_agent = VisualizationAgent()
insight_agent = BusinessInsightAgent()
doc_agent = DocumentationAgent()
harness_router = HarnessRouter()


class ChatRequest(BaseModel):
    message: str
    page_context: Optional[str] = "general"
    session_id: Optional[str] = "default"


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI Orchestrator Multi-Agent Harness",
        "version": "2.0.0",
        "model_tiers": {k: v.gemini_id for k, v in MODEL_MATRIX.items()},
        "agents": [
            "SQLAgent",
            "DataAnalystAgent",
            "VisualizationAgent",
            "BusinessInsightAgent",
            "DocumentationAgent",
        ],
    }


@app.get("/harness/spec")
def get_harness_specification():
    """Exposes the active Gemini 4 Routing Matrix, Effort boundaries, and Post-Tool Hints."""
    return {
        "protocol": "Gemini 4 Skill-Based Multi-Agent Harness",
        "principles": [
            "Level 0 (Zero-LLM) where deterministic templates or AST checks suffice",
            "Downgrade by Default (start with gemini-4-hydrogen, effort=low)",
            "Hybrid Planning/Execution (Argon/Neon plans, Hydrogen executes isolated tasks)",
            "Deterministic Gate + Circuit Breaker (1 failure triggers immediate tier escalation)",
            "Isolated Working Memory per session_id/chat_id + 1-turn Post-Tool Hints",
        ],
        "models": {
            tier: {
                "gemini_id": spec.gemini_id,
                "fallback_api_id": spec.fallback_api_id,
                "claude_equiv": spec.claude_equiv,
                "default_effort": spec.default_effort,
                "relative_cost_weight": spec.cost_weight,
            }
            for tier, spec in MODEL_MATRIX.items()
        },
        "hints": HINT_REGISTRY,
    }


@app.post("/orchestrate")
async def orchestrate_chat(req: ChatRequest):
    t0 = time.perf_counter()
    user_msg = req.message
    context = req.page_context or "general"
    session_id = req.session_id or "default"

    # Etapa 1 & 2 do Protocolo: Triagem, Isolamento de Sessão e Plano de Roteamento (Downgrade by Default)
    routing_plan = harness_router.build_routing_plan(user_msg, context, session_id=session_id)
    circuit_breaker_events = []

    step1 = routing_plan.plano_execucao[0]
    selected_sql_model = step1.modelo_selecionado

    # Etapa 3: Despacho para SQLAgent com modelo selecionado e contexto mínimo
    sql = await sql_agent.generate_sql(
        user_msg,
        page_context=context,
        target_model=selected_sql_model,
    )
    query_result = await sql_agent.execute_query(sql, session_id=session_id)

    # Etapa 4: Gate Determinístico de Aceite & Circuit Breaker
    if not query_result.get("success"):
        err_msg = str(query_result.get("error") or "Unknown SQL execution error")

        # Se for violação de segurança AST (ex: DROP TABLE), bloqueia imediatamente sem reexecutar
        if "AST_SECURITY_VIOLATION" in err_msg or "Forbidden SQL" in err_msg:
            hint = HINT_REGISTRY["ast_security_guard"]
            harness_router.memory.update_session(
                session_id,
                last_page_context=context,
                last_intent="security_blocked",
                active_hint=hint,
            )
            return {
                "correlation_id": routing_plan.correlation_id,
                "routing_plan": routing_plan.to_dict(),
                "circuit_breaker": circuit_breaker_events,
                "post_tool_hint": hint,
                "text": f"🛡️ **Guardrail AST Acionado:** Apenas consultas `SELECT` de leitura são permitidas neste ambiente ({err_msg}).",
                "sql": sql,
                "data": [],
                "visualization": None,
                "insights": ["Tentativa de mutação bloqueada na camada de validação sintática AST antes de atingir o banco."],
                "documentation": None,
                "latency_ms": round((time.perf_counter() - t0) * 1000, 2),
            }

        # Se for erro de sintaxe/lógica em modelo leve, aciona o Circuit Breaker escalando de Tier!
        escalated_spec, cb_event = harness_router.escalate_step(
            step1.tier, step1.skill, err_msg
        )
        circuit_breaker_events.append(cb_event.to_dict())

        # Reexecuta 1 vez no modelo escalonado (Neon ou Argon) anexando o erro anterior
        sql = await sql_agent.generate_sql(
            user_msg,
            page_context=context,
            target_model=escalated_spec.gemini_id,
            previous_error=err_msg,
        )
        query_result = await sql_agent.execute_query(sql, session_id=session_id)

        if not query_result.get("success"):
            return {
                "correlation_id": routing_plan.correlation_id,
                "routing_plan": routing_plan.to_dict(),
                "circuit_breaker": circuit_breaker_events,
                "post_tool_hint": HINT_REGISTRY["execute_safe_sql"],
                "text": f"Desculpe, ocorreu um erro técnico ao consultar o banco de dados: {query_result.get('error')}",
                "sql": sql,
                "data": [],
                "visualization": None,
                "insights": ["Revise a sintaxe da consulta ou verifique a disponibilidade do servidor MCP."],
                "documentation": None,
                "latency_ms": round((time.perf_counter() - t0) * 1000, 2),
            }

    data = query_result.get("data", [])

    # Etapa 5: Injeção de Hint Pós-Tool, Memória de Trabalho e Execução das Skills de Análise
    active_hint = HINT_REGISTRY["execute_safe_sql"]
    analysis = analyst_agent.analyze_dataset(data, user_msg)
    vis_res = await vis_agent.get_visualization(data, user_msg)
    insights = insight_agent.generate_insights(user_msg, data, analysis["metrics"])
    doc = doc_agent.explain_query_and_metrics(sql, context)

    est_tokens = len(user_msg) // 3 + len(sql) // 3 + len(str(data[:5])) // 4
    sess_state = harness_router.memory.update_session(
        session_id,
        last_page_context=context,
        last_intent="analytical_query",
        active_hint=active_hint,
        estimated_tokens=harness_router.memory.get_session(session_id).get("estimated_tokens", 0) + est_tokens,
    )

    text_resp = (
        f"Analisei sua pergunta ('{user_msg}') no contexto **{context.upper()}** "
        f"[Tier SQL: `{selected_sql_model}` | Economia FinOps: `~{routing_plan.economia_estimada_pct}%`].\n\n"
        f"Submeti a consulta validada via AST ao servidor MCP e obtive **{len(data)} registros**."
    )

    return {
        "correlation_id": routing_plan.correlation_id,
        "routing_plan": routing_plan.to_dict(),
        "circuit_breaker": circuit_breaker_events,
        "post_tool_hint": active_hint,
        "session_memory": {
            "session_id": session_id,
            "turn_count": sess_state["turn_count"],
            "handoff_recommended": sess_state["handoff_recommended"],
        },
        "text": text_resp,
        "sql": sql,
        "data": data,
        "visualization": vis_res,
        "insights": insights,
        "documentation": doc,
        "latency_ms": round((time.perf_counter() - t0) * 1000, 2),
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=port)
