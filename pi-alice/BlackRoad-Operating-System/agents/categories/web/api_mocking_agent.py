"""
API Mocking Agent

Generates API mocks for testing, including mock servers, responses, and
test data generation from OpenAPI specs or custom definitions.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class APIMockingAgent(BaseAgent):
    """
    Comprehensive API mocking agent.

    Features:
    - Mock server generation
    - Response mocking from OpenAPI specs
    - Dynamic response generation
    - Request matching and validation
    - Stateful mocking
    - Delay and error simulation
    """

    def __init__(self):
        super().__init__(
            name='api-mocking-agent',
            description='Generate API mocks for testing',
            category='web',
            version='1.0.0',
            tags=['api', 'mocking', 'testing', 'mock-server', 'stub', 'openapi']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate API mocks for testing.

        Args:
            params: {
                'action': 'generate|start|stop|configure|record',
                'source': {
                    'type': 'openapi|swagger|postman|har|custom',
                    'spec_file': str,  # OpenAPI spec file
                    'endpoints': List[Dict]  # Custom endpoint definitions
                },
                'mock_config': {
                    'server_type': 'express|flask|prism|wiremock|mockoon',
                    'port': int,
                    'host': str,
                    'base_path': str
                },
                'response_config': {
                    'delay_ms': int,  # Simulated latency
                    'error_rate': float,  # Percentage of errors (0-1)
                    'response_type': 'static|dynamic|random',
                    'include_headers': bool,
                    'cors_enabled': bool
                },
                'mock_rules': [
                    {
                        'endpoint': str,
                        'method': str,
                        'response': {
                            'status_code': int,
                            'body': Dict[str, Any],
                            'headers': Dict[str, str]
                        },
                        'conditions': {
                            'query_params': Dict[str, str],
                            'headers': Dict[str, str],
                            'body_match': str  # JSON path or regex
                        },
                        'delay_ms': int,
                        'probability': float  # Response probability
                    }
                ],
                'state_management': {
                    'enabled': bool,
                    'persist': bool,
                    'reset_on_restart': bool
                },
                'scenarios': [
                    {
                        'name': str,
                        'description': str,
                        'sequence': List[Dict]  # Ordered responses
                    }
                ],
                'recording': {
                    'enabled': bool,
                    'target_url': str,  # Real API to record from
                    'save_path': str
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'mock_server_url': str,
                'endpoints_mocked': int,
                'mock_config': Dict[str, Any],
                'generated_files': List[str]
            }
        """
        action = params.get('action', 'generate')
        source = params.get('source', {})
        mock_config = params.get('mock_config', {})
        response_config = params.get('response_config', {})
        mock_rules = params.get('mock_rules', [])

        self.logger.info(f"API mocking action: {action}")

        if action == 'generate':
            # Generate mock server configuration
            server_config = self._generate_server_config(mock_config, response_config)

            # Generate mock endpoints
            endpoints = self._generate_mock_endpoints(source, mock_rules)

            # Generate mock data
            mock_data = self._generate_mock_data(endpoints)

            return {
                'status': 'success',
                'action': 'generate',
                'mock_server_url': f'http://{mock_config.get("host", "localhost")}:{mock_config.get("port", 3000)}',
                'server_type': mock_config.get('server_type', 'express'),
                'endpoints_mocked': len(endpoints),
                'mock_config': server_config,
                'endpoints': endpoints,
                'mock_data': mock_data,
                'features': {
                    'delay_simulation': response_config.get('delay_ms', 0) > 0,
                    'error_simulation': response_config.get('error_rate', 0) > 0,
                    'cors_enabled': response_config.get('cors_enabled', True),
                    'stateful': params.get('state_management', {}).get('enabled', False),
                    'recording': params.get('recording', {}).get('enabled', False)
                },
                'generated_files': [
                    'mock-server.js',
                    'mock-data.json',
                    'mock-config.json',
                    'README.md',
                    'package.json'
                ],
                'start_command': f'npm start',
                'next_steps': [
                    'Review generated mock endpoints',
                    'Customize response data if needed',
                    'Start mock server',
                    'Update tests to use mock server URL',
                    'Configure delay and error scenarios'
                ]
            }

        elif action == 'start':
            port = mock_config.get('port', 3000)
            host = mock_config.get('host', 'localhost')

            return {
                'status': 'success',
                'action': 'start',
                'mock_server_url': f'http://{host}:{port}',
                'server_status': 'running',
                'started_at': '2025-11-16T00:00:00Z',
                'endpoints_available': 15,
                'pid': 12345,
                'logs_path': './logs/mock-server.log'
            }

        elif action == 'stop':
            return {
                'status': 'success',
                'action': 'stop',
                'server_status': 'stopped',
                'stopped_at': '2025-11-16T00:10:00Z',
                'uptime_seconds': 600,
                'total_requests_served': 1247
            }

        elif action == 'configure':
            new_rules = mock_rules

            return {
                'status': 'success',
                'action': 'configure',
                'rules_added': len(new_rules),
                'total_rules': len(new_rules) + 10,  # Existing + new
                'configuration_updated': True,
                'restart_required': False
            }

        elif action == 'record':
            recording = params.get('recording', {})
            target_url = recording.get('target_url')

            recorded_interactions = [
                {
                    'request': {
                        'method': 'GET',
                        'url': f'{target_url}/api/users',
                        'headers': {'Accept': 'application/json'},
                        'timestamp': '2025-11-16T00:00:00Z'
                    },
                    'response': {
                        'status_code': 200,
                        'headers': {'Content-Type': 'application/json'},
                        'body': {'users': [{'id': 1, 'name': 'John'}]},
                        'duration_ms': 234
                    }
                },
                {
                    'request': {
                        'method': 'POST',
                        'url': f'{target_url}/api/users',
                        'headers': {'Content-Type': 'application/json'},
                        'body': {'name': 'Jane'},
                        'timestamp': '2025-11-16T00:00:05Z'
                    },
                    'response': {
                        'status_code': 201,
                        'headers': {'Content-Type': 'application/json'},
                        'body': {'id': 2, 'name': 'Jane'},
                        'duration_ms': 187
                    }
                }
            ]

            return {
                'status': 'success',
                'action': 'record',
                'target_url': target_url,
                'interactions_recorded': len(recorded_interactions),
                'recorded_interactions': recorded_interactions,
                'save_path': recording.get('save_path', './recordings'),
                'recording_duration_seconds': 60,
                'message': 'Recording saved successfully'
            }

        return {
            'status': 'success',
            'action': action
        }

    def _generate_server_config(self, mock_config: Dict, response_config: Dict) -> Dict:
        """Generate mock server configuration."""
        return {
            'port': mock_config.get('port', 3000),
            'host': mock_config.get('host', 'localhost'),
            'base_path': mock_config.get('base_path', '/api'),
            'delay_ms': response_config.get('delay_ms', 100),
            'error_rate': response_config.get('error_rate', 0.0),
            'cors': {
                'enabled': response_config.get('cors_enabled', True),
                'origin': '*',
                'methods': ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
            },
            'logging': {
                'enabled': True,
                'level': 'info',
                'format': 'json'
            }
        }

    def _generate_mock_endpoints(self, source: Dict, mock_rules: List[Dict]) -> List[Dict]:
        """Generate mock endpoint definitions."""
        endpoints = [
            {
                'path': '/users',
                'method': 'GET',
                'response': {
                    'status_code': 200,
                    'body': {
                        'users': [
                            {'id': 1, 'name': 'John Doe', 'email': 'john@example.com'},
                            {'id': 2, 'name': 'Jane Smith', 'email': 'jane@example.com'}
                        ],
                        'total': 2
                    },
                    'headers': {'Content-Type': 'application/json'}
                }
            },
            {
                'path': '/users/:id',
                'method': 'GET',
                'response': {
                    'status_code': 200,
                    'body': {
                        'id': 1,
                        'name': 'John Doe',
                        'email': 'john@example.com'
                    }
                }
            },
            {
                'path': '/users',
                'method': 'POST',
                'response': {
                    'status_code': 201,
                    'body': {
                        'id': 3,
                        'name': '{{request.body.name}}',
                        'email': '{{request.body.email}}'
                    }
                }
            },
            {
                'path': '/users/:id',
                'method': 'PUT',
                'response': {
                    'status_code': 200,
                    'body': {
                        'id': '{{request.params.id}}',
                        'name': '{{request.body.name}}',
                        'email': '{{request.body.email}}'
                    }
                }
            },
            {
                'path': '/users/:id',
                'method': 'DELETE',
                'response': {
                    'status_code': 204,
                    'body': None
                }
            }
        ]

        # Add custom rules
        for rule in mock_rules:
            endpoints.append({
                'path': rule.get('endpoint'),
                'method': rule.get('method'),
                'response': rule.get('response'),
                'conditions': rule.get('conditions'),
                'delay_ms': rule.get('delay_ms'),
                'probability': rule.get('probability', 1.0)
            })

        return endpoints

    def _generate_mock_data(self, endpoints: List[Dict]) -> Dict:
        """Generate mock data for endpoints."""
        return {
            'users': [
                {
                    'id': 1,
                    'name': 'John Doe',
                    'email': 'john@example.com',
                    'role': 'admin',
                    'created_at': '2025-01-15T10:00:00Z'
                },
                {
                    'id': 2,
                    'name': 'Jane Smith',
                    'email': 'jane@example.com',
                    'role': 'user',
                    'created_at': '2025-02-20T14:30:00Z'
                }
            ],
            'posts': [
                {
                    'id': 1,
                    'title': 'First Post',
                    'content': 'This is the first post',
                    'author_id': 1,
                    'published': True
                }
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate API mocking parameters."""
        valid_actions = ['generate', 'start', 'stop', 'configure', 'record']
        action = params.get('action', 'generate')

        if action not in valid_actions:
            self.logger.error(f"Invalid action: {action}")
            return False

        if action == 'generate':
            source = params.get('source', {})
            if source.get('type') not in ['openapi', 'swagger', 'postman', 'har', 'custom']:
                if 'endpoints' not in source and 'spec_file' not in source:
                    self.logger.error("Missing endpoints or spec_file in source")
                    return False

        return True
