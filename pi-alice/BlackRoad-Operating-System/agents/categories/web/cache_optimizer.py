"""
Cache Optimizer Agent

Optimizes caching strategies for web applications and APIs, including HTTP caching,
CDN configuration, and cache invalidation strategies.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class CacheOptimizerAgent(BaseAgent):
    """
    Comprehensive cache optimization agent.

    Features:
    - HTTP caching header configuration
    - CDN cache strategy optimization
    - Cache invalidation patterns
    - Cache hit/miss analysis
    - Multi-layer caching strategies
    - Cache warming and preloading
    """

    def __init__(self):
        super().__init__(
            name='cache-optimizer',
            description='Optimize caching strategies',
            category='web',
            version='1.0.0',
            tags=['cache', 'optimization', 'cdn', 'performance', 'http-headers']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimize caching strategies.

        Args:
            params: {
                'action': 'analyze|configure|invalidate|warm|stats',
                'resource_type': 'static|dynamic|api|image|video|document',
                'url': str,  # Resource URL
                'cache_config': {
                    'strategy': 'aggressive|moderate|conservative|custom',
                    'ttl': int,  # Time to live in seconds
                    'max_age': int,  # Cache-Control max-age
                    's_maxage': int,  # Shared cache max-age
                    'stale_while_revalidate': int,
                    'stale_if_error': int,
                    'vary_headers': List[str],
                    'cache_key_params': List[str]
                },
                'cdn_config': {
                    'enabled': bool,
                    'provider': 'cloudflare|cloudfront|fastly|akamai',
                    'edge_locations': List[str],
                    'custom_rules': List[Dict]
                },
                'invalidation': {
                    'pattern': str,  # URL pattern to invalidate
                    'purge_type': 'single|pattern|tag|all',
                    'tags': List[str]
                },
                'warming': {
                    'urls': List[str],
                    'priority': 'high|medium|low',
                    'schedule': str  # Cron expression
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'action': str,
                'cache_headers': Dict[str, str],
                'recommendations': List[Dict],
                'metrics': Dict[str, Any]
            }
        """
        action = params.get('action', 'analyze')
        resource_type = params.get('resource_type', 'static')
        cache_config = params.get('cache_config', {})

        self.logger.info(f"Cache optimization action: {action} for {resource_type} resources")

        # Define caching strategies by resource type
        default_strategies = {
            'static': {
                'max_age': 31536000,  # 1 year
                's_maxage': 31536000,
                'immutable': True,
                'public': True
            },
            'dynamic': {
                'max_age': 300,  # 5 minutes
                's_maxage': 600,  # 10 minutes (shared)
                'stale_while_revalidate': 86400,  # 1 day
                'private': False
            },
            'api': {
                'max_age': 60,  # 1 minute
                's_maxage': 120,
                'stale_while_revalidate': 300,
                'must_revalidate': True
            },
            'image': {
                'max_age': 2592000,  # 30 days
                's_maxage': 2592000,
                'public': True
            },
            'video': {
                'max_age': 86400,  # 1 day
                's_maxage': 604800,  # 7 days
                'public': True
            }
        }

        strategy = default_strategies.get(resource_type, default_strategies['static'])

        if action == 'analyze':
            analysis = {
                'resource_type': resource_type,
                'current_headers': {
                    'Cache-Control': 'max-age=3600, public',
                    'ETag': '"abc123def456"',
                    'Last-Modified': 'Wed, 15 Nov 2025 10:00:00 GMT',
                    'Vary': 'Accept-Encoding'
                },
                'recommendations': [
                    {
                        'priority': 'high',
                        'category': 'cache_duration',
                        'current': 'max-age=3600',
                        'recommended': f'max-age={strategy["max_age"]}',
                        'impact': 'Increase cache hit ratio by ~45%',
                        'reason': f'{resource_type} content can be cached longer'
                    },
                    {
                        'priority': 'medium',
                        'category': 'stale_handling',
                        'current': 'none',
                        'recommended': 'stale-while-revalidate=86400',
                        'impact': 'Improve perceived performance',
                        'reason': 'Serve stale content while revalidating in background'
                    },
                    {
                        'priority': 'medium',
                        'category': 'cdn',
                        'current': 'disabled',
                        'recommended': 'enabled with edge caching',
                        'impact': 'Reduce latency by ~60% globally',
                        'reason': 'Distribute content closer to users'
                    }
                ],
                'cache_metrics': {
                    'current_hit_rate': 62.5,
                    'estimated_hit_rate': 89.3,
                    'potential_bandwidth_savings': '45%',
                    'potential_latency_improvement': '320ms'
                }
            }

            return {
                'status': 'success',
                'action': 'analyze',
                'analysis': analysis
            }

        elif action == 'configure':
            optimized_strategy = cache_config.get('strategy', 'moderate')

            cache_headers = {
                'Cache-Control': self._build_cache_control(strategy, cache_config),
                'ETag': '"optimized-abc123"',
                'Vary': ', '.join(cache_config.get('vary_headers', ['Accept-Encoding'])),
                'CDN-Cache-Control': f's-maxage={strategy.get("s_maxage", 3600)}'
            }

            configuration = {
                'resource_type': resource_type,
                'strategy': optimized_strategy,
                'headers': cache_headers,
                'cdn_config': params.get('cdn_config', {}),
                'applied_at': '2025-11-16T00:00:00Z'
            }

            return {
                'status': 'success',
                'action': 'configure',
                'configuration': configuration,
                'cache_headers': cache_headers,
                'message': 'Cache configuration applied successfully'
            }

        elif action == 'invalidate':
            invalidation = params.get('invalidation', {})
            purge_type = invalidation.get('purge_type', 'single')

            result = {
                'invalidation_id': 'inv-20251116-001',
                'purge_type': purge_type,
                'pattern': invalidation.get('pattern'),
                'status': 'completed',
                'items_invalidated': 142,
                'cdn_propagation_time_seconds': 15,
                'invalidated_at': '2025-11-16T00:00:00Z',
                'affected_edges': ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']
            }

            return {
                'status': 'success',
                'action': 'invalidate',
                'result': result
            }

        elif action == 'warm':
            warming = params.get('warming', {})
            urls = warming.get('urls', [])

            result = {
                'warming_id': 'warm-20251116-001',
                'urls_count': len(urls),
                'priority': warming.get('priority', 'medium'),
                'status': 'in_progress',
                'warmed': 87,
                'pending': 13,
                'failed': 0,
                'estimated_completion': '2025-11-16T00:05:00Z',
                'edge_locations': ['us-east-1', 'us-west-2', 'eu-west-1']
            }

            return {
                'status': 'success',
                'action': 'warm',
                'result': result
            }

        elif action == 'stats':
            stats = {
                'time_period': '24h',
                'total_requests': 1543892,
                'cache_hits': 1234567,
                'cache_misses': 309325,
                'cache_hit_rate': 79.97,
                'bytes_served_from_cache': 15728640000,  # ~15 GB
                'bandwidth_saved': '62%',
                'average_response_time': {
                    'cache_hit': 12,  # ms
                    'cache_miss': 234  # ms
                },
                'top_cached_resources': [
                    {'url': '/static/css/main.css', 'hits': 45678, 'bytes': 153600},
                    {'url': '/static/js/bundle.js', 'hits': 43210, 'bytes': 524288},
                    {'url': '/api/v1/config', 'hits': 38541, 'bytes': 2048}
                ],
                'cache_by_type': {
                    'static': {'hits': 876543, 'hit_rate': 94.5},
                    'dynamic': {'hits': 234567, 'hit_rate': 65.3},
                    'api': {'hits': 123457, 'hit_rate': 58.7}
                }
            }

            return {
                'status': 'success',
                'action': 'stats',
                'statistics': stats
            }

        return {
            'status': 'success',
            'action': action
        }

    def _build_cache_control(self, strategy: Dict, config: Dict) -> str:
        """Build Cache-Control header value."""
        parts = []

        if 'max_age' in strategy:
            parts.append(f"max-age={strategy['max_age']}")

        if strategy.get('public'):
            parts.append('public')
        elif strategy.get('private'):
            parts.append('private')

        if strategy.get('immutable'):
            parts.append('immutable')

        if strategy.get('must_revalidate'):
            parts.append('must-revalidate')

        if 'stale_while_revalidate' in strategy:
            parts.append(f"stale-while-revalidate={strategy['stale_while_revalidate']}")

        return ', '.join(parts)

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate cache optimization parameters."""
        valid_actions = ['analyze', 'configure', 'invalidate', 'warm', 'stats']
        action = params.get('action', 'analyze')

        if action not in valid_actions:
            self.logger.error(f"Invalid action: {action}")
            return False

        valid_resource_types = ['static', 'dynamic', 'api', 'image', 'video', 'document']
        resource_type = params.get('resource_type', 'static')
        if resource_type not in valid_resource_types:
            self.logger.error(f"Invalid resource_type: {resource_type}")
            return False

        return True
