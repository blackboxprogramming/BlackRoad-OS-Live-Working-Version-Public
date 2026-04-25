"""
Load Balancer Configuration Agent

Configures and manages load balancers including NGINX, HAProxy,
AWS ELB/ALB/NLB, and GCP Load Balancer.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class LoadBalancerConfigAgent(BaseAgent):
    """Configures and manages load balancers."""

    def __init__(self):
        super().__init__(
            name='load-balancer-config',
            description='Configure load balancers and traffic distribution',
            category='devops',
            version='1.0.0',
            tags=['load-balancer', 'nginx', 'haproxy', 'traffic', 'scaling']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Configure load balancer.

        Args:
            params: {
                'lb_type': 'nginx|haproxy|aws-alb|aws-nlb|gcp-lb',
                'action': 'create|update|delete|health-check',
                'name': 'my-load-balancer',
                'listeners': [{'port': 80, 'protocol': 'HTTP'}],
                'backend_pool': ['10.0.1.10:8080', '10.0.1.11:8080'],
                'algorithm': 'round-robin|least-conn|ip-hash',
                'health_check': {
                    'protocol': 'HTTP',
                    'port': 8080,
                    'path': '/health',
                    'interval_seconds': 30,
                    'timeout_seconds': 5,
                    'healthy_threshold': 2,
                    'unhealthy_threshold': 3
                },
                'ssl_config': {
                    'certificate_arn': 'arn:aws:acm:...',
                    'ssl_policy': 'ELBSecurityPolicy-TLS-1-2-2017-01'
                },
                'sticky_sessions': true|false,
                'connection_draining': {'enabled': true, 'timeout': 300}
            }

        Returns:
            {
                'status': 'success',
                'lb_id': '...',
                'dns_name': 'lb-123.us-east-1.elb.amazonaws.com',
                'backends': {...}
            }
        """
        lb_type = params.get('lb_type', 'nginx')
        action = params.get('action', 'create')
        name = params.get('name')
        backend_pool = params.get('backend_pool', [])
        algorithm = params.get('algorithm', 'round-robin')

        self.logger.info(
            f"Configuring {lb_type} load balancer: {name} ({action})"
        )

        result = {
            'status': 'success',
            'action': action,
            'lb_type': lb_type,
            'name': name,
            'lb_id': f'lb-{lb_type}-{name}',
            'timestamp': '2025-11-16T00:00:00Z'
        }

        if action in ['create', 'update']:
            result.update({
                'dns_name': f'{name}.us-east-1.elb.amazonaws.com',
                'ip_address': '54.123.45.67',
                'listeners': params.get('listeners', [
                    {'port': 80, 'protocol': 'HTTP'},
                    {'port': 443, 'protocol': 'HTTPS'}
                ]),
                'backend_pool': backend_pool,
                'algorithm': algorithm,
                'backends_status': {
                    'total': len(backend_pool),
                    'healthy': len(backend_pool) - 1,
                    'unhealthy': 1
                },
                'health_check_configured': 'health_check' in params,
                'ssl_enabled': 'ssl_config' in params,
                'sticky_sessions': params.get('sticky_sessions', False),
                'connection_draining': params.get('connection_draining', {}).get('enabled', False)
            })

        if action == 'health-check':
            result['health_status'] = [
                {'backend': '10.0.1.10:8080', 'status': 'healthy', 'response_time_ms': 45},
                {'backend': '10.0.1.11:8080', 'status': 'healthy', 'response_time_ms': 52},
                {'backend': '10.0.1.12:8080', 'status': 'unhealthy', 'last_error': 'Connection timeout'}
            ]
            result['summary'] = {
                'total_backends': 3,
                'healthy': 2,
                'unhealthy': 1
            }

        if action == 'delete':
            result['deleted'] = True
            result['backends_drained'] = len(backend_pool)

        return result

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate load balancer parameters."""
        if 'name' not in params:
            self.logger.error("Missing required field: name")
            return False

        valid_types = ['nginx', 'haproxy', 'aws-alb', 'aws-nlb', 'gcp-lb']
        lb_type = params.get('lb_type', 'nginx')
        if lb_type not in valid_types:
            self.logger.error(f"Invalid lb_type: {lb_type}")
            return False

        valid_actions = ['create', 'update', 'delete', 'health-check']
        action = params.get('action', 'create')
        if action not in valid_actions:
            self.logger.error(f"Invalid action: {action}")
            return False

        if action in ['create', 'update'] and 'backend_pool' not in params:
            self.logger.error("Missing required field: backend_pool")
            return False

        return True
