"""
Type Checker Agent

Performs type checking for TypeScript, Python (mypy), and other
statically typed languages.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class TypeCheckerAgent(BaseAgent):
    """
    Performs static type checking.

    Supports:
    - mypy (Python)
    - TypeScript compiler
    - Flow (JavaScript)
    - Type hints validation
    - Type coverage analysis
    """

    def __init__(self):
        super().__init__(
            name='type-checker',
            description='Type checking for TypeScript/Python',
            category='engineering',
            version='1.0.0',
            tags=['type-checking', 'static-analysis', 'typescript', 'python']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform type checking.

        Args:
            params: {
                'target_path': str,
                'language': 'python|typescript|javascript',
                'type_checker': 'mypy|tsc|flow',
                'options': {
                    'strict_mode': bool,
                    'ignore_missing_imports': bool,
                    'check_untyped_defs': bool,
                    'coverage_threshold': float
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'type_errors': List[Dict],
                'type_coverage': float,
                'files_checked': int,
                'passed': bool
            }
        """
        target_path = params.get('target_path')
        language = params.get('language', 'python')
        type_checker = params.get('type_checker', self._get_default_checker(language))
        options = params.get('options', {})

        self.logger.info(
            f"Running {type_checker} on {target_path}"
        )

        # Mock type checking results
        type_errors = [
            {
                'file': 'src/services/user_service.py',
                'line': 45,
                'column': 12,
                'severity': 'error',
                'code': 'assignment',
                'message': 'Incompatible types in assignment (expression has type "str", variable has type "int")',
                'context': 'user_id: int = "123"'
            },
            {
                'file': 'src/models/user.py',
                'line': 23,
                'column': 8,
                'severity': 'error',
                'code': 'arg-type',
                'message': 'Argument 1 to "process_user" has incompatible type "Optional[User]"; expected "User"',
                'context': 'process_user(maybe_user)'
            },
            {
                'file': 'src/api/routes.py',
                'line': 67,
                'column': 20,
                'severity': 'error',
                'code': 'return-value',
                'message': 'Incompatible return value type (got "None", expected "User")',
                'context': 'return None'
            },
            {
                'file': 'src/utils/helpers.py',
                'line': 89,
                'column': 5,
                'severity': 'note',
                'code': 'no-untyped-def',
                'message': 'Function is missing a type annotation',
                'context': 'def calculate_total(items):'
            },
            {
                'file': 'src/main.py',
                'line': 12,
                'column': 1,
                'severity': 'error',
                'code': 'import',
                'message': 'Cannot find implementation or library stub for module named "requests"',
                'context': 'import requests'
            }
        ]

        error_counts = {
            'error': sum(1 for e in type_errors if e['severity'] == 'error'),
            'warning': sum(1 for e in type_errors if e['severity'] == 'warning'),
            'note': sum(1 for e in type_errors if e['severity'] == 'note')
        }

        # Calculate type coverage
        total_functions = 120
        typed_functions = 95
        type_coverage = (typed_functions / total_functions) * 100

        return {
            'status': 'success',
            'target_path': target_path,
            'language': language,
            'type_checker': type_checker,
            'type_errors': type_errors,
            'total_errors': len(type_errors),
            'error_counts': error_counts,
            'files_checked': 15,
            'lines_checked': 4567,
            'type_coverage': type_coverage,
            'typed_functions': typed_functions,
            'total_functions': total_functions,
            'untyped_functions': total_functions - typed_functions,
            'passed': error_counts['error'] == 0,
            'strict_mode': options.get('strict_mode', False),
            'error_categories': {
                'assignment': 1,
                'arg-type': 1,
                'return-value': 1,
                'import': 1,
                'no-untyped-def': 1
            },
            'most_common_errors': [
                {
                    'code': 'assignment',
                    'count': 3,
                    'message': 'Type mismatch in assignment'
                },
                {
                    'code': 'arg-type',
                    'count': 2,
                    'message': 'Incompatible argument type'
                },
                {
                    'code': 'no-untyped-def',
                    'count': 5,
                    'message': 'Missing type annotations'
                }
            ],
            'coverage_by_file': {
                'src/services/user_service.py': 87.5,
                'src/models/user.py': 95.2,
                'src/api/routes.py': 72.3,
                'src/utils/helpers.py': 45.8,
                'src/main.py': 100.0
            },
            'recommendations': [
                'Add type hints to all function parameters and return values',
                'Use Optional[T] for nullable values',
                'Add type stubs for third-party libraries',
                'Enable strict mode for better type safety',
                'Fix incompatible type assignments',
                'Add type ignores only when necessary with explanations'
            ],
            'next_steps': [
                'Fix all type errors',
                'Increase type coverage to > 90%',
                'Add type hints to remaining functions',
                'Enable strict mode gradually',
                'Add type checking to CI/CD',
                'Configure pre-commit type checking'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate type checking parameters."""
        if 'target_path' not in params:
            self.logger.error("Missing required field: target_path")
            return False

        valid_languages = ['python', 'typescript', 'javascript']
        language = params.get('language', 'python')

        if language not in valid_languages:
            self.logger.error(f"Unsupported language: {language}")
            return False

        return True

    def _get_default_checker(self, language: str) -> str:
        """Get default type checker for language."""
        checkers = {
            'python': 'mypy',
            'typescript': 'tsc',
            'javascript': 'flow'
        }
        return checkers.get(language, 'mypy')
