"""
Logging Instrumentation Agent

Adds comprehensive logging and instrumentation to code including
structured logging, log levels, and integration with logging services.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class LoggingInstrumentationAgent(BaseAgent):
    """
    Adds logging and instrumentation to code.

    Features:
    - Structured logging
    - Log levels (DEBUG, INFO, WARN, ERROR)
    - Context enrichment
    - Performance logging
    - Integration with logging services
    - Request/response logging
    """

    def __init__(self):
        super().__init__(
            name='logging-instrumentation',
            description='Add comprehensive logging to code',
            category='engineering',
            version='1.0.0',
            tags=['logging', 'observability', 'monitoring', 'instrumentation']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add logging instrumentation.

        Args:
            params: {
                'source_path': str,
                'language': 'python|javascript|typescript|go|rust',
                'framework': 'fastapi|express|django|gin',
                'log_format': 'json|text|structured',
                'options': {
                    'log_requests': bool,
                    'log_responses': bool,
                    'log_performance': bool,
                    'log_errors': bool,
                    'add_context': bool,
                    'log_service': str  # datadog|newrelic|cloudwatch
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'files_instrumented': List[str],
                'log_points_added': int,
                'middleware_added': List[str],
                'configuration_generated': Dict
            }
        """
        source_path = params.get('source_path')
        language = params.get('language', 'python')
        framework = params.get('framework', 'fastapi')
        log_format = params.get('log_format', 'json')
        options = params.get('options', {})

        self.logger.info(
            f"Adding logging instrumentation to {source_path}"
        )

        # Mock logging instrumentation
        files_instrumented = [
            'src/main.py',
            'src/api/routes.py',
            'src/services/user_service.py',
            'src/services/product_service.py',
            'src/middleware/logging.py',
            'src/utils/logger.py'
        ]

        log_points = [
            {
                'file': 'src/api/routes.py',
                'line': 45,
                'level': 'INFO',
                'message': 'User login attempt',
                'context': ['user_id', 'ip_address']
            },
            {
                'file': 'src/services/user_service.py',
                'line': 78,
                'level': 'ERROR',
                'message': 'Failed to create user',
                'context': ['error', 'user_data']
            },
            {
                'file': 'src/services/product_service.py',
                'line': 123,
                'level': 'DEBUG',
                'message': 'Product query executed',
                'context': ['query', 'execution_time']
            }
        ]

        middleware_added = [
            'Request logging middleware',
            'Response logging middleware',
            'Performance logging middleware',
            'Error logging middleware',
            'Context enrichment middleware'
        ]

        configuration = {
            'log_level': 'INFO',
            'log_format': log_format,
            'output': ['console', 'file', 'service'],
            'log_file': 'logs/app.log',
            'rotation': {
                'max_size': '100MB',
                'max_files': 10,
                'compression': True
            },
            'structured_logging': True,
            'include_timestamp': True,
            'include_level': True,
            'include_logger_name': True,
            'include_context': options.get('add_context', True)
        }

        if options.get('log_service'):
            configuration['service_integration'] = {
                'provider': options['log_service'],
                'api_key': '${LOG_SERVICE_API_KEY}',
                'environment': 'production'
            }

        files_generated = [
            'logging/config.py',
            'logging/formatters.py',
            'logging/handlers.py',
            'logging/middleware.py',
            'logging/context.py'
        ]

        if options.get('log_service'):
            files_generated.append(
                f"logging/{options['log_service']}_integration.py"
            )

        return {
            'status': 'success',
            'source_path': source_path,
            'language': language,
            'framework': framework,
            'log_format': log_format,
            'files_instrumented': files_instrumented,
            'files_generated': files_generated,
            'log_points_added': len(log_points),
            'log_points_by_level': {
                'DEBUG': sum(1 for p in log_points if p['level'] == 'DEBUG'),
                'INFO': sum(1 for p in log_points if p['level'] == 'INFO'),
                'WARN': sum(1 for p in log_points if p['level'] == 'WARN'),
                'ERROR': sum(1 for p in log_points if p['level'] == 'ERROR')
            },
            'middleware_added': middleware_added,
            'configuration': configuration,
            'features': {
                'structured_logging': True,
                'request_logging': options.get('log_requests', True),
                'response_logging': options.get('log_responses', True),
                'performance_logging': options.get('log_performance', True),
                'error_logging': options.get('log_errors', True),
                'context_enrichment': options.get('add_context', True),
                'log_sampling': True,
                'log_filtering': True,
                'sensitive_data_masking': True
            },
            'context_fields': [
                'request_id',
                'user_id',
                'session_id',
                'ip_address',
                'user_agent',
                'endpoint',
                'method',
                'status_code',
                'duration_ms'
            ] if options.get('add_context') else [],
            'log_example': {
                'timestamp': '2025-11-16T00:00:00.000Z',
                'level': 'INFO',
                'logger': 'api.routes',
                'message': 'User login successful',
                'context': {
                    'request_id': 'req_123456',
                    'user_id': 'user_789',
                    'ip_address': '192.168.1.1',
                    'endpoint': '/api/auth/login',
                    'method': 'POST',
                    'duration_ms': 234
                }
            },
            'performance_metrics': {
                'log_overhead': '< 1ms',
                'async_logging': True,
                'buffered_writes': True
            },
            'next_steps': [
                'Configure log levels per environment',
                'Set up log rotation',
                'Configure log service integration',
                'Add custom log formatters',
                'Set up log aggregation',
                'Create log dashboards',
                'Configure alerts on log patterns'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate logging instrumentation parameters."""
        if 'source_path' not in params:
            self.logger.error("Missing required field: source_path")
            return False

        valid_formats = ['json', 'text', 'structured']
        log_format = params.get('log_format', 'json')

        if log_format not in valid_formats:
            self.logger.error(f"Invalid log format: {log_format}")
            return False

        return True
