"""
Northwind AI Multi-Agent Harness — Model Router, Circuit Breaker & Working Memory.

Implements the specifications from:
  - /ai_engineer/agente_orquestrador.md (Gemini 4 Tier Routing, Downgrade by Default, Circuit Breaker, JSON Routing Plan)
  - /ai_engineer/SKILL.md (Effort vs. Tier boundaries, Subagent Context-Zero, 350k Handoff monitoring)
  - /ai_engineer/arquitetura-minima-de-um-agente.md (Clean Architecture, Working Memory per session_id, Post-Tool Hints, correlationId)
"""
from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Protocol


# ============================================================================
# 1. DOMAIN LAYER — Immutable Entities & Value Objects
# ============================================================================

@dataclass(frozen=True, slots=True)
class ModelSpec:
    tier: str
    gemini_id: str
    fallback_api_id: str
    claude_equiv: str
    default_effort: str
    cost_weight: float  # Relative cost weight vs Argon (Argon = 1.0)


MODEL_MATRIX: Dict[str, ModelSpec] = {
    "ZERO_LLM": ModelSpec(
        tier="ZERO_LLM",
        gemini_id="deterministic-template",
        fallback_api_id="local-ast-template",
        claude_equiv="none",
        default_effort="low",
        cost_weight=0.0,
    ),
    "LOW": ModelSpec(
        tier="LOW",
        gemini_id="gemini-4-hydrogen",
        fallback_api_id="gemini-3.1-flash-lite",
        claude_equiv="claude-haiku-4-5",
        default_effort="low",
        cost_weight=0.12,
    ),
    "MEDIUM": ModelSpec(
        tier="MEDIUM",
        gemini_id="gemini-4-neon",
        fallback_api_id="gemini-3.5-flash",
        claude_equiv="claude-sonnet-5",
        default_effort="medium",
        cost_weight=0.38,
    ),
    "HIGH": ModelSpec(
        tier="HIGH",
        gemini_id="gemini-4-argon",
        fallback_api_id="gemini-3.5-pro",
        claude_equiv="claude-opus-5",
        default_effort="high",
        cost_weight=1.00,
    ),
}

TIER_ESCALATION_ORDER: Dict[str, str] = {
    "ZERO_LLM": "LOW",
    "LOW": "MEDIUM",
    "MEDIUM": "HIGH",
    "HIGH": "HIGH",
}

# Explicit Registry of Post-Tool Hints (Injected for 1 turn after tool execution)
HINT_REGISTRY: Dict[str, str] = {
    "execute_safe_sql": (
        "HINT [execute_safe_sql]: Formate valores monetários em USD ($), destaque o top 1 do ranking "
        "e diferencie consulta vazia (EMPTY_RESULT) de falha técnica (TOOL_ERROR)."
    ),
    "ast_security_guard": (
        "HINT [ast_security_guard]: Bloqueio AST acionado. Informe ao usuário que apenas consultas "
        "SELECT de leitura são permitidas pelo guardrail de governança."
    ),
    "recommend_visualization": (
        "HINT [recommend_visualization]: Priorize gráfico de barras para rankings categóricos e "
        "linha temporal para séries históricas."
    ),
}


@dataclass(frozen=True, slots=True)
class RoutingStep:
    etapa: int
    skill: str
    tier: str
    modelo_selecionado: str
    effort: str
    justificativa_custo_performance: str
    contexto_minimo: str
    validador_aceite: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "etapa": self.etapa,
            "skill": self.skill,
            "tier": self.tier,
            "modelo_selecionado": self.modelo_selecionado,
            "effort": self.effort,
            "justificativa_custo_performance": self.justificativa_custo_performance,
            "contexto_minimo": self.contexto_minimo,
            "validador_aceite": self.validador_aceite,
        }


@dataclass(frozen=True, slots=True)
class CircuitBreakerEvent:
    step_skill: str
    from_model: str
    to_model: str
    failure_signal: str
    action_taken: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "step_skill": self.step_skill,
            "from_model": self.from_model,
            "to_model": self.to_model,
            "failure_signal": self.failure_signal,
            "action_taken": self.action_taken,
        }


