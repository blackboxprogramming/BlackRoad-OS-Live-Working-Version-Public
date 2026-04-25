"""
SQL Query Generator Agent

Generates SQL queries from natural language descriptions,
supporting multiple SQL dialects and complex query patterns.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class SQLQueryGeneratorAgent(BaseAgent):
    """
    Generates SQL queries from natural language.

    Supports:
    - Multiple SQL dialects (PostgreSQL, MySQL, SQLite, SQL Server, Oracle)
    - Complex joins and subqueries
    - Aggregations and window functions
    - CTEs (Common Table Expressions)
    - Query optimization suggestions
    """

    def __init__(self):
        super().__init__(
            name='sql-query-generator',
            description='Generate SQL queries from natural language',
            category='data',
            version='1.0.0',
            tags=['sql', 'query-generation', 'nlp', 'database']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate SQL query from natural language.

        Args:
            params: {
                'description': str,  # Natural language query description
                'dialect': 'postgresql|mysql|sqlite|sqlserver|oracle',
                'schema': {
                    'tables': [
                        {
                            'name': str,
                            'columns': List[Dict[str, str]],
                            'relationships': List[Dict[str, Any]]
                        }
                    ]
                },
                'options': {
                    'optimize': bool,
                    'add_comments': bool,
                    'format': bool,
                    'limit': int,
                    'explain_plan': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'query': str,
                'dialect': str,
                'query_type': 'select|insert|update|delete|create',
                'tables_used': List[str],
                'estimated_complexity': 'low|medium|high',
                'optimization_suggestions': List[str],
                'explanation': str,
                'alternative_queries': List[str],
                'warnings': List[str]
            }
        """
        description = params.get('description', '')
        dialect = params.get('dialect', 'postgresql')
        schema = params.get('schema', {})
        options = params.get('options', {})

        self.logger.info(
            f"Generating {dialect} query for: '{description[:50]}...'"
        )

        # Mock query generation
        query = self._generate_mock_query(description, dialect, options)

        return {
            'status': 'success',
            'query': query,
            'dialect': dialect,
            'query_type': 'select',
            'tables_used': ['users', 'orders', 'products'],
            'estimated_complexity': 'medium',
            'estimated_rows': 1500,
            'joins_used': 2,
            'has_subquery': False,
            'has_aggregation': True,
            'optimization_suggestions': [
                'Add index on users.email for better performance',
                'Consider partitioning orders table by date',
                'Use EXPLAIN ANALYZE to verify query plan'
            ],
            'explanation': (
                'This query retrieves user information along with their order statistics. '
                'It joins the users table with orders and products, filtering for active users '
                'and calculating total order amounts grouped by user.'
            ),
            'alternative_queries': [
                'Using window functions for better performance',
                'Using CTEs for improved readability'
            ],
            'warnings': [
                'Query may be slow on large datasets without proper indexes',
                'Consider adding date range filter to limit result set'
            ],
            'execution_time_estimate': '0.5-2.0 seconds'
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate query generation parameters."""
        if 'description' not in params or not params['description']:
            self.logger.error("Missing required field: description")
            return False

        valid_dialects = ['postgresql', 'mysql', 'sqlite', 'sqlserver', 'oracle']
        dialect = params.get('dialect', 'postgresql')

        if dialect not in valid_dialects:
            self.logger.error(f"Invalid SQL dialect: {dialect}")
            return False

        return True

    def _generate_mock_query(
        self,
        description: str,
        dialect: str,
        options: Dict[str, Any]
    ) -> str:
        """Generate a mock SQL query."""
        query = """
SELECT
    u.id,
    u.name,
    u.email,
    COUNT(o.id) as order_count,
    SUM(o.amount) as total_amount,
    AVG(o.amount) as avg_order_value
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
LEFT JOIN products p ON o.product_id = p.id
WHERE u.status = 'active'
    AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_amount DESC
LIMIT 100;
"""
        if options.get('format', True):
            return query.strip()
        return query.replace('\n', ' ').strip()
