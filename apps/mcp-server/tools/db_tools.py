import os
import re

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
except ImportError:
    psycopg2 = None
    RealDictCursor = None

try:
    import sqlglot
except ImportError:
    sqlglot = None

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://northwind:northwind123@postgres:5432/northwind")

def get_db_connection():
    """Returns a connection to the Northwind PostgreSQL database."""
    if psycopg2 is None:
        raise RuntimeError("psycopg2 is not installed in the current environment.")
    return psycopg2.connect(DATABASE_URL)

def get_database_schema() -> dict:
    """Returns complete database schema with tables, columns, data types, and primary/foreign keys."""
    if psycopg2 is None:
        return {"tables": {}}
    query = """
    SELECT 
        t.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable
    FROM information_schema.tables t
    JOIN information_schema.columns c ON t.table_name = c.table_name
    WHERE t.table_schema = 'public'
    ORDER BY t.table_name, c.ordinal_position;
    """
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query)
            rows = cur.fetchall()
            
        schema = {}
        for r in rows:
            table = r['table_name']
            if table not in schema:
                schema[table] = []
            schema[table].append({
                "column": r['column_name'],
                "type": r['data_type'],
                "nullable": r['is_nullable']
            })
        return {"tables": schema}
    finally:
        conn.close()

def validate_safe_sql(sql_query: str) -> tuple[bool, str]:
    """
    Validates that SQL is strictly a single, read-only SELECT statement.
    Serves as the Deterministic Gate for the Orchestrator Circuit Breaker.
    """
    if not sql_query or not sql_query.strip():
        return False, "AST_SYNTAX_ERROR: Empty SQL query."

    raw_trimmed = sql_query.strip().rstrip(";").strip()
    # Block multiple statements separated by semicolons
    if ";" in raw_trimmed:
        return False, "AST_SECURITY_VIOLATION: Multiple SQL statements (;) are strictly forbidden."

    cleaned = raw_trimmed.lower()

    forbidden_keywords = [
        "insert", "update", "delete", "drop", "alter", "truncate", "create",
        "grant", "revoke", "exec", "execute", "copy", "pg_sleep"
    ]

    tokens = re.findall(r'\b\w+\b', cleaned)
    for kw in forbidden_keywords:
        if kw in tokens:
            return False, f"AST_SECURITY_VIOLATION: Forbidden SQL operation detected: {kw.upper()}"

    if not cleaned.startswith("select") and not cleaned.startswith("with"):
        return False, "AST_SECURITY_VIOLATION: SQL query must begin with SELECT or WITH."

    # Strict AST checking using sqlglot (never swallow parse errors)
    if sqlglot:
        try:
            statements = [s for s in sqlglot.parse(raw_trimmed) if s is not None]
            if len(statements) != 1:
                return False, "AST_SECURITY_VIOLATION: Query must contain exactly one SQL statement."
            parsed = statements[0]
            if not isinstance(parsed, (sqlglot.exp.Select, sqlglot.exp.Union)):
                return False, f"AST_SECURITY_VIOLATION: Root AST node must be SELECT or UNION (got {type(parsed).__name__})."
        except Exception as parse_err:
            return False, f"AST_SYNTAX_ERROR: Invalid SQL syntax detected by AST parser ({parse_err})."

    return True, "Valid SELECT query."

from decimal import Decimal

def execute_safe_sql(sql_query: str, max_rows: int = 500) -> dict:
    """Executes a validated read-only SQL query safely against PostgreSQL."""
    is_valid, msg = validate_safe_sql(sql_query)
    if not is_valid:
        return {"success": False, "error": msg, "data": []}
        
    if psycopg2 is None:
        return {"success": False, "error": "psycopg2 not installed in host environment.", "data": []}

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql_query)
            rows = cur.fetchmany(max_rows)
            sanitized = []
            for row in rows:
                row_dict = {}
                for k, v in row.items():
                    if hasattr(v, 'isoformat'):
                        row_dict[k] = v.isoformat()
                    elif isinstance(v, Decimal):
                        row_dict[k] = float(v)
                    elif isinstance(v, (int, float, str, bool, type(None))):
                        row_dict[k] = v
                    else:
                        row_dict[k] = str(v)
                sanitized.append(row_dict)
                
            return {
                "success": True,
                "row_count": len(sanitized),
                "data": sanitized,
                "query": sql_query
            }

    except Exception as e:
        return {"success": False, "error": str(e), "data": []}
    finally:
        conn.close()
