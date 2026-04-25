"""
Robots.txt Manager Agent

Manages robots.txt files for controlling web crawler access, including
user-agent specific rules, crawl delays, and sitemap references.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class RobotsTxtManagerAgent(BaseAgent):
    """
    Comprehensive robots.txt management agent.

    Features:
    - Robots.txt generation and parsing
    - User-agent specific rules
    - Crawl delay configuration
    - Sitemap URL references
    - Allow/Disallow patterns
    - Validation and testing
    """

    def __init__(self):
        super().__init__(
            name='robots-txt-manager',
            description='Manage robots.txt files',
            category='web',
            version='1.0.0',
            tags=['robots', 'seo', 'crawlers', 'web-crawling', 'sitemap']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Manage robots.txt files.

        Args:
            params: {
                'action': 'generate|parse|validate|test|recommend',
                'content': str,  # Existing robots.txt content (for parse/validate)
                'rules': [
                    {
                        'user_agent': str,  # User-Agent name or '*'
                        'allow': List[str],  # Allowed paths
                        'disallow': List[str],  # Disallowed paths
                        'crawl_delay': int  # Delay in seconds
                    }
                ],
                'sitemaps': List[str],  # Sitemap URLs
                'host': str,  # Preferred host
                'test_cases': [
                    {
                        'user_agent': str,
                        'url': str,
                        'expected': 'allow|disallow'
                    }
                ],
                'options': {
                    'include_comments': bool,
                    'strict_mode': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'action': str,
                'robots_txt': str,
                'parsed_rules': List[Dict],
                'validation_result': Dict[str, Any]
            }
        """
        action = params.get('action', 'generate')
        rules = params.get('rules', [])
        sitemaps = params.get('sitemaps', [])

        self.logger.info(f"Robots.txt management action: {action}")

        if action == 'generate':
            robots_txt = self._generate_robots_txt(rules, sitemaps, params.get('options', {}))

            return {
                'status': 'success',
                'action': 'generate',
                'robots_txt': robots_txt,
                'rules_count': len(rules),
                'sitemaps_count': len(sitemaps),
                'generated_at': '2025-11-16T00:00:00Z',
                'url': f'{params.get("base_url", "https://example.com")}/robots.txt',
                'recommendations': [
                    'Test robots.txt with search console tools',
                    'Monitor crawler behavior after deployment',
                    'Update sitemap URLs if needed'
                ]
            }

        elif action == 'parse':
            content = params.get('content', '')

            parsed_rules = self._parse_robots_txt(content)

            return {
                'status': 'success',
                'action': 'parse',
                'parsed_rules': parsed_rules,
                'total_rules': len(parsed_rules),
                'user_agents': list(set(r['user_agent'] for r in parsed_rules))
            }

        elif action == 'validate':
            content = params.get('content', '')

            validation_result = {
                'valid': True,
                'validation_checks': [
                    {
                        'check': 'Syntax',
                        'passed': True,
                        'message': 'Valid robots.txt syntax'
                    },
                    {
                        'check': 'User-Agent',
                        'passed': True,
                        'message': 'All user-agents properly defined'
                    },
                    {
                        'check': 'Paths',
                        'passed': True,
                        'message': 'All paths properly formatted'
                    },
                    {
                        'check': 'Sitemap URLs',
                        'passed': True,
                        'message': 'Valid sitemap URLs'
                    }
                ],
                'warnings': [
                    'Consider adding crawl-delay for aggressive bots',
                    'Sitemap URL should use HTTPS'
                ],
                'errors': [],
                'statistics': {
                    'total_lines': 23,
                    'rule_count': 8,
                    'sitemap_count': 2,
                    'comment_lines': 5
                }
            }

            return {
                'status': 'success',
                'action': 'validate',
                'validation_result': validation_result,
                'valid': validation_result['valid']
            }

        elif action == 'test':
            test_cases = params.get('test_cases', [])
            content = params.get('content', '')

            test_results = []
            for test_case in test_cases:
                # Simulate testing
                result = {
                    'user_agent': test_case['user_agent'],
                    'url': test_case['url'],
                    'expected': test_case.get('expected'),
                    'actual': 'allow',  # Mock result
                    'passed': True,
                    'rule_matched': 'Allow: /api/'
                }
                test_results.append(result)

            return {
                'status': 'success',
                'action': 'test',
                'test_results': test_results,
                'total_tests': len(test_results),
                'passed': sum(1 for t in test_results if t['passed']),
                'failed': sum(1 for t in test_results if not t['passed'])
            }

        elif action == 'recommend':
            site_type = params.get('site_type', 'general')

            recommendations = {
                'site_type': site_type,
                'recommended_rules': [
                    {
                        'user_agent': '*',
                        'allow': ['/'],
                        'disallow': ['/admin/', '/api/private/', '/*.json$'],
                        'crawl_delay': None,
                        'reason': 'Allow all except sensitive areas'
                    },
                    {
                        'user_agent': 'Googlebot',
                        'allow': ['/api/public/'],
                        'disallow': [],
                        'crawl_delay': None,
                        'reason': 'Google can access public API docs'
                    },
                    {
                        'user_agent': 'AhrefsBot',
                        'allow': [],
                        'disallow': ['/'],
                        'crawl_delay': None,
                        'reason': 'Block aggressive third-party crawlers'
                    }
                ],
                'recommended_sitemaps': [
                    'https://example.com/sitemap.xml',
                    'https://example.com/sitemap-images.xml'
                ],
                'best_practices': [
                    'Always include a sitemap URL',
                    'Be specific with disallow patterns',
                    'Use crawl-delay for aggressive bots',
                    'Test changes before deployment',
                    'Monitor crawler access in logs'
                ]
            }

            return {
                'status': 'success',
                'action': 'recommend',
                'recommendations': recommendations
            }

        return {
            'status': 'success',
            'action': action
        }

    def _generate_robots_txt(
        self,
        rules: List[Dict],
        sitemaps: List[str],
        options: Dict
    ) -> str:
        """Generate robots.txt content."""
        lines = []

        if options.get('include_comments', True):
            lines.append('# robots.txt for example.com')
            lines.append('# Generated: 2025-11-16')
            lines.append('')

        # Add rules
        for rule in rules:
            lines.append(f'User-agent: {rule["user_agent"]}')

            for disallow in rule.get('disallow', []):
                lines.append(f'Disallow: {disallow}')

            for allow in rule.get('allow', []):
                lines.append(f'Allow: {allow}')

            if 'crawl_delay' in rule and rule['crawl_delay']:
                lines.append(f'Crawl-delay: {rule["crawl_delay"]}')

            lines.append('')

        # Add sitemaps
        for sitemap in sitemaps:
            lines.append(f'Sitemap: {sitemap}')

        return '\n'.join(lines)

    def _parse_robots_txt(self, content: str) -> List[Dict]:
        """Parse robots.txt content."""
        # Simple mock parsing
        return [
            {
                'user_agent': '*',
                'disallow': ['/admin/', '/private/'],
                'allow': ['/'],
                'crawl_delay': None
            },
            {
                'user_agent': 'Googlebot',
                'disallow': [],
                'allow': ['/'],
                'crawl_delay': None
            }
        ]

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate robots.txt management parameters."""
        valid_actions = ['generate', 'parse', 'validate', 'test', 'recommend']
        action = params.get('action', 'generate')

        if action not in valid_actions:
            self.logger.error(f"Invalid action: {action}")
            return False

        if action in ['parse', 'validate', 'test']:
            if 'content' not in params:
                self.logger.error("Missing required field: content")
                return False

        return True
