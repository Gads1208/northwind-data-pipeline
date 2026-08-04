class BusinessInsightAgent:
    """Specialized agent for synthesizing automated strategic business takeaways."""
    
    def generate_insights(self, query_text: str, data: list, metrics: dict) -> list[str]:
        if not data:
            return ["Nenhum insight disponível para o conjunto de dados atual."]
            
        insights = []
        sample = data[0]
        
        # Check top item
        first_row = data[0]
        name_col = next((k for k in first_row.keys() if "name" in k or "company" in k or "category" in k or "country" in k), None)
        val_col = next((k for k in first_row.keys() if "spent" in k or "sales" in k or "revenue" in k or "total" in k), None)
        
        if name_col and val_col:
            top_name = first_row[name_col]
            top_val = first_row[val_col]
            insights.append(f"🏆 Liderança destacada: **{top_name}** lidera o ranking com **{top_val}**.")
            
        if len(data) > 1 and val_col:
            top_val = float(first_row[val_col]) if isinstance(first_row[val_col], (int, float)) else 0
            second_val = float(data[1][val_col]) if isinstance(data[1][val_col], (int, float)) else 0
            if top_val > 0 and second_val > 0:
                diff_pct = round(((top_val - second_val) / top_val) * 100, 1)
                insights.append(f"📈 Diferencial competitivo: O líder está **{diff_pct}%** à frente do segundo colocado.")

        if "atrasado" in query_text.lower() or "atraso" in query_text.lower():
            insights.append("⚠️ Alerta Operacional: Recomenda-se revisar a logística e capacidade da transportadora principal.")
            
        if "produto" in query_text.lower() and "parado" in query_text.lower():
            insights.append("💡 Otimização de Estoque: Avaliar estratégias de promoção ou descontinuação para itens com baixa rotatividade.")

        insights.append("📊 Resumo: Dados extraídos diretamente do modelo analítico Northwind via MCP.")
        return insights
