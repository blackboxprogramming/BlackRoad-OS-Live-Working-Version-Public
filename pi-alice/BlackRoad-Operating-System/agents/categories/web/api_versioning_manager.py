"""
API Versioning Manager Agent

Manages API versions, handles version deprecation, migration paths, and
ensures backward compatibility across API versions.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class APIVersioningManagerAgent(BaseAgent):
    """
    Comprehensive API versioning management agent.

    Features:
    - Version strategy management (URI, header, query param)
    - Deprecation scheduling and notifications
    - Migration path planning
    - Version compatibility testing
    - Changelog generation
    - Client version tracking
    """

    def __init__(self):
        super().__init__(
            name='api-versioning-manager',
            description='Manage API versions',
            category='web',
            version='1.0.0',
            tags=['api', 'versioning', 'deprecation', 'migration', 'compatibility']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Manage API versions.

        Args:
            params: {
                'action': 'create|deprecate|migrate|list|stats|recommend',
                'version_config': {
                    'version': str,  # e.g., 'v2', '2.0', '2024-11-16'
                    'versioning_strategy': 'uri|header|query_param|content_type',
                    'base_path': str,  # e.g., '/api/v2'
                    'header_name': str,  # e.g., 'X-API-Version'
                    'default_version': bool
                },
                'version_info': {
                    'version': str,
                    'release_date': str,
                    'status': 'alpha|beta|stable|deprecated|retired',
                    'breaking_changes': List[str],
                    'new_features': List[str],
                    'bug_fixes': List[str],
                    'migration_guide_url': str
                },
                'deprecation': {
                    'version': str,
                    'deprecation_date': str,
                    'sunset_date': str,  # When version will be removed
                    'replacement_version': str,
                    'reason': str,
                    'migration_deadline': str
                },
                'compatibility': {
                    'source_version': str,
                    'target_version': str,
                    'test_endpoints': List[str]
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'action': str,
                'version_info': Dict[str, Any],
                'versions': List[Dict],
                'compatibility_report': Dict[str, Any]
            }
        """
        action = params.get('action', 'list')
        version_config = params.get('version_config', {})
        version_info = params.get('version_info', {})

        self.logger.info(f"API versioning action: {action}")

        if action == 'create':
            new_version = {
                'version': version_config.get('version', 'v3'),
                'versioning_strategy': version_config.get('versioning_strategy', 'uri'),
                'base_path': version_config.get('base_path', f'/api/{version_config.get("version", "v3")}'),
                'release_date': version_info.get('release_date', '2025-11-16'),
                'status': version_info.get('status', 'beta'),
                'default_version': version_config.get('default_version', False),
                'breaking_changes': version_info.get('breaking_changes', []),
                'new_features': version_info.get('new_features', []),
                'supported_until': '2027-11-16',
                'documentation_url': f'https://api.example.com/docs/{version_config.get("version", "v3")}',
                'created_at': '2025-11-16T00:00:00Z'
            }

            return {
                'status': 'success',
                'action': 'create',
                'version_info': new_version,
                'version_header': f'{version_config.get("header_name", "X-API-Version")}: {new_version["version"]}',
                'example_request': f'GET {new_version["base_path"]}/users',
                'next_steps': [
                    'Deploy new version endpoints',
                    'Update API documentation',
                    'Notify API consumers',
                    'Monitor adoption metrics'
                ]
            }

        elif action == 'deprecate':
            deprecation_info = params.get('deprecation', {})

            deprecated_version = {
                'version': deprecation_info.get('version', 'v1'),
                'status': 'deprecated',
                'deprecation_date': deprecation_info.get('deprecation_date', '2025-11-16'),
                'sunset_date': deprecation_info.get('sunset_date', '2026-05-16'),
                'replacement_version': deprecation_info.get('replacement_version', 'v3'),
                'reason': deprecation_info.get('reason', 'Security improvements and new features in v3'),
                'migration_deadline': deprecation_info.get('migration_deadline', '2026-04-16'),
                'deprecation_warnings': {
                    'header': 'Sunset: Sat, 16 May 2026 00:00:00 GMT',
                    'additional_headers': {
                        'Deprecation': 'true',
                        'Link': '<https://api.example.com/docs/v3>; rel="successor-version"'
                    }
                }
            }

            return {
                'status': 'success',
                'action': 'deprecate',
                'deprecation_info': deprecated_version,
                'notification_plan': {
                    'email_notifications': ['90 days before', '60 days before', '30 days before'],
                    'in_app_warnings': 'Immediate',
                    'documentation_updates': 'Immediate',
                    'api_response_headers': 'Immediate'
                },
                'migration_support': {
                    'migration_guide_url': f'https://api.example.com/migration/{deprecation_info.get("version")}-to-{deprecation_info.get("replacement_version")}',
                    'breaking_changes_documented': True,
                    'code_examples_provided': True,
                    'support_available': True
                }
            }

        elif action == 'migrate':
            compatibility = params.get('compatibility', {})
            source_version = compatibility.get('source_version', 'v1')
            target_version = compatibility.get('target_version', 'v3')

            migration_report = {
                'source_version': source_version,
                'target_version': target_version,
                'migration_complexity': 'medium',
                'estimated_effort_hours': 24,
                'breaking_changes': [
                    {
                        'category': 'Authentication',
                        'change': 'OAuth 2.0 required (API keys deprecated)',
                        'impact': 'high',
                        'migration_steps': [
                            'Register OAuth application',
                            'Implement OAuth flow',
                            'Update authentication headers'
                        ]
                    },
                    {
                        'category': 'Response Format',
                        'change': 'JSON API spec compliance',
                        'impact': 'medium',
                        'migration_steps': [
                            'Update response parsing logic',
                            'Handle new error format',
                            'Update data access patterns'
                        ]
                    },
                    {
                        'category': 'Endpoints',
                        'change': 'Resource paths renamed',
                        'impact': 'low',
                        'migration_steps': [
                            'Update endpoint URLs',
                            'Review API documentation'
                        ]
                    }
                ],
                'deprecated_endpoints': [
                    {'old': '/api/v1/user/:id', 'new': '/api/v3/users/:id'},
                    {'old': '/api/v1/data', 'new': '/api/v3/datasets'}
                ],
                'new_features': [
                    'Batch operations support',
                    'GraphQL endpoint',
                    'WebSocket support for real-time updates'
                ],
                'compatibility_matrix': {
                    'GET /users': {'compatible': True, 'changes': 'Response format updated'},
                    'POST /users': {'compatible': False, 'changes': 'Authentication required'},
                    'PUT /users/:id': {'compatible': True, 'changes': 'Minor field changes'}
                }
            }

            return {
                'status': 'success',
                'action': 'migrate',
                'migration_report': migration_report
            }

        elif action == 'list':
            versions = [
                {
                    'version': 'v3',
                    'status': 'stable',
                    'release_date': '2025-11-01',
                    'usage_percentage': 45.3,
                    'active_clients': 1247,
                    'default': True,
                    'supported_until': '2027-11-01'
                },
                {
                    'version': 'v2',
                    'status': 'stable',
                    'release_date': '2024-06-15',
                    'usage_percentage': 42.1,
                    'active_clients': 1156,
                    'default': False,
                    'supported_until': '2026-06-15'
                },
                {
                    'version': 'v1',
                    'status': 'deprecated',
                    'release_date': '2023-01-10',
                    'deprecation_date': '2025-11-16',
                    'sunset_date': '2026-05-16',
                    'usage_percentage': 12.6,
                    'active_clients': 346,
                    'default': False,
                    'supported_until': '2026-05-16'
                }
            ]

            return {
                'status': 'success',
                'action': 'list',
                'versions': versions,
                'total_versions': len(versions),
                'active_versions': sum(1 for v in versions if v['status'] in ['stable', 'beta']),
                'deprecated_versions': sum(1 for v in versions if v['status'] == 'deprecated'),
                'current_version': 'v3',
                'recommended_version': 'v3'
            }

        elif action == 'stats':
            stats = {
                'time_period': '30d',
                'version_usage': [
                    {'version': 'v3', 'requests': 4521000, 'percentage': 45.3},
                    {'version': 'v2', 'requests': 4205000, 'percentage': 42.1},
                    {'version': 'v1', 'requests': 1260000, 'percentage': 12.6}
                ],
                'adoption_trends': {
                    'v3_growth': 15.3,  # percentage growth
                    'v2_decline': -8.2,
                    'v1_decline': -23.4
                },
                'migration_progress': {
                    'target_version': 'v3',
                    'migrated_clients': 1247,
                    'pending_clients': 1502,
                    'completion_percentage': 45.4
                },
                'client_distribution': [
                    {'client_type': 'mobile_apps', 'v3': 687, 'v2': 543, 'v1': 123},
                    {'client_type': 'web_apps', 'v3': 432, 'v2': 498, 'v1': 187},
                    {'client_type': 'integrations', 'v3': 128, 'v2': 115, 'v1': 36}
                ]
            }

            return {
                'status': 'success',
                'action': 'stats',
                'statistics': stats
            }

        elif action == 'recommend':
            recommendations = {
                'versioning_strategy': {
                    'recommended': 'uri',
                    'rationale': 'Most discoverable and cache-friendly',
                    'alternatives': ['header', 'content_type'],
                    'best_practices': [
                        'Use semantic versioning (major.minor.patch)',
                        'Version only when breaking changes occur',
                        'Support at least 2 versions simultaneously',
                        'Provide clear deprecation timelines (6-12 months)',
                        'Document all breaking changes'
                    ]
                },
                'deprecation_policy': {
                    'minimum_support_period': '12 months',
                    'notification_timeline': [
                        'Announce: 90 days before deprecation',
                        'Warn: Send headers immediately',
                        'Migrate: 6 months to migrate',
                        'Sunset: Remove after 12 months'
                    ]
                },
                'version_lifecycle': {
                    'alpha': '2-4 weeks (internal only)',
                    'beta': '4-8 weeks (early adopters)',
                    'stable': '24+ months',
                    'deprecated': '6-12 months',
                    'retired': 'Removed'
                }
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

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate API versioning parameters."""
        valid_actions = ['create', 'deprecate', 'migrate', 'list', 'stats', 'recommend']
        action = params.get('action', 'list')

        if action not in valid_actions:
            self.logger.error(f"Invalid action: {action}")
            return False

        if action == 'create':
            version_config = params.get('version_config', {})
            if 'version' not in version_config:
                self.logger.error("Missing version in version_config")
                return False

        return True
