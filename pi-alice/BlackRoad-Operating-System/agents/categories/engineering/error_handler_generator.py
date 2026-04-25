"""
Error Handler Generator Agent

Generates comprehensive error handling code including custom exceptions,
error middleware, and error response formatting.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class ErrorHandlerGeneratorAgent(BaseAgent):
    """
    Generates error handling infrastructure.

    Features:
    - Custom exception classes
    - Error middleware
    - Error response formatting
    - Error logging
    - Error tracking integration
    - HTTP error handlers
    """

    def __init__(self):
        super().__init__(
            name='error-handler-generator',
            description='Generate comprehensive error handling code',
            category='engineering',
            version='1.0.0',
            tags=['error-handling', 'exceptions', 'middleware', 'logging']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate error handling code.

        Args:
            params: {
                'language': 'python|javascript|typescript|go|rust',
                'framework': 'fastapi|express|django|gin|actix',
                'error_types': List[str],    # Types of errors to handle
                'options': {
                    'custom_exceptions': bool,
                    'error_middleware': bool,
                    'error_logging': bool,
                    'error_tracking': str,   # sentry|rollbar|bugsnag
                    'user_friendly_messages': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'exceptions_generated': List[Dict],
                'handlers_generated': List[str],
                'middleware_generated': List[str],
                'files_generated': List[str]
            }
        """
        language = params.get('language', 'python')
        framework = params.get('framework', 'fastapi')
        error_types = params.get('error_types', [])
        options = params.get('options', {})

        self.logger.info(
            f"Generating error handlers for {framework}"
        )

        # Mock error handler generation
        error_type_list = error_types or [
            'validation', 'authentication', 'authorization',
            'not_found', 'conflict', 'rate_limit'
        ]

        exceptions_generated = []
        for error_type in error_type_list:
            exceptions_generated.append({
                'name': f'{error_type.capitalize()}Error',
                'base_class': 'AppException',
                'status_code': self._get_status_code(error_type),
                'default_message': f'{error_type.replace("_", " ").capitalize()} error occurred',
                'fields': ['message', 'code', 'details']
            })

        handlers = [
            'handle_validation_error',
            'handle_authentication_error',
            'handle_authorization_error',
            'handle_not_found_error',
            'handle_internal_error',
            'handle_database_error',
            'handle_rate_limit_error',
            'handle_generic_error'
        ]

        middleware = [
            'error_handler_middleware.py',
            'exception_formatter.py',
            'error_logger.py'
        ]

        if options.get('error_tracking'):
            middleware.append(f'{options["error_tracking"]}_integration.py')

        files_generated = [
            'errors/__init__.py',
            'errors/exceptions.py',
            'errors/handlers.py',
            'errors/middleware.py',
            'errors/formatters.py',
            'errors/codes.py'
        ]

        if options.get('error_logging'):
            files_generated.append('errors/logging.py')

        if options.get('error_tracking'):
            files_generated.append(f'errors/{options["error_tracking"]}.py')

        error_codes = {
            'VALIDATION_ERROR': 'ERR_001',
            'AUTHENTICATION_ERROR': 'ERR_002',
            'AUTHORIZATION_ERROR': 'ERR_003',
            'NOT_FOUND': 'ERR_004',
            'CONFLICT': 'ERR_005',
            'RATE_LIMIT': 'ERR_006',
            'INTERNAL_ERROR': 'ERR_500'
        }

        return {
            'status': 'success',
            'language': language,
            'framework': framework,
            'exceptions_generated': exceptions_generated,
            'total_exceptions': len(exceptions_generated),
            'handlers_generated': handlers,
            'middleware_generated': middleware,
            'files_generated': files_generated,
            'error_codes': error_codes,
            'features': {
                'custom_exceptions': options.get('custom_exceptions', True),
                'error_middleware': options.get('error_middleware', True),
                'error_logging': options.get('error_logging', True),
                'error_tracking': options.get('error_tracking'),
                'user_friendly_messages': options.get('user_friendly_messages', True),
                'stack_traces': True,
                'error_context': True,
                'error_aggregation': True
            },
            'error_response_format': {
                'success': False,
                'error': {
                    'code': 'ERR_001',
                    'message': 'Validation failed',
                    'details': [
                        {'field': 'email', 'message': 'Invalid email format'}
                    ],
                    'timestamp': '2025-11-16T00:00:00Z',
                    'request_id': 'req_123456'
                }
            },
            'http_status_codes': {
                'ValidationError': 400,
                'AuthenticationError': 401,
                'AuthorizationError': 403,
                'NotFoundError': 404,
                'ConflictError': 409,
                'RateLimitError': 429,
                'InternalError': 500
            },
            'logging_configuration': {
                'level': 'ERROR',
                'format': 'json',
                'include_stack_trace': True,
                'include_request_context': True,
                'log_to_file': True,
                'log_to_console': True
            },
            'next_steps': [
                'Configure error tracking service',
                'Customize error messages',
                'Add error recovery strategies',
                'Test error scenarios',
                'Add error documentation',
                'Configure alerting',
                'Add error metrics'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate error handler generation parameters."""
        valid_languages = ['python', 'javascript', 'typescript', 'go', 'rust']
        language = params.get('language', 'python')

        if language not in valid_languages:
            self.logger.error(f"Unsupported language: {language}")
            return False

        return True

    def _get_status_code(self, error_type: str) -> int:
        """Get HTTP status code for error type."""
        status_codes = {
            'validation': 400,
            'authentication': 401,
            'authorization': 403,
            'not_found': 404,
            'conflict': 409,
            'rate_limit': 429,
            'internal': 500
        }
        return status_codes.get(error_type, 500)
