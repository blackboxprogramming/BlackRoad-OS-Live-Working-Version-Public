"""
Data Validator Agent

Validates data quality and integrity using rules, constraints,
and statistical checks to ensure data meets required standards.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class DataValidatorAgent(BaseAgent):
    """
    Validates data quality and integrity.

    Supports:
    - Schema validation
    - Constraint checking (unique, not null, range)
    - Data type validation
    - Business rule validation
    - Statistical validation
    - Referential integrity checks
    """

    def __init__(self):
        super().__init__(
            name='data-validator',
            description='Validate data quality and integrity',
            category='data',
            version='1.0.0',
            tags=['validation', 'data-quality', 'integrity', 'constraints']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate data against specified rules.

        Args:
            params: {
                'data_source': str,
                'schema': {
                    'columns': [
                        {
                            'name': str,
                            'type': 'string|integer|float|boolean|date',
                            'nullable': bool,
                            'unique': bool,
                            'constraints': {
                                'min': Any,
                                'max': Any,
                                'pattern': str,
                                'allowed_values': List[Any]
                            }
                        }
                    ],
                    'primary_key': List[str],
                    'foreign_keys': List[Dict[str, Any]]
                },
                'rules': [
                    {
                        'name': str,
                        'type': 'expression|function|statistical',
                        'condition': str,
                        'severity': 'error|warning|info'
                    }
                ],
                'options': {
                    'fail_on_error': bool,
                    'max_errors': int,
                    'sampling_rate': float,
                    'detailed_report': bool
                }
            }

        Returns:
            {
                'status': 'valid|invalid|warnings',
                'total_rows': int,
                'valid_rows': int,
                'invalid_rows': int,
                'errors_found': int,
                'warnings_found': int,
                'validation_score': float,
                'checks_performed': int,
                'checks_passed': int,
                'checks_failed': int,
                'execution_time_seconds': float,
                'violations': List[Dict[str, Any]],
                'statistics': {
                    'null_percentage': float,
                    'duplicate_percentage': float,
                    'outlier_percentage': float
                },
                'recommendations': List[str]
            }
        """
        data_source = params.get('data_source')
        schema = params.get('schema', {})
        rules = params.get('rules', [])
        options = params.get('options', {})

        self.logger.info(
            f"Validating data from '{data_source}' "
            f"with {len(rules)} rules"
        )

        # Mock validation results
        total_rows = 10000
        errors = 45
        warnings = 120
        valid_rows = total_rows - errors

        checks_performed = len(rules) + len(schema.get('columns', []))
        checks_failed = 5

        return {
            'status': 'warnings' if errors == 0 and warnings > 0 else ('invalid' if errors > 0 else 'valid'),
            'data_source': data_source,
            'total_rows': total_rows,
            'valid_rows': valid_rows,
            'invalid_rows': errors,
            'errors_found': errors,
            'warnings_found': warnings,
            'validation_score': 0.955,
            'checks_performed': checks_performed,
            'checks_passed': checks_performed - checks_failed,
            'checks_failed': checks_failed,
            'execution_time_seconds': 3.2,
            'violations': [
                {
                    'row': 125,
                    'column': 'email',
                    'rule': 'format_validation',
                    'severity': 'error',
                    'message': 'Invalid email format',
                    'value': 'invalid-email'
                },
                {
                    'row': 341,
                    'column': 'age',
                    'rule': 'range_check',
                    'severity': 'error',
                    'message': 'Value out of range (0-120)',
                    'value': 150
                },
                {
                    'row': 892,
                    'column': 'revenue',
                    'rule': 'null_check',
                    'severity': 'warning',
                    'message': 'Unexpected null value',
                    'value': None
                }
            ],
            'statistics': {
                'null_percentage': 3.2,
                'duplicate_percentage': 1.5,
                'outlier_percentage': 0.8,
                'completeness_score': 96.8,
                'consistency_score': 98.5,
                'accuracy_score': 95.5
            },
            'recommendations': [
                'Add email format validation in data source',
                'Implement age range constraints at input',
                'Review null handling strategy for revenue field',
                'Consider adding unique constraints on id column'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate validator parameters."""
        if 'data_source' not in params:
            self.logger.error("Missing required field: data_source")
            return False

        if 'schema' not in params and 'rules' not in params:
            self.logger.error("Either schema or rules must be provided")
            return False

        return True