@dataclass(frozen=True, slots=True)
class RoutingPlan:
    correlation_id: str
    analise_complexidade: str
    economia_estimada_pct: int
    plano_execucao: List[RoutingStep]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "correlation_id": self.correlation_id,
            "analise_complexidade": self.analise_complexidade,
            "economia_estimada_pct": self.economia_estimada_pct,
            "plano_execucao": [step.to_dict() for step in self.plano_execucao],
        }


# ============================================================================
# 2. APPLICATION LAYER — Ports & Session Working Memory
# ============================================================================

class WorkingMemoryPort(Protocol):
    def get_session(self, session_id: str) -> Dict[str, Any]: ...
    def update_session(self, session_id: str, **facts: Any) -> Dict[str, Any]: ...


class InMemoryWorkingMemoryAdapter:
    """
    Isolated Working Memory per session_id/chat_id.
    Tracks collected facts, active hints, and cumulative estimated tokens for the 350k handoff protocol.
    """
    HANDOFF_TOKEN_THRESHOLD = 350_000

    def __init__(self) -> None:
        self._store: Dict[str, Dict[str, Any]] = {}

    def get_session(self, session_id: str) -> Dict[str, Any]:
        if session_id not in self._store:
            self._store[session_id] = {
                "session_id": session_id,
                "created_at": time.time(),
                "turn_count": 0,
                "estimated_tokens": 0,
                "last_page_context": "general",
                "last_intent": None,
                "active_hint": None,
                "handoff_recommended": False,
            }
        return self._store[session_id]

    def update_session(self, session_id: str, **facts: Any) -> Dict[str, Any]:
        sess = self.get_session(session_id)
        sess["turn_count"] = sess.get("turn_count", 0) + 1
        sess.update(facts)
        if sess.get("estimated_tokens", 0) >= self.HANDOFF_TOKEN_THRESHOLD:
            sess["handoff_recommended"] = True
        return sess


# ============================================================================
# 3. HARNESS ROUTER & CIRCUIT BREAKER USE CASE
# ============================================================================

