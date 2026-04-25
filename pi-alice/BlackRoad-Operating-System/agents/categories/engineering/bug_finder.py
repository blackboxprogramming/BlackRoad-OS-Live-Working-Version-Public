"""
Bug Finder Agent

Detects bugs, code issues, and potential runtime errors through
static analysis and pattern matching.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class BugFinderAgent(BaseAgent):
    """
    Finds bugs and code issues through static analysis.

    Detects:
    - Null pointer exceptions
    - Memory leaks
    - Race conditions
    - Logic errors
    - Type mismatches
    - Resource leaks
    """

    def __init__(self):
        super().__init__(
            name='bug-finder',
            description='Find bugs and code issues through static analysis',
            category='engineering',
            version='1.0.0',
            tags=['bug-detection', 'static-analysis', 'quality', 'debugging']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Find bugs in code.

        Args:
            params: {
                'file_path': str,
                'language': 'python|javascript|typescript|go|rust',
                'analysis_depth': 'quick|standard|deep',
                'bug_categories': List[str],  # Types of bugs to check
                'options': {
                    'check_null_safety': bool,
                    'check_memory_leaks': bool,
                    'check_race_conditions': bool,
                    'check_logic_errors': bool,
                    'check_type_safety': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'bugs_found': List[Dict],
                'total_bugs': int,
                'severity_breakdown': Dict[str, int],
                'bug_categories': Dict[str, int],
                'files_analyzed': int,
                'analysis_depth': str,
                'confidence_scores': Dict
            }
        """
        file_path = params.get('file_path')
        language = params.get('language', 'python')
        analysis_depth = params.get('analysis_depth', 'standard')
        options = params.get('options', {})

        self.logger.info(
            f"Analyzing {file_path} for bugs ({analysis_depth} analysis)"
        )

        # Mock bug detection results
        bugs_found = [
            {
                'id': 'BUG-001',
                'file': 'src/services.py',
                'line': 45,
                'column': 12,
                'severity': 'critical',
                'category': 'null_pointer',
                'title': 'Potential NoneType attribute access',
                'description': 'Variable "user" may be None when accessing .email',
                'code_snippet': 'email = user.email',
                'suggestion': 'Add null check: if user and user.email:',
                'confidence': 0.95
            },
            {
                'id': 'BUG-002',
                'file': 'src/utils.py',
                'line': 78,
                'column': 8,
                'severity': 'high',
                'category': 'resource_leak',
                'title': 'File handle not closed',
                'description': 'File opened but not closed in exception path',
                'code_snippet': 'f = open("data.txt")',
                'suggestion': 'Use context manager: with open("data.txt") as f:',
                'confidence': 0.92
            },
            {
                'id': 'BUG-003',
                'file': 'src/models.py',
                'line': 123,
                'column': 16,
                'severity': 'medium',
                'category': 'logic_error',
                'title': 'Incorrect comparison operator',
                'description': 'Using assignment (=) instead of comparison (==)',
                'code_snippet': 'if status = "active":',
                'suggestion': 'Change to: if status == "active":',
                'confidence': 0.99
            },
            {
                'id': 'BUG-004',
                'file': 'src/async_handler.py',
                'line': 67,
                'column': 20,
                'severity': 'high',
                'category': 'race_condition',
                'title': 'Potential race condition',
                'description': 'Shared state accessed without synchronization',
                'code_snippet': 'self.counter += 1',
                'suggestion': 'Use threading.Lock() or asyncio.Lock()',
                'confidence': 0.78
            },
            {
                'id': 'BUG-005',
                'file': 'src/api.py',
                'line': 201,
                'column': 24,
                'severity': 'medium',
                'category': 'type_error',
                'title': 'Type mismatch',
                'description': 'Expected str but got int',
                'code_snippet': 'return user_id + "suffix"',
                'suggestion': 'Convert to string: return str(user_id) + "suffix"',
                'confidence': 0.88
            }
        ]

        severity_breakdown = {
            'critical': sum(1 for b in bugs_found if b['severity'] == 'critical'),
            'high': sum(1 for b in bugs_found if b['severity'] == 'high'),
            'medium': sum(1 for b in bugs_found if b['severity'] == 'medium'),
            'low': sum(1 for b in bugs_found if b['severity'] == 'low')
        }

        category_breakdown = {}
        for bug in bugs_found:
            cat = bug['category']
            category_breakdown[cat] = category_breakdown.get(cat, 0) + 1

        return {
            'status': 'success',
            'file_path': file_path,
            'language': language,
            'analysis_depth': analysis_depth,
            'bugs_found': bugs_found,
            'total_bugs': len(bugs_found),
            'severity_breakdown': severity_breakdown,
            'bug_categories': category_breakdown,
            'files_analyzed': 8,
            'lines_analyzed': 2456,
            'analysis_time_seconds': 3.4,
            'confidence_scores': {
                'average': 0.90,
                'high_confidence': 4,
                'medium_confidence': 1,
                'low_confidence': 0
            },
            'patterns_checked': [
                'Null pointer dereferences',
                'Resource leaks',
                'Race conditions',
                'Type errors',
                'Logic errors',
                'Array bounds',
                'Division by zero',
                'Infinite loops'
            ],
            'recommendations': [
                'Fix critical bugs immediately',
                'Add null checks before attribute access',
                'Use context managers for resource handling',
                'Add type hints for better type safety',
                'Consider using linters in CI/CD'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate bug finding parameters."""
        if 'file_path' not in params:
            self.logger.error("Missing required field: file_path")
            return False

        valid_depths = ['quick', 'standard', 'deep']
        depth = params.get('analysis_depth', 'standard')

        if depth not in valid_depths:
            self.logger.error(f"Invalid analysis depth: {depth}")
            return False

        return True
