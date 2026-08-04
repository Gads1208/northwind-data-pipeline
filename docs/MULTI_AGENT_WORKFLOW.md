# 🤖 Multi-Agent AI Workflow Architecture

The AI layer is structured as a collaborative network of 5 specialized autonomous agents.

---

## 🤖 Agent Roles & Responsibilities

1. **SQL Agent**:
   - Translates Portuguese/English natural language user requests into precise PostgreSQL queries.
   - Applies table aliases, date extraction, and extended price formulas (`unit_price * quantity * (1 - discount)`).
   - Validates SQL AST to guarantee read-only execution.

2. **Data Analyst Agent**:
   - Analyzes raw query result tables to compute statistical summaries, totals, averages, maximums, and percentage growth.

3. **Visualization Agent**:
   - Evaluates data shape and automatically selects the optimal visualization format (Bar Chart, Pie Chart, Line Chart, Scatter Plot, Treemap, Gauge, Heatmap).

4. **Business Insight Agent**:
   - Synthesizes executive takeaways (e.g., "Germany accounts for 28% of total revenue", "Top seller Nancy Davolio has a 15% higher average order value").

5. **Documentation Agent**:
   - Formulates explanations of SQL logic, metric definitions, and governance rules.
