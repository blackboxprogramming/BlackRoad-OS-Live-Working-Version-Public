"""
Data Transformer Agent

Transforms and cleans data using various operations like filtering,
mapping, aggregation, normalization, and data type conversions.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class DataTransformerAgent(BaseAgent):
    """
    Transforms and cleans data with flexible operations.

    Supports:
    - Data cleaning (nulls, duplicates, outliers)
    - Type conversions and casting
    - String operations and formatting
    - Mathematical transformations
    - Date/time manipulation
    - Column operations (rename, drop, create)
    """

    def __init__(self):
        super().__init__(
            name='data-transformer',
            description='Transform and clean data with advanced operations',
            category='data',
            version='1.0.0',
            tags=['transformation', 'cleaning', 'etl', 'data-quality']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform data using specified operations.

        Args:
            params: {
                'data_source': str,  # File path, table name, or data reference
                'transformations': [
                    {
                        'operation': 'filter|map|aggregate|normalize|cast|clean',
                        'column': str,
                        'config': {
                            'condition': str,      # For filter
                            'function': str,       # For map
                            'aggregation': str,    # For aggregate
                            'method': str,         # For normalize
                            'target_type': str,    # For cast
                            'strategy': str        # For clean
                        }
                    }
                ],
                'options': {
                    'remove_duplicates': bool,
                    'handle_nulls': 'drop|fill|ignore',
                    'null_fill_value': Any,
                    'validate_output': bool,
                    'preserve_original': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'rows_input': int,
                'rows_output': int,
                'columns_input': int,
                'columns_output': int,
                'transformations_applied': int,
                'duplicates_removed': int,
                'nulls_handled': int,
                'execution_time_seconds': float,
                'data_quality_score': float,
                'warnings': List[str],
                'output_preview': List[Dict[str, Any]]
            }
        """
        data_source = params.get('data_source')
        transformations = params.get('transformations', [])
        options = params.get('options', {})

        self.logger.info(
            f"Transforming data from '{data_source}' "
            f"with {len(transformations)} operations"
        )

        # Mock transformation results
        rows_input = 10000
        duplicates = 150
        nulls = 320
        rows_output = rows_input - (duplicates if options.get('remove_duplicates') else 0)

        return {
            'status': 'success',
            'data_source': data_source,
            'rows_input': rows_input,
            'rows_output': rows_output,
            'columns_input': 12,
            'columns_output': 15,  # Some transformations added columns
            'transformations_applied': len(transformations),
            'duplicates_removed': duplicates if options.get('remove_duplicates') else 0,
            'nulls_handled': nulls,
            'null_strategy': options.get('handle_nulls', 'drop'),
            'execution_time_seconds': 2.4,
            'data_quality_score': 0.94,
            'type_conversions': 3,
            'columns_renamed': 2,
            'columns_created': 3,
            'warnings': [
                'Found 320 null values in column "age"',
                'Detected potential outliers in column "revenue"'
            ],
            'output_preview': [
                {'id': 1, 'name': 'Alice', 'age': 30, 'revenue': 50000},
                {'id': 2, 'name': 'Bob', 'age': 25, 'revenue': 45000},
                {'id': 3, 'name': 'Charlie', 'age': 35, 'revenue': 60000}
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate transformation parameters."""
        if 'data_source' not in params:
            self.logger.error("Missing required field: data_source")
            return False

        if 'transformations' not in params or not params['transformations']:
            self.logger.error("At least one transformation is required")
            return False

        valid_operations = ['filter', 'map', 'aggregate', 'normalize', 'cast', 'clean']
        for transform in params.get('transformations', []):
            if transform.get('operation') not in valid_operations:
                self.logger.error(f"Invalid operation: {transform.get('operation')}")
                return False

        return True
