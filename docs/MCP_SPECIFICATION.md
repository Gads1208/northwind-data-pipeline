# 🔌 Model Context Protocol (MCP) Server Specification

The **Northwind MCP Server** adheres to the official Model Context Protocol standard, providing tools, schema reflection, and standardized data access interfaces for AI agents.

---

## 🛠️ Exposed MCP Tools

### 1. `get_database_schema`
- **Description**: Returns all PostgreSQL Northwind database tables, column names, data types, and primary/foreign key relationships.
- **Input Schema**: `{}`
- **Output**: JSON dictionary mapping table names to list of column definitions.

### 2. `execute_safe_sql`
- **Description**: Safely executes a read-only `SELECT` query against the database with SQL injection protection and row limits.
- **Input Schema**:
  ```json
  {
    "sql_query": "SELECT * FROM customers LIMIT 10;",
    "max_rows": 500
  }
  ```
- **Security Check**: Enforces AST validation; rejects any `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `EXEC`.

### 3. `get_kpis`
- **Description**: Returns high-level business indicators (Total Revenue, Total Orders, Average Order Value, Active Customers).

### 4. `get_sales_analytics`
- **Description**: Returns sales breakdown aggregated by `category`, `employee`, `country`, or `customer`.

### 5. `explain_business_rules`
- **Description**: Provides documentation of Northwind extended price formulas, discount policies, and inventory reorder thresholds.

### 6. `recommend_visualization`
- **Description**: Evaluates dataset shape and numerical/categorical fields to output formatted chart specifications (ECharts / Recharts format).
