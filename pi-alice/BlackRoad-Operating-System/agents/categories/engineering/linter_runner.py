"""
Linter Runner Agent

Runs linters and enforces code quality standards for multiple
programming languages.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class LinterRunnerAgent(BaseAgent):
    """
    Runs linters and enforces code quality.

    Supports:
    - pylint, flake8, mypy (Python)
    - ESLint (JavaScript/TypeScript)
    - golint (Go)
    - clippy (Rust)
    - Custom lint rules
    """

    def __init__(self):
        super().__init__(
            name='linter-runner',
            description='Run linters and enforce code quality standards',
            category='engineering',
            version='1.0.0',
            tags=['linting', 'code-quality', 'static-analysis', 'standards']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run linters.

        Args:
            params: {
                'target_path': str,
                'language': 'python|javascript|typescript|go|rust',
                'linters': List[str],    # Specific linters to run
                'options': {
                    'fix_automatically': bool,
                    'severity_threshold': 'error|warning|info',
                    'ignore_rules': List[str],
                    'config_file': str
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'linting_results': Dict,
                'issues_found': List[Dict],
                'fixes_applied': int,
                'quality_score': float
            }
        """
        target_path = params.get('target_path')
        language = params.get('language', 'python')
        linters = params.get('linters', self._get_default_linters(language))
        options = params.get('options', {})

        self.logger.info(
            f"Running linters on {target_path}: {', '.join(linters)}"
        )

        # Mock linting results
        issues = [
            {
                'file': 'src/api/routes.py',
                'line': 45,
                'column': 12,
                'rule': 'E501',
                'linter': 'flake8',
                'severity': 'warning',
                'message': 'Line too long (95 > 88 characters)',
                'fixable': True
            },
            {
                'file': 'src/services/user_service.py',
                'line': 67,
                'column': 8,
                'rule': 'C0103',
                'linter': 'pylint',
                'severity': 'warning',
                'message': 'Variable name "x" doesn\'t conform to snake_case naming style',
                'fixable': False
            },
            {
                'file': 'src/models/user.py',
                'line': 23,
                'column': 5,
                'rule': 'W0612',
                'linter': 'pylint',
                'severity': 'warning',
                'message': 'Unused variable \'temp_data\'',
                'fixable': True
            },
            {
                'file': 'src/utils/helpers.py',
                'line': 12,
                'column': 1,
                'rule': 'F401',
                'linter': 'flake8',
                'severity': 'error',
                'message': '\'datetime\' imported but unused',
                'fixable': True
            },
            {
                'file': 'src/main.py',
                'line': 89,
                'column': 15,
                'rule': 'no-explicit-any',
                'linter': 'eslint',
                'severity': 'error',
                'message': 'Unexpected any. Specify a different type',
                'fixable': False
            }
        ]

        linting_results = {}
        for linter in linters:
            linter_issues = [i for i in issues if i['linter'] == linter]
            linting_results[linter] = {
                'issues': len(linter_issues),
                'errors': sum(1 for i in linter_issues if i['severity'] == 'error'),
                'warnings': sum(1 for i in linter_issues if i['severity'] == 'warning'),
                'info': sum(1 for i in linter_issues if i['severity'] == 'info'),
                'passed': len(linter_issues) == 0
            }

        fixes_applied = 0
        if options.get('fix_automatically'):
            fixable_issues = [i for i in issues if i.get('fixable')]
            fixes_applied = len(fixable_issues)

        severity_counts = {
            'error': sum(1 for i in issues if i['severity'] == 'error'),
            'warning': sum(1 for i in issues if i['severity'] == 'warning'),
            'info': sum(1 for i in issues if i['severity'] == 'info')
        }

        return {
            'status': 'success',
            'target_path': target_path,
            'language': language,
            'linters_run': linters,
            'linting_results': linting_results,
            'issues_found': issues,
            'total_issues': len(issues),
            'severity_counts': severity_counts,
            'fixes_applied': fixes_applied,
            'fixable_issues': sum(1 for i in issues if i.get('fixable')),
            'files_checked': 12,
            'lines_checked': 3456,
            'quality_score': 8.2,  # Out of 10
            'passed_linting': severity_counts['error'] == 0,
            'rules_violated': list(set(i['rule'] for i in issues)),
            'most_common_issues': [
                {'rule': 'E501', 'count': 5, 'message': 'Line too long'},
                {'rule': 'C0103', 'count': 3, 'message': 'Naming convention'},
                {'rule': 'F401', 'count': 2, 'message': 'Unused import'}
            ],
            'recommendations': [
                'Configure line length in editor to match linter settings',
                'Use auto-formatter to fix line length issues',
                'Remove unused imports',
                'Follow naming conventions consistently',
                'Add type hints where missing',
                'Enable linter in IDE for real-time feedback'
            ],
            'next_steps': [
                'Fix all error-level issues',
                'Review and fix warnings',
                'Add linter to pre-commit hooks',
                'Configure linter in CI/CD',
                'Update project style guide',
                'Run linter before commits'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate linter parameters."""
        if 'target_path' not in params:
            self.logger.error("Missing required field: target_path")
            return False

        valid_languages = ['python', 'javascript', 'typescript', 'go', 'rust']
        language = params.get('language', 'python')

        if language not in valid_languages:
            self.logger.error(f"Unsupported language: {language}")
            return False

        return True

    def _get_default_linters(self, language: str) -> List[str]:
        """Get default linters for language."""
        linters = {
            'python': ['pylint', 'flake8', 'mypy'],
            'javascript': ['eslint'],
            'typescript': ['eslint', 'tslint'],
            'go': ['golint', 'go vet'],
            'rust': ['clippy']
        }
        return linters.get(language, ['pylint'])