class HarnessRouter:
    """
    Cognitive Router & FinOps Governor for the Multi-Agent Orchestrator.
    Follows Downgrade by Default, Hybrid Planning/Execution, and Circuit Breaker escalation.
    """

    def __init__(self, memory: Optional[WorkingMemoryPort] = None) -> None:
        self.memory = memory or InMemoryWorkingMemoryAdapter()

    def classify_query_tier(self, message: str, page_context: str) -> tuple[str, str, str]:
        """
        Returns (sql_tier, insight_tier, complexity_summary).
        """
        q = (message or "").lower()

        # Check for destructive / SQL injection patterns -> High risk security analysis
        if any(kw in q for kw in ("drop ", "delete ", "truncate ", "alter ", "insert ", "update ", "pg_sleep", ";")):
            return (
                "ZERO_LLM",
                "HIGH",
                "Tentativa crítica de mutação/SQL Injection detectada; bloqueio determinístico AST Nível 0 + auditoria Argon.",
            )

        # Multi-table complex analytical queries (Joins + Aggregations + Date filters or Delay SLA)
        complex_keywords = (
            "comprou mais", "top", "faturamento", "receita", "vendedor",
            "atraso", "atrasado", "categoria", "regiao", "país", "pais", "estoque"
        )
        if any(kw in q for kw in complex_keywords):
            return (
                "MEDIUM",
                "MEDIUM",
                f"Consulta analítica multi-tabela (Star Schema JOIN + agregação financeira) no contexto '{page_context}'.",
            )

        # Simple contextual listing -> Downgrade by Default to Hydrogen
        return (
            "LOW",
            "LOW",
            f"Listagem tabular direta de baixa complexidade no contexto '{page_context}' (Downgrade by Default).",
        )

    def build_routing_plan(self, message: str, page_context: str, session_id: str = "default") -> RoutingPlan:
        corr_id = f"corr_{uuid.uuid4().hex[:8]}"
        sql_tier, insight_tier, summary = self.classify_query_tier(message, page_context)

        sql_spec = MODEL_MATRIX[sql_tier]
        insight_spec = MODEL_MATRIX[insight_tier]
        low_spec = MODEL_MATRIX["LOW"]
        zero_spec = MODEL_MATRIX["ZERO_LLM"]

        steps: List[RoutingStep] = [
            RoutingStep(
                etapa=1,
                skill="sql_agent_text_to_sql",
                tier=sql_spec.tier,
                modelo_selecionado=sql_spec.gemini_id,
                effort=sql_spec.default_effort,
                justificativa_custo_performance=(
                    "Bloqueio determinístico Nível 0 sem gasto de tokens."
                    if sql_tier == "ZERO_LLM"
                    else (
                        "Raciocínio relacional com JOINs e agregação financeira exige precisão do Neon."
                        if sql_tier == "MEDIUM"
                        else "Query simples de 1 tabela resolvida com latência mínima pelo Hydrogen."
                    )
                ),
                contexto_minimo=f"prompt='{message[:80]}', page_context='{page_context}'",
                validador_aceite="Gate AST sqlglot (Single statement SELECT/UNION-only) + execução MCP",
            ),
            RoutingStep(
                etapa=2,
                skill="ast_security_validator",
                tier=zero_spec.tier,
                modelo_selecionado=zero_spec.gemini_id,
                effort="low",
                justificativa_custo_performance="Onde validação determinística AST (sqlglot) resolve, custo de LLM é zero.",
                contexto_minimo="sql_query gerada na etapa 1",
                validador_aceite="Árvore Sintática Abstrata (AST) livre de nós DDL/DML",
            ),
            RoutingStep(
                etapa=3,
                skill="data_analyst_and_visualization",
                tier=low_spec.tier,
                modelo_selecionado=low_spec.gemini_id,
                effort="low",
                justificativa_custo_performance=(
                    "Regra Híbrida (Downgrade by Default): estatísticas descritivas e escolha de gráfico sobre schema fixo."
                ),
                contexto_minimo="shape do dataset retornado pelo MCP (colunas e tipos)",
                validador_aceite="Schema JSON de métricas e tipo de gráfico válido",
            ),
            RoutingStep(
                etapa=4,
                skill="business_insight_synthesizer",
                tier=insight_spec.tier,
                modelo_selecionado=insight_spec.gemini_id,
                effort=insight_spec.default_effort,
                justificativa_custo_performance=(
                    "Síntese executiva de incidente de segurança."
                    if insight_tier == "HIGH"
                    else (
                        "Interpretação de diferencial competitivo e recomendação de negócio com Neon."
                        if insight_tier == "MEDIUM"
                        else "Resumo conciso de listagem operacional com Hydrogen."
                    )
                ),
                contexto_minimo="top_3 registros + métricas agregadas + hint pós-tool",
                validador_aceite="Lista não-vazia de insights acionáveis no idioma do usuário",
            ),
        ]

        # Estimate FinOps savings vs running all 4 steps on Argon (cost_weight = 4.0)
        total_weight = (
            sql_spec.cost_weight
            + zero_spec.cost_weight
            + low_spec.cost_weight
            + insight_spec.cost_weight
        )
        savings_pct = max(0, min(95, round((1.0 - (total_weight / 4.0)) * 100)))

        return RoutingPlan(
            correlation_id=corr_id,
            analise_complexidade=summary,
            economia_estimada_pct=savings_pct,
            plano_execucao=steps,
        )

    def escalate_step(self, current_tier: str, skill_name: str, error_msg: str) -> tuple[ModelSpec, CircuitBreakerEvent]:
        """
        Circuit Breaker: Never repeat on the same model after a logic/syntax failure.
        Immediately escalates Hydrogen -> Neon -> Argon attaching the previous failure signal.
        """
        next_tier = TIER_ESCALATION_ORDER.get(current_tier, "HIGH")
        cur_spec = MODEL_MATRIX.get(current_tier, MODEL_MATRIX["LOW"])
        next_spec = MODEL_MATRIX[next_tier]

        event = CircuitBreakerEvent(
            step_skill=skill_name,
            from_model=cur_spec.gemini_id,
            to_model=next_spec.gemini_id,
            failure_signal=error_msg,
            action_taken=(
                f"Circuit Breaker ativado: subtarefa '{skill_name}' escalonada de "
                f"{cur_spec.gemini_id} para {next_spec.gemini_id} anexando erro anterior."
            ),
        )
        return next_spec, event
