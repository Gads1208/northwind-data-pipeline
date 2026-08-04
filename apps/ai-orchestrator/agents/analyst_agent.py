class DataAnalystAgent:
    """Specialized agent for data analysis, aggregations, metrics, and KPI summaries."""
    
    def analyze_dataset(self, data: list, query_text: str) -> dict:
        if not data:
            return {"summary": "Nenhum dado encontrado para os critérios informados.", "metrics": {}}
            
        total_rows = len(data)
        metrics = {"total_rows": total_rows}
        
        # Check numerical columns
        sample = data[0]
        numeric_keys = [k for k, v in sample.items() if isinstance(v, (int, float))]
        
        for k in numeric_keys:
            vals = [float(row[k]) for row in data if row.get(k) is not None]
            if vals:
                metrics[f"{k}_sum"] = round(sum(vals), 2)
                metrics[f"{k}_avg"] = round(sum(vals) / len(vals), 2)
                metrics[f"{k}_max"] = max(vals)
                metrics[f"{k}_min"] = min(vals)

        return {
            "summary": f"Análise concluída com sucesso sobre {total_rows} registros.",
            "metrics": metrics
        }
