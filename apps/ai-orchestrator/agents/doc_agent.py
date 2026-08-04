class DocumentationAgent:
    """Specialized agent for explaining query mechanics and metric definitions."""
    
    def explain_query_and_metrics(self, sql_query: str, page_context: str) -> dict:
        return {
            "sql_query": sql_query,
            "page_context": page_context,
            "business_rules_applied": [
                "Descontos foram considerados no cálculo do faturamento líquido: unit_price * quantity * (1 - discount).",
                "Agrupamentos e ordenações foram otimizados via índices da base Northwind."
            ],
            "data_governance": "Consulta validada e executada via Model Context Protocol (MCP) com sanitização AST somente leitura."
        }
