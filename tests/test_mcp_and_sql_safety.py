import unittest
import sys
import os

# Add root directory to sys.path for module importing
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../apps/mcp-server')))

from tools.db_tools import validate_safe_sql
from tools.vis_tools import recommend_visualization

class TestMCPSafetyAndTools(unittest.TestCase):

    def test_sql_safety_valid_select(self):
        valid_query = "SELECT * FROM customers WHERE country = 'Germany';"
        is_valid, msg = validate_safe_sql(valid_query)
        self.assertTrue(is_valid)

    def test_sql_safety_reject_drop(self):
        drop_query = "DROP TABLE customers;"
        is_valid, msg = validate_safe_sql(drop_query)
        self.assertFalse(is_valid)

    def test_sql_safety_reject_delete(self):
        delete_query = "DELETE FROM orders WHERE order_id = 10248;"
        is_valid, msg = validate_safe_sql(delete_query)
        self.assertFalse(is_valid)

    def test_sql_safety_reject_update(self):
        update_query = "UPDATE products SET unit_price = 100 WHERE product_id = 1;"
        is_valid, msg = validate_safe_sql(update_query)
        self.assertFalse(is_valid)

    def test_recommend_visualization_pie(self):
        data = [
            {"category": "Beverages", "sales": 5000},
            {"category": "Produce", "sales": 3000}
        ]
        res = recommend_visualization(data)
        self.assertEqual(res["recommended_chart"], "pie")

    def test_recommend_visualization_bar(self):
        data = [{"item": f"Item {i}", "val": i * 10} for i in range(12)]
        res = recommend_visualization(data)
        self.assertEqual(res["recommended_chart"], "bar")

if __name__ == "__main__":
    unittest.main()
