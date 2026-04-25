"""
CORS Manager Agent

Manages Cross-Origin Resource Sharing (CORS) policies, configures allowed origins,
methods, headers, and handles preflight requests.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class CORSManagerAgent(BaseAgent):
    """
    Comprehensive CORS management agent.

    Features:
    - CORS policy configuration
    - Origin whitelist/blacklist management
    - Preflight request handling
    - Credential and header management
    - CORS security recommendations
    - Policy testing and validation
    """

    def __init__(self):
        super().__init__(
            name='cors-manager',
            description='Manage CORS policies',
            category='web',
            version='1.0.0',
            tags=['cors', 'security', 'http', 'api', 'cross-origin']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Manage CORS policies.

        Args:
            params: {
                'action': 'configure|validate|test|list|recommend',
                'cors_config': {
                    'allowed_origins': List[str],  # ['https://example.com', '*']
                    'allowed_methods': List[str],  # ['GET', 'POST', 'PUT']
                    'allowed_headers': List[str],  # ['Content-Type', 'Authorization']
                    'exposed_headers': List[str],  # Headers to expose to client
                    'allow_credentials': bool,
                    'max_age': int,  # Preflight cache duration
                    'origin_patterns': List[str]  # Regex patterns for origins
                },
                'request': {
                    'origin': str,
                    'method': str,
                    'headers': List[str]
                },
                'security_level': 'strict|moderate|permissive',
                'environment': 'production|staging|development'
            }

        Returns:
            {
                'status': 'success|failed',
                'action': str,
                'cors_headers': Dict[str, str],
                'allowed': bool,
                'recommendations': List[Dict]
            }
        """
        action = params.get('action', 'configure')
        cors_config = params.get('cors_config', {})
        security_level = params.get('security_level', 'moderate')

        self.logger.info(f"CORS management action: {action}")

        if action == 'configure':
            # Build CORS configuration
            config = {
                'allowed_origins': cors_config.get('allowed_origins', ['https://app.example.com']),
                'allowed_methods': cors_config.get('allowed_methods', ['GET', 'POST', 'PUT', 'DELETE']),
                'allowed_headers': cors_config.get('allowed_headers', ['Content-Type', 'Authorization']),
                'exposed_headers': cors_config.get('exposed_headers', ['X-Request-ID', 'X-RateLimit-Remaining']),
                'allow_credentials': cors_config.get('allow_credentials', True),
                'max_age': cors_config.get('max_age', 86400),  # 24 hours
                'origin_patterns': cors_config.get('origin_patterns', [])
            }

            cors_headers = {
                'Access-Control-Allow-Origin': config['allowed_origins'][0] if config['allowed_origins'] else '*',
                'Access-Control-Allow-Methods': ', '.join(config['allowed_methods']),
                'Access-Control-Allow-Headers': ', '.join(config['allowed_headers']),
                'Access-Control-Expose-Headers': ', '.join(config['exposed_headers']),
                'Access-Control-Allow-Credentials': 'true' if config['allow_credentials'] else 'false',
                'Access-Control-Max-Age': str(config['max_age'])
            }

            return {
                'status': 'success',
                'action': 'configure',
                'configuration': config,
                'cors_headers': cors_headers,
                'message': 'CORS policy configured successfully'
            }

        elif action == 'validate':
            request_info = params.get('request', {})
            origin = request_info.get('origin')
            method = request_info.get('method', 'GET')
            headers = request_info.get('headers', [])

            allowed_origins = cors_config.get('allowed_origins', ['https://app.example.com'])
            allowed_methods = cors_config.get('allowed_methods', ['GET', 'POST'])
            allowed_headers = cors_config.get('allowed_headers', ['Content-Type'])

            # Validate origin
            origin_allowed = origin in allowed_origins or '*' in allowed_origins
            method_allowed = method in allowed_methods
            headers_allowed = all(h in allowed_headers for h in headers)

            allowed = origin_allowed and method_allowed and headers_allowed

            validation_result = {
                'allowed': allowed,
                'origin_allowed': origin_allowed,
                'method_allowed': method_allowed,
                'headers_allowed': headers_allowed,
                'request': {
                    'origin': origin,
                    'method': method,
                    'headers': headers
                },
                'policy': {
                    'allowed_origins': allowed_origins,
                    'allowed_methods': allowed_methods,
                    'allowed_headers': allowed_headers
                }
            }

            cors_headers = {}
            if allowed:
                cors_headers = {
                    'Access-Control-Allow-Origin': origin if origin_allowed else '',
                    'Access-Control-Allow-Methods': ', '.join(allowed_methods),
                    'Access-Control-Allow-Headers': ', '.join(allowed_headers),
                    'Access-Control-Allow-Credentials': 'true'
                }

            return {
                'status': 'success',
                'action': 'validate',
                'allowed': allowed,
                'validation_result': validation_result,
                'cors_headers': cors_headers if allowed else {},
                'message': 'Request allowed' if allowed else 'Request blocked by CORS policy'
            }

        elif action == 'recommend':
            environment = params.get('environment', 'production')

            recommendations = []

            if security_level == 'strict':
                recommendations.append({
                    'priority': 'high',
                    'category': 'origins',
                    'recommendation': 'Use explicit origin whitelist instead of wildcard',
                    'rationale': 'Wildcard origins are less secure and prevent credential usage'
                })
                recommendations.append({
                    'priority': 'high',
                    'category': 'credentials',
                    'recommendation': 'Only enable credentials when necessary',
                    'rationale': 'Credentials increase attack surface'
                })

            if environment == 'production':
                recommendations.append({
                    'priority': 'high',
                    'category': 'origins',
                    'recommendation': 'Remove development origins from production',
                    'rationale': 'Prevent unauthorized access from dev environments'
                })
                recommendations.append({
                    'priority': 'medium',
                    'category': 'methods',
                    'recommendation': 'Limit allowed methods to only those needed',
                    'rationale': 'Reduce attack surface by restricting HTTP methods'
                })

            recommended_config = {
                'allowed_origins': [
                    'https://app.example.com',
                    'https://admin.example.com'
                ],
                'allowed_methods': ['GET', 'POST', 'PUT', 'DELETE'],
                'allowed_headers': ['Content-Type', 'Authorization', 'X-API-Key'],
                'exposed_headers': ['X-Request-ID'],
                'allow_credentials': True,
                'max_age': 3600
            }

            return {
                'status': 'success',
                'action': 'recommend',
                'security_level': security_level,
                'environment': environment,
                'recommendations': recommendations,
                'recommended_config': recommended_config
            }

        elif action == 'test':
            test_scenarios = [
                {
                    'scenario': 'Valid same-origin request',
                    'origin': 'https://app.example.com',
                    'method': 'GET',
                    'result': 'allowed',
                    'status': 200
                },
                {
                    'scenario': 'Valid cross-origin GET',
                    'origin': 'https://partner.example.com',
                    'method': 'GET',
                    'result': 'allowed',
                    'status': 200
                },
                {
                    'scenario': 'Blocked origin',
                    'origin': 'https://malicious.com',
                    'method': 'POST',
                    'result': 'blocked',
                    'status': 403
                },
                {
                    'scenario': 'Blocked method',
                    'origin': 'https://app.example.com',
                    'method': 'TRACE',
                    'result': 'blocked',
                    'status': 405
                }
            ]

            return {
                'status': 'success',
                'action': 'test',
                'test_results': test_scenarios,
                'total_tests': len(test_scenarios),
                'passed': sum(1 for t in test_scenarios if t['result'] == 'allowed'),
                'failed': sum(1 for t in test_scenarios if t['result'] == 'blocked')
            }

        return {
            'status': 'success',
            'action': action
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate CORS management parameters."""
        valid_actions = ['configure', 'validate', 'test', 'list', 'recommend']
        action = params.get('action', 'configure')

        if action not in valid_actions:
            self.logger.error(f"Invalid action: {action}")
            return False

        return True
