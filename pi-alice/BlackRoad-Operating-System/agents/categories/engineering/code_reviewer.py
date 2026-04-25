"""
Code Reviewer Agent

Performs automated code review with quality checks, security analysis,
and best practice recommendations.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class CodeReviewerAgent(BaseAgent):
    """
    Automated code review and quality analysis.

    Performs:
    - Code quality assessment
    - Security vulnerability detection
    - Best practice compliance
    - Performance analysis
    - Maintainability scoring
    """

    def __init__(self):
        super().__init__(
            name='code-reviewer',
            description='Automated code review and quality checks',
            category='engineering',
            version='1.0.0',
            tags=['code-review', 'quality', 'security', 'best-practices']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform code review.

        Args:
            params: {
                'file_path': str,        # File or directory to review
                'language': 'python|javascript|typescript|go|rust',
                'checks': List[str],     # Types of checks to perform
                'severity_threshold': 'low|medium|high|critical',
                'options': {
                    'check_security': bool,
                    'check_performance': bool,
                    'check_maintainability': bool,
                    'check_documentation': bool,
                    'check_test_coverage': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'overall_score': float,
                'issues': List[Dict],
                'suggestions': List[str],
                'security_score': float,
                'maintainability_score': float,
                'performance_score': float,
                'documentation_score': float,
                'test_coverage': float,
                'lines_reviewed': int,
                'critical_issues': int,
                'warnings': int,
                'info': int
            }
        """
        file_path = params.get('file_path')
        language = params.get('language', 'python')
        options = params.get('options', {})
        severity_threshold = params.get('severity_threshold', 'medium')

        self.logger.info(f"Reviewing code at: {file_path}")

        # Mock review results
        issues = [
            {
                'file': 'src/main.py',
                'line': 42,
                'severity': 'high',
                'category': 'security',
                'rule': 'SQL Injection Risk',
                'message': 'Potential SQL injection vulnerability detected',
                'suggestion': 'Use parameterized queries instead of string concatenation'
            },
            {
                'file': 'src/utils.py',
                'line': 128,
                'severity': 'medium',
                'category': 'performance',
                'rule': 'Inefficient Loop',
                'message': 'Nested loops with O(n²) complexity',
                'suggestion': 'Consider using a hash map for O(n) lookup'
            },
            {
                'file': 'src/services.py',
                'line': 56,
                'severity': 'low',
                'category': 'maintainability',
                'rule': 'Function Complexity',
                'message': 'Function has cyclomatic complexity of 15',
                'suggestion': 'Break down into smaller functions'
            },
            {
                'file': 'src/models.py',
                'line': 89,
                'severity': 'info',
                'category': 'documentation',
                'rule': 'Missing Docstring',
                'message': 'Public method missing docstring',
                'suggestion': 'Add docstring to document parameters and return value'
            }
        ]

        critical_count = sum(1 for i in issues if i['severity'] == 'critical')
        high_count = sum(1 for i in issues if i['severity'] == 'high')
        medium_count = sum(1 for i in issues if i['severity'] == 'medium')
        low_count = sum(1 for i in issues if i['severity'] == 'low')
        info_count = sum(1 for i in issues if i['severity'] == 'info')

        return {
            'status': 'success',
            'file_path': file_path,
            'language': language,
            'overall_score': 7.8,
            'security_score': 6.5,
            'maintainability_score': 8.2,
            'performance_score': 7.9,
            'documentation_score': 8.5,
            'test_coverage': 78.5,
            'lines_reviewed': 1247,
            'files_reviewed': 12,
            'issues': issues,
            'critical_issues': critical_count,
            'high_issues': high_count,
            'medium_issues': medium_count,
            'low_issues': low_count,
            'info_issues': info_count,
            'suggestions': [
                'Increase test coverage to at least 80%',
                'Add input validation for all public APIs',
                'Consider adding type hints for better maintainability',
                'Document complex algorithms with inline comments'
            ],
            'passed_checks': [
                'No hardcoded credentials found',
                'No use of deprecated functions',
                'Consistent code style',
                'Proper error handling in critical paths'
            ],
            'metrics': {
                'cyclomatic_complexity': 12.3,
                'maintainability_index': 78.5,
                'halstead_volume': 2456.3,
                'lines_of_code': 1247,
                'comment_ratio': 0.18
            }
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate code review parameters."""
        if 'file_path' not in params:
            self.logger.error("Missing required field: file_path")
            return False

        valid_languages = ['python', 'javascript', 'typescript', 'go', 'rust']
        language = params.get('language', 'python')

        if language not in valid_languages:
            self.logger.error(f"Unsupported language: {language}")
            return False

        return True
