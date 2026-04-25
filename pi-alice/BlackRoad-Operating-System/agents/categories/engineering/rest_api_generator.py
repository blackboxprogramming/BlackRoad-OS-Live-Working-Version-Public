"""
REST API Generator Agent

Generates RESTful API boilerplate including routes, controllers,
models, and OpenAPI/Swagger documentation.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class RESTAPIGeneratorAgent(BaseAgent):
    """
    Generates REST API boilerplate code.

    Features:
    - Route generation
    - Controller generation
    - Request/Response models
    - OpenAPI/Swagger docs
    - Validation middleware
    - Authentication setup
    """

    def __init__(self):
        super().__init__(
            name='rest-api-generator',
            description='Generate RESTful API boilerplate code',
            category='engineering',
            version='1.0.0',
            tags=['rest-api', 'api', 'backend', 'code-generation']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate REST API.

        Args:
            params: {
                'language': 'python|javascript|typescript|go|rust',
                'framework': 'fastapi|express|gin|actix|django-rest',
                'resources': List[str],  # Resources to create (e.g., ['users', 'products'])
                'options': {
                    'add_crud': bool,
                    'add_auth': bool,
                    'add_validation': bool,
                    'add_pagination': bool,
                    'generate_openapi': bool,
                    'add_rate_limiting': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'routes_generated': List[Dict],
                'controllers_generated': List[str],
                'models_generated': List[str],
                'openapi_spec': Dict
            }
        """
        language = params.get('language', 'python')
        framework = params.get('framework', 'fastapi')
        resources = params.get('resources', [])
        options = params.get('options', {})

        self.logger.info(
            f"Generating REST API with {framework} for resources: {resources}"
        )

        # Mock REST API generation
        routes = []
        for resource in resources or ['users', 'products']:
            routes.extend([
                {
                    'method': 'GET',
                    'path': f'/api/v1/{resource}',
                    'handler': f'list_{resource}',
                    'description': f'List all {resource}',
                    'auth_required': True,
                    'rate_limit': '100/hour'
                },
                {
                    'method': 'GET',
                    'path': f'/api/v1/{resource}/{{id}}',
                    'handler': f'get_{resource[:-1]}',
                    'description': f'Get {resource[:-1]} by ID',
                    'auth_required': True,
                    'rate_limit': '100/hour'
                },
                {
                    'method': 'POST',
                    'path': f'/api/v1/{resource}',
                    'handler': f'create_{resource[:-1]}',
                    'description': f'Create new {resource[:-1]}',
                    'auth_required': True,
                    'rate_limit': '20/hour'
                },
                {
                    'method': 'PUT',
                    'path': f'/api/v1/{resource}/{{id}}',
                    'handler': f'update_{resource[:-1]}',
                    'description': f'Update {resource[:-1]}',
                    'auth_required': True,
                    'rate_limit': '20/hour'
                },
                {
                    'method': 'DELETE',
                    'path': f'/api/v1/{resource}/{{id}}',
                    'handler': f'delete_{resource[:-1]}',
                    'description': f'Delete {resource[:-1]}',
                    'auth_required': True,
                    'rate_limit': '10/hour'
                }
            ])

        controllers = [
            f'controllers/{resource}_controller.py'
            for resource in (resources or ['users', 'products'])
        ]

        models = [
            f'models/{resource[:-1]}.py'
            for resource in (resources or ['users', 'products'])
        ]

        files_generated = [
            'app.py',
            'config.py',
            'middleware/auth.py',
            'middleware/validation.py',
            'middleware/rate_limit.py',
            'middleware/error_handler.py',
            'utils/response.py',
            'utils/pagination.py',
            'schemas/user.py',
            'schemas/product.py'
        ] + controllers + models

        openapi_spec = {
            'openapi': '3.0.0',
            'info': {
                'title': 'Generated API',
                'version': '1.0.0',
                'description': 'Auto-generated REST API'
            },
            'servers': [
                {'url': 'http://localhost:8000', 'description': 'Development'}
            ],
            'paths': {
                '/api/v1/users': {
                    'get': {
                        'summary': 'List all users',
                        'parameters': [
                            {'name': 'limit', 'in': 'query', 'schema': {'type': 'integer'}},
                            {'name': 'offset', 'in': 'query', 'schema': {'type': 'integer'}}
                        ],
                        'responses': {
                            '200': {'description': 'Success'}
                        }
                    }
                }
            }
        }

        return {
            'status': 'success',
            'language': language,
            'framework': framework,
            'resources': resources or ['users', 'products'],
            'routes_generated': routes,
            'total_routes': len(routes),
            'controllers_generated': controllers,
            'models_generated': models,
            'files_generated': files_generated,
            'openapi_spec': openapi_spec if options.get('generate_openapi') else None,
            'features': {
                'crud_operations': options.get('add_crud', True),
                'authentication': options.get('add_auth', True),
                'validation': options.get('add_validation', True),
                'pagination': options.get('add_pagination', True),
                'rate_limiting': options.get('add_rate_limiting', True),
                'cors': True,
                'error_handling': True,
                'logging': True,
                'health_check': True
            },
            'endpoints_by_method': {
                'GET': sum(1 for r in routes if r['method'] == 'GET'),
                'POST': sum(1 for r in routes if r['method'] == 'POST'),
                'PUT': sum(1 for r in routes if r['method'] == 'PUT'),
                'DELETE': sum(1 for r in routes if r['method'] == 'DELETE')
            },
            'middleware': [
                'Authentication',
                'Request validation',
                'Rate limiting',
                'Error handling',
                'CORS',
                'Request logging'
            ],
            'next_steps': [
                'Implement business logic in controllers',
                'Connect to database',
                'Configure authentication',
                'Add custom validation rules',
                'Set up API documentation',
                'Write integration tests'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate REST API generation parameters."""
        valid_languages = ['python', 'javascript', 'typescript', 'go', 'rust']
        language = params.get('language', 'python')

        if language not in valid_languages:
            self.logger.error(f"Unsupported language: {language}")
            return False

        valid_frameworks = [
            'fastapi', 'express', 'gin', 'actix', 'django-rest'
        ]
        framework = params.get('framework', 'fastapi')

        if framework not in valid_frameworks:
            self.logger.error(f"Unsupported framework: {framework}")
            return False

        return True
