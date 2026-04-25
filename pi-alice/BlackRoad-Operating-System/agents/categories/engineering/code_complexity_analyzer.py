"""
Code Complexity Analyzer Agent

Analyzes code complexity using various metrics including cyclomatic
complexity, cognitive complexity, and maintainability index.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class CodeComplexityAnalyzerAgent(BaseAgent):
    """
    Analyzes code complexity metrics.

    Metrics:
    - Cyclomatic complexity
    - Cognitive complexity
    - Halstead metrics
    - Maintainability index
    - Lines of code
    - Nesting depth
    """

    def __init__(self):
        super().__init__(
            name='code-complexity-analyzer',
            description='Analyze code complexity metrics',
            category='engineering',
            version='1.0.0',
            tags=['complexity', 'metrics', 'analysis', 'maintainability']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze code complexity.

        Args:
            params: {
                'target_path': str,
                'language': 'python|javascript|typescript|go|rust',
                'metrics': List[str],    # Metrics to calculate
                'options': {
                    'complexity_threshold': int,
                    'include_tests': bool,
                    'generate_report': bool,
                    'format': 'json|html|text'
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'complexity_metrics': Dict,
                'complex_functions': List[Dict],
                'maintainability_score': float,
                'recommendations': List[str]
            }
        """
        target_path = params.get('target_path')
        language = params.get('language', 'python')
        metrics = params.get('metrics', ['all'])
        options = params.get('options', {})

        self.logger.info(
            f"Analyzing complexity of {target_path}"
        )

        # Mock complexity analysis
        complex_functions = [
            {
                'name': 'process_user_data',
                'file': 'src/services/user_service.py',
                'line': 45,
                'cyclomatic_complexity': 18,
                'cognitive_complexity': 24,
                'nesting_depth': 5,
                'lines_of_code': 87,
                'parameters': 6,
                'severity': 'high',
                'suggestion': 'Break down into smaller functions'
            },
            {
                'name': 'validate_form',
                'file': 'src/utils/validators.py',
                'line': 123,
                'cyclomatic_complexity': 15,
                'cognitive_complexity': 19,
                'nesting_depth': 4,
                'lines_of_code': 65,
                'parameters': 4,
                'severity': 'high',
                'suggestion': 'Extract validation rules into separate functions'
            },
            {
                'name': 'calculate_pricing',
                'file': 'src/services/pricing.py',
                'line': 234,
                'cyclomatic_complexity': 12,
                'cognitive_complexity': 16,
                'nesting_depth': 3,
                'lines_of_code': 54,
                'parameters': 5,
                'severity': 'medium',
                'suggestion': 'Simplify conditional logic'
            },
            {
                'name': 'handle_api_request',
                'file': 'src/api/routes.py',
                'line': 67,
                'cyclomatic_complexity': 11,
                'cognitive_complexity': 14,
                'nesting_depth': 3,
                'lines_of_code': 48,
                'parameters': 3,
                'severity': 'medium',
                'suggestion': 'Use early returns to reduce nesting'
            }
        ]

        complexity_metrics = {
            'average_cyclomatic_complexity': 8.3,
            'max_cyclomatic_complexity': 18,
            'average_cognitive_complexity': 10.5,
            'max_cognitive_complexity': 24,
            'average_nesting_depth': 2.1,
            'max_nesting_depth': 5,
            'average_function_length': 32.4,
            'max_function_length': 87,
            'total_functions': 156,
            'complex_functions': len(complex_functions)
        }

        file_metrics = [
            {
                'file': 'src/services/user_service.py',
                'complexity': 45.2,
                'maintainability': 62.3,
                'lines': 456,
                'functions': 23,
                'classes': 3
            },
            {
                'file': 'src/utils/validators.py',
                'complexity': 38.7,
                'maintainability': 68.5,
                'lines': 345,
                'functions': 18,
                'classes': 1
            },
            {
                'file': 'src/services/pricing.py',
                'complexity': 32.4,
                'maintainability': 72.1,
                'lines': 289,
                'functions': 15,
                'classes': 2
            }
        ]

        halstead_metrics = {
            'program_vocabulary': 234,
            'program_length': 1456,
            'calculated_length': 1398,
            'volume': 12456.3,
            'difficulty': 23.4,
            'effort': 291478.2,
            'time_to_program': 16193.2,  # seconds
            'bugs_estimate': 4.15
        }

        return {
            'status': 'success',
            'target_path': target_path,
            'language': language,
            'complexity_metrics': complexity_metrics,
            'complex_functions': complex_functions,
            'total_complex_functions': len(complex_functions),
            'file_metrics': file_metrics,
            'halstead_metrics': halstead_metrics,
            'maintainability_score': 71.4,
            'maintainability_grade': 'C',
            'files_analyzed': 23,
            'total_lines': 5678,
            'total_functions': 156,
            'total_classes': 18,
            'complexity_distribution': {
                'low': 112,       # < 10
                'medium': 32,     # 10-20
                'high': 8,        # 20-30
                'very_high': 4    # > 30
            },
            'severity_counts': {
                'critical': 2,
                'high': 6,
                'medium': 15,
                'low': 133
            },
            'trends': {
                'improving': 12,
                'stable': 134,
                'degrading': 10
            },
            'recommendations': [
                'Refactor process_user_data to reduce complexity from 18 to < 10',
                'Break down validate_form into smaller validation functions',
                'Use guard clauses to reduce nesting depth',
                'Extract complex conditionals into named functions',
                'Consider using design patterns (Strategy, Chain of Responsibility)',
                'Add unit tests for complex functions',
                'Set complexity thresholds in CI/CD',
                'Regular code reviews focusing on complexity'
            ],
            'comparison_to_standards': {
                'cyclomatic_complexity_threshold': 10,
                'functions_exceeding_threshold': 12,
                'maintainability_threshold': 80,
                'files_below_threshold': 18
            },
            'reports_generated': [
                'complexity-report.html',
                'complexity-metrics.json',
                'complexity-trends.csv'
            ] if options.get('generate_report') else [],
            'next_steps': [
                'Review and refactor high-complexity functions',
                'Set up complexity monitoring in CI/CD',
                'Add complexity budgets per file/function',
                'Train team on writing simpler code',
                'Implement automated complexity checks',
                'Track complexity trends over time'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate complexity analysis parameters."""
        if 'target_path' not in params:
            self.logger.error("Missing required field: target_path")
            return False

        return True
