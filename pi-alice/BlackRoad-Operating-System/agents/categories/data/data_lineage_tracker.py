"""
Data Lineage Tracker Agent

Tracks data lineage and provenance to understand data flow,
transformations, and dependencies across systems.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class DataLineageTrackerAgent(BaseAgent):
    """
    Tracks data lineage and provenance.

    Supports:
    - End-to-end data flow tracking
    - Transformation documentation
    - Dependency mapping
    - Impact analysis
    - Compliance and audit trails
    - Visualization of data pipelines
    """

    def __init__(self):
        super().__init__(
            name='data-lineage-tracker',
            description='Track data lineage and provenance',
            category='data',
            version='1.0.0',
            tags=['lineage', 'provenance', 'governance', 'compliance', 'metadata']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Track and analyze data lineage.

        Args:
            params: {
                'operation': 'track|analyze|visualize|impact_analysis',
                'data_asset': str,  # Table, column, or dataset to track
                'direction': 'upstream|downstream|both',
                'depth': int,  # How many levels to traverse
                'options': {
                    'include_transformations': bool,
                    'include_metadata': bool,
                    'include_quality_metrics': bool,
                    'show_timestamps': bool,
                    'format': 'graph|tree|table'
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'data_asset': str,
                'lineage_graph': Dict[str, Any],
                'total_nodes': int,
                'total_edges': int,
                'upstream_sources': List[Dict[str, Any]],
                'downstream_consumers': List[Dict[str, Any]],
                'transformations': List[Dict[str, Any]],
                'execution_time_seconds': float,
                'insights': List[str],
                'recommendations': List[str]
            }
        """
        operation = params.get('operation', 'track')
        data_asset = params.get('data_asset')
        direction = params.get('direction', 'both')
        depth = params.get('depth', 5)
        options = params.get('options', {})

        self.logger.info(
            f"Tracking {direction} lineage for '{data_asset}' (depth: {depth})"
        )

        # Mock lineage tracking
        upstream_sources = self._get_upstream_sources()
        downstream_consumers = self._get_downstream_consumers()
        transformations = self._get_transformations()

        return {
            'status': 'success',
            'operation': operation,
            'data_asset': data_asset,
            'direction': direction,
            'depth_analyzed': depth,
            'execution_time_seconds': 3.5,
            'total_nodes': 24,
            'total_edges': 31,
            'total_levels': 5,
            'lineage_graph': {
                'nodes': [
                    {'id': 'node_1', 'type': 'source', 'name': 'raw_transactions'},
                    {'id': 'node_2', 'type': 'transformation', 'name': 'clean_data'},
                    {'id': 'node_3', 'type': 'table', 'name': 'analytics.user_metrics'},
                    {'id': 'node_4', 'type': 'view', 'name': 'dashboard_view'},
                    {'id': 'node_5', 'type': 'report', 'name': 'executive_report'}
                ],
                'edges': [
                    {'from': 'node_1', 'to': 'node_2', 'type': 'data_flow'},
                    {'from': 'node_2', 'to': 'node_3', 'type': 'transformation'},
                    {'from': 'node_3', 'to': 'node_4', 'type': 'aggregation'},
                    {'from': 'node_4', 'to': 'node_5', 'type': 'consumption'}
                ]
            },
            'upstream_sources': upstream_sources,
            'downstream_consumers': downstream_consumers,
            'transformations': transformations if options.get('include_transformations') else [],
            'metadata': {
                'created_date': '2024-06-15',
                'last_modified': '2025-11-16',
                'owner': 'data_engineering_team',
                'criticality': 'high',
                'pii_data': True,
                'retention_days': 365
            } if options.get('include_metadata') else {},
            'data_quality_metrics': {
                'completeness': 0.95,
                'accuracy': 0.92,
                'consistency': 0.89,
                'timeliness': 0.97,
                'last_quality_check': '2025-11-16T09:00:00Z'
            } if options.get('include_quality_metrics') else {},
            'impact_analysis': {
                'affected_downstream_assets': 12,
                'affected_users': 45,
                'affected_reports': 8,
                'critical_dependencies': 3,
                'estimated_impact_severity': 'high'
            } if operation == 'impact_analysis' else {},
            'dependencies': {
                'direct_dependencies': 6,
                'indirect_dependencies': 18,
                'circular_dependencies': 0,
                'external_dependencies': 2
            },
            'timeline': [
                {
                    'timestamp': '2025-11-16T08:00:00Z',
                    'event': 'data_ingestion',
                    'source': 'api.transactions',
                    'records': 15000
                },
                {
                    'timestamp': '2025-11-16T08:15:00Z',
                    'event': 'transformation',
                    'operation': 'clean_and_validate',
                    'records_in': 15000,
                    'records_out': 14850
                },
                {
                    'timestamp': '2025-11-16T08:30:00Z',
                    'event': 'aggregation',
                    'operation': 'compute_metrics',
                    'records_in': 14850,
                    'records_out': 1250
                }
            ] if options.get('show_timestamps') else [],
            'compliance_info': {
                'gdpr_compliant': True,
                'data_classification': 'confidential',
                'encryption_at_rest': True,
                'encryption_in_transit': True,
                'audit_logged': True,
                'retention_policy': 'Delete after 365 days'
            },
            'performance_metrics': {
                'average_refresh_time': 450,  # seconds
                'last_refresh_duration': 380,
                'success_rate_30d': 0.98,
                'failures_last_week': 2
            },
            'insights': [
                'Data flows through 5 transformation layers',
                'Primary source is API transactions endpoint',
                'Data feeds 12 downstream reports and dashboards',
                '3 critical dependencies identified',
                'No circular dependencies detected',
                'Data quality scores are above 89% across all dimensions'
            ],
            'recommendations': [
                'Document transformation logic for audit compliance',
                'Add data quality checks at each transformation step',
                'Implement monitoring alerts for critical dependencies',
                'Review and optimize transformation pipeline (450s avg)',
                'Consider adding redundancy for high-criticality asset',
                'Schedule regular lineage updates and verification'
            ],
            'visualization_url': f'https://lineage.example.com/viz/{data_asset}',
            'export_formats': ['json', 'graphml', 'svg', 'pdf']
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate lineage tracking parameters."""
        if 'data_asset' not in params:
            self.logger.error("Missing required field: data_asset")
            return False

        valid_operations = ['track', 'analyze', 'visualize', 'impact_analysis']
        operation = params.get('operation', 'track')

        if operation not in valid_operations:
            self.logger.error(f"Invalid operation: {operation}")
            return False

        valid_directions = ['upstream', 'downstream', 'both']
        direction = params.get('direction', 'both')

        if direction not in valid_directions:
            self.logger.error(f"Invalid direction: {direction}")
            return False

        return True

    def _get_upstream_sources(self) -> List[Dict[str, Any]]:
        """Get mock upstream data sources."""
        return [
            {
                'name': 'api.transactions',
                'type': 'api_endpoint',
                'level': 1,
                'records': 15000,
                'last_updated': '2025-11-16T08:00:00Z'
            },
            {
                'name': 'database.users',
                'type': 'database_table',
                'level': 1,
                'records': 25000,
                'last_updated': '2025-11-16T07:30:00Z'
            },
            {
                'name': 's3.historical_data',
                'type': 's3_bucket',
                'level': 2,
                'records': 1000000,
                'last_updated': '2025-11-15T23:00:00Z'
            }
        ]

    def _get_downstream_consumers(self) -> List[Dict[str, Any]]:
        """Get mock downstream consumers."""
        return [
            {
                'name': 'executive_dashboard',
                'type': 'dashboard',
                'level': 1,
                'users': 15,
                'last_accessed': '2025-11-16T09:30:00Z'
            },
            {
                'name': 'analytics.daily_report',
                'type': 'scheduled_report',
                'level': 1,
                'recipients': 25,
                'last_run': '2025-11-16T09:00:00Z'
            },
            {
                'name': 'ml_model.churn_prediction',
                'type': 'ml_model',
                'level': 2,
                'predictions_daily': 5000,
                'last_trained': '2025-11-10T00:00:00Z'
            }
        ]

    def _get_transformations(self) -> List[Dict[str, Any]]:
        """Get mock transformation steps."""
        return [
            {
                'step': 1,
                'name': 'data_cleaning',
                'operation': 'Remove duplicates and nulls',
                'records_in': 15000,
                'records_out': 14850,
                'columns_affected': ['email', 'transaction_id'],
                'execution_time': 45
            },
            {
                'step': 2,
                'name': 'data_enrichment',
                'operation': 'Join with user demographics',
                'records_in': 14850,
                'records_out': 14850,
                'columns_added': ['age', 'location', 'segment'],
                'execution_time': 120
            },
            {
                'step': 3,
                'name': 'aggregation',
                'operation': 'Group by user and calculate metrics',
                'records_in': 14850,
                'records_out': 1250,
                'metrics_calculated': ['total_spend', 'avg_order', 'frequency'],
                'execution_time': 85
            }
        ]
