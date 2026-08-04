def recommend_visualization(data: list, chart_type_override: str = None) -> dict:
    """
    Analyzes dataset shape, column types, and data size to recommend 
    the best chart type and formatted ECharts config payload.
    """
    if not data or len(data) == 0:
        return {"chart_type": "none", "reason": "Empty dataset", "spec": None}
        
    sample = data[0]
    keys = list(sample.keys())
    
    num_cols = []
    str_cols = []
    
    for k, v in sample.items():
        if isinstance(v, (int, float)):
            num_cols.append(k)
        elif isinstance(v, str):
            str_cols.append(k)
            
    chosen_chart = "bar"
    if chart_type_override:
        chosen_chart = chart_type_override.lower()
    else:
        # Heuristics for visual type selection
        if len(keys) == 2 and len(str_cols) >= 1 and len(num_cols) >= 1:
            category_key = str_cols[0]
            val_key = num_cols[0]
            if len(data) <= 6:
                chosen_chart = "pie"
            elif any(term in category_key.lower() for term in ["date", "month", "year", "time", "day"]):
                chosen_chart = "line"
            elif len(data) > 15:
                chosen_chart = "treemap"
            else:
                chosen_chart = "bar"
        elif len(num_cols) >= 2:
            chosen_chart = "scatter" if len(data) > 10 else "bar"
        elif "country" in str_cols or "region" in str_cols:
            chosen_chart = "bar"

    # Build ECharts spec
    labels = []
    values = []
    
    label_col = str_cols[0] if str_cols else keys[0]
    val_col = num_cols[0] if num_cols else (keys[1] if len(keys) > 1 else keys[0])
    
    for row in data:
        labels.append(str(row.get(label_col, "")))
        try:
            values.append(float(row.get(val_col, 0)))
        except (ValueError, TypeError):
            values.append(0.0)

    spec = {
        "chart_type": chosen_chart,
        "title": f"{val_col.replace('_', ' ').title()} by {label_col.replace('_', ' ').title()}",
        "x_axis": labels,
        "y_axis_name": val_col.replace('_', ' ').title(),
        "series": [{
            "name": val_col.replace('_', ' ').title(),
            "data": values
        }]
    }
    
    return {
        "recommended_chart": chosen_chart,
        "dimensions": {"categorical": label_col, "numerical": val_col},
        "spec": spec
    }
