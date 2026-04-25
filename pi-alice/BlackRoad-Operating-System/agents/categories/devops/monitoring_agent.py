"""
Monitoring Agent

Collects and reports system metrics, health checks, and alerts.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class MonitoringAgent(BaseAgent):
    """Monitors system health and performance metrics."""

    def __init__(self):
        super().__init__(
            name='monitoring-agent',
            description='Monitors system health, metrics, and performance',
            category='devops',
            version='1.0.0',
            tags=['monitoring', 'metrics', 'alerting', 'observability']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Collect and report metrics.

        Args:
            params: {
                'targets': ['service1', 'service2'],
                'metrics': ['cpu', 'memory', 'disk', 'network'],
                'interval_seconds': 60,
                'alert_thresholds': {
                    'cpu_percent': 80,
                    'memory_percent': 85,
                    'disk_percent': 90
                }
            }

        Returns:
            {
                'status': 'healthy|warning|critical',
                'metrics': {...},
                'alerts': [...]
            }
        """
        targets = params.get('targets', [])
        metrics = params.get('metrics', ['cpu', 'memory', 'disk'])
        thresholds = params.get('alert_thresholds', {})

        self.logger.info(f"Monitoring {len(targets)} targets")

        # Mock metrics collection
        collected_metrics = {}
        alerts = []

        for target in targets:
            target_metrics = {
                'cpu_percent': 45.2,
                'memory_percent': 62.1,
                'disk_percent': 73.5,
                'network_rx_mbps': 12.3,
                'network_tx_mbps': 8.7,
                'uptime_hours': 720.5,
                'request_rate': 1234,
                'error_rate': 0.02
            }

            collected_metrics[target] = target_metrics

            # Check thresholds
            if target_metrics['cpu_percent'] > thresholds.get('cpu_percent', 80):
                alerts.append({
                    'severity': 'warning',
                    'target': target,
                    'metric': 'cpu_percent',
                    'value': target_metrics['cpu_percent'],
                    'threshold': thresholds.get('cpu_percent')
                })

        overall_status = 'healthy'
        if len(alerts) > 0:
            if any(a['severity'] == 'critical' for a in alerts):
                overall_status = 'critical'
            else:
                overall_status = 'warning'

        return {
            'status': overall_status,
            'timestamp': '2025-11-16T00:00:00Z',
            'targets_monitored': len(targets),
            'metrics': collected_metrics,
            'alerts': alerts,
            'summary': {
                'total_alerts': len(alerts),
                'critical_alerts': sum(
                    1 for a in alerts if a['severity'] == 'critical'
                ),
                'warning_alerts': sum(
                    1 for a in alerts if a['severity'] == 'warning'
                )
            }
        }
