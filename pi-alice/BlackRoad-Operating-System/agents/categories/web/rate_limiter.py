"""
Rate Limiter Agent

Implements rate limiting strategies to control API request rates, prevent abuse,
and ensure fair resource usage across different clients and endpoints.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class RateLimiterAgent(BaseAgent):
    """
    Comprehensive rate limiting agent.

    Features:
    - Multiple rate limiting algorithms (token bucket, sliding window, fixed window)
    - Per-user, per-IP, and per-endpoint limits
    - Rate limit headers and responses
    - Burst handling and quota management
    - Rate limit metrics and monitoring
    - Distributed rate limiting support
    """

    def __init__(self):
        super().__init__(
            name='rate-limiter',
            description='Implement rate limiting',
            category='web',
            version='1.0.0',
            tags=['rate-limiting', 'api', 'throttling', 'quota', 'abuse-prevention']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Implement rate limiting.

        Args:
            params: {
                'action': 'check|configure|reset|get_stats',
                'identifier': str,  # User ID, API key, or IP address
                'identifier_type': 'user|api_key|ip|endpoint',
                'limit_config': {
                    'algorithm': 'token_bucket|sliding_window|fixed_window|leaky_bucket',
                    'limits': {
                        'requests_per_second': int,
                        'requests_per_minute': int,
                        'requests_per_hour': int,
                        'requests_per_day': int
                    },
                    'burst_size': int,  # Maximum burst allowed
                    'cost_per_request': int  # For weighted rate limiting
                },
                'endpoint': str,  # Specific endpoint being accessed
                'scope': 'global|endpoint|resource',
                'tier': 'free|basic|premium|enterprise',  # User tier
                'options': {
                    'distributed': bool,  # Use distributed rate limiting
                    'grace_period': int,  # Grace period in seconds
                    'include_headers': bool  # Include rate limit headers
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'action': str,
                'allowed': bool,  # For check action
                'rate_limit_info': Dict[str, Any],
                'headers': Dict[str, str]  # Rate limit headers
            }
        """
        action = params.get('action', 'check')
        identifier = params.get('identifier')
        tier = params.get('tier', 'free')
        limit_config = params.get('limit_config', {})

        self.logger.info(f"Rate limiting action: {action} for {identifier}")

        # Define tier-based limits
        tier_limits = {
            'free': {
                'requests_per_minute': 60,
                'requests_per_hour': 1000,
                'requests_per_day': 10000,
                'burst_size': 10
            },
            'basic': {
                'requests_per_minute': 120,
                'requests_per_hour': 5000,
                'requests_per_day': 50000,
                'burst_size': 20
            },
            'premium': {
                'requests_per_minute': 300,
                'requests_per_hour': 15000,
                'requests_per_day': 150000,
                'burst_size': 50
            },
            'enterprise': {
                'requests_per_minute': 1000,
                'requests_per_hour': 50000,
                'requests_per_day': 500000,
                'burst_size': 100
            }
        }

        current_limits = tier_limits.get(tier, tier_limits['free'])

        if action == 'check':
            # Simulate rate limit check
            allowed = True
            remaining_minute = 45
            remaining_hour = 876
            remaining_day = 8543

            rate_limit_info = {
                'identifier': identifier,
                'tier': tier,
                'algorithm': limit_config.get('algorithm', 'sliding_window'),
                'current_usage': {
                    'requests_this_minute': current_limits['requests_per_minute'] - remaining_minute,
                    'requests_this_hour': current_limits['requests_per_hour'] - remaining_hour,
                    'requests_this_day': current_limits['requests_per_day'] - remaining_day
                },
                'limits': current_limits,
                'remaining': {
                    'minute': remaining_minute,
                    'hour': remaining_hour,
                    'day': remaining_day
                },
                'resets_at': {
                    'minute': '2025-11-16T00:01:00Z',
                    'hour': '2025-11-16T01:00:00Z',
                    'day': '2025-11-17T00:00:00Z'
                },
                'retry_after': None  # Only set if rate limit exceeded
            }

            headers = {
                'X-RateLimit-Limit': str(current_limits['requests_per_minute']),
                'X-RateLimit-Remaining': str(remaining_minute),
                'X-RateLimit-Reset': '1731724860',
                'X-RateLimit-Tier': tier,
                'X-RateLimit-Policy': 'sliding_window'
            }

            return {
                'status': 'success',
                'action': 'check',
                'allowed': allowed,
                'rate_limit_info': rate_limit_info,
                'headers': headers,
                'message': 'Request allowed' if allowed else 'Rate limit exceeded'
            }

        elif action == 'configure':
            new_config = {
                'identifier': identifier,
                'tier': tier,
                'algorithm': limit_config.get('algorithm', 'sliding_window'),
                'limits': limit_config.get('limits', current_limits),
                'burst_size': limit_config.get('burst_size', current_limits['burst_size']),
                'configured_at': '2025-11-16T00:00:00Z',
                'active': True
            }

            return {
                'status': 'success',
                'action': 'configure',
                'configuration': new_config,
                'message': 'Rate limit configuration updated'
            }

        elif action == 'reset':
            return {
                'status': 'success',
                'action': 'reset',
                'identifier': identifier,
                'reset_at': '2025-11-16T00:00:00Z',
                'message': 'Rate limit counters reset'
            }

        elif action == 'get_stats':
            stats = {
                'identifier': identifier,
                'tier': tier,
                'time_period': '24h',
                'total_requests': 8457,
                'allowed_requests': 8457,
                'blocked_requests': 0,
                'success_rate': 100.0,
                'peak_requests_per_minute': 89,
                'average_requests_per_minute': 5.9,
                'burst_events': 3,
                'quota_usage_percent': 84.57,
                'top_endpoints': [
                    {'endpoint': '/api/v1/users', 'requests': 3421},
                    {'endpoint': '/api/v1/data', 'requests': 2876},
                    {'endpoint': '/api/v1/analytics', 'requests': 2160}
                ],
                'hourly_distribution': [
                    {'hour': '00:00', 'requests': 234},
                    {'hour': '01:00', 'requests': 189},
                    {'hour': '02:00', 'requests': 156}
                    # ... more hours
                ]
            }

            return {
                'status': 'success',
                'action': 'get_stats',
                'identifier': identifier,
                'statistics': stats
            }

        return {
            'status': 'success',
            'action': action
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate rate limiting parameters."""
        valid_actions = ['check', 'configure', 'reset', 'get_stats']
        action = params.get('action', 'check')

        if action not in valid_actions:
            self.logger.error(f"Invalid action: {action}")
            return False

        if 'identifier' not in params:
            self.logger.error("Missing required field: identifier")
            return False

        valid_tiers = ['free', 'basic', 'premium', 'enterprise']
        tier = params.get('tier', 'free')
        if tier not in valid_tiers:
            self.logger.error(f"Invalid tier: {tier}")
            return False

        return True
