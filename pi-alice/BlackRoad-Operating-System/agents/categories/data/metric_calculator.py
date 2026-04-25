"""
Metric Calculator Agent

Calculates business metrics and KPIs with support for complex
formulas, aggregations, and time-based calculations.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class MetricCalculatorAgent(BaseAgent):
    """
    Calculates business metrics and KPIs.

    Supports:
    - Standard business metrics (revenue, growth, churn, LTV, CAC)
    - Custom metric definitions
    - Time-based calculations (MoM, YoY, rolling averages)
    - Cohort-based metrics
    - Ratio and percentage calculations
    - Statistical measures
    """

    def __init__(self):
        super().__init__(
            name='metric-calculator',
            description='Calculate business metrics and KPIs',
            category='data',
            version='1.0.0',
            tags=['metrics', 'kpi', 'business-intelligence', 'analytics']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate specified metrics.

        Args:
            params: {
                'metrics': [
                    {
                        'name': str,
                        'type': 'revenue|growth|retention|conversion|engagement',
                        'formula': str,  # For custom metrics
                        'aggregation': 'sum|avg|count|min|max',
                        'dimensions': List[str],
                        'filters': Dict[str, Any]
                    }
                ],
                'data_source': str,
                'time_period': {
                    'start_date': str,
                    'end_date': str,
                    'granularity': 'hourly|daily|weekly|monthly|quarterly|yearly'
                },
                'comparisons': {
                    'previous_period': bool,
                    'year_over_year': bool,
                    'baseline': Any
                },
                'options': {
                    'include_trends': bool,
                    'include_breakdown': bool,
                    'confidence_interval': float
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'metrics': List[Dict[str, Any]],
                'time_period': Dict[str, str],
                'execution_time_seconds': float,
                'data_points_processed': int,
                'trends': Dict[str, Any],
                'comparisons': Dict[str, Any],
                'insights': List[str]
            }
        """
        metrics = params.get('metrics', [])
        data_source = params.get('data_source')
        time_period = params.get('time_period', {})
        comparisons = params.get('comparisons', {})
        options = params.get('options', {})

        self.logger.info(
            f"Calculating {len(metrics)} metrics from '{data_source}'"
        )

        # Mock metric calculations
        calculated_metrics = self._calculate_mock_metrics(metrics, time_period)

        return {
            'status': 'success',
            'data_source': data_source,
            'metrics': calculated_metrics,
            'time_period': {
                'start_date': time_period.get('start_date', '2025-10-01'),
                'end_date': time_period.get('end_date', '2025-10-31'),
                'granularity': time_period.get('granularity', 'daily'),
                'total_days': 31
            },
            'execution_time_seconds': 1.8,
            'data_points_processed': 125000,
            'metrics_calculated': len(calculated_metrics),
            'trends': {
                'revenue_trend': 'increasing',
                'growth_rate': 0.23,
                'seasonality_detected': True,
                'volatility': 'low'
            } if options.get('include_trends') else {},
            'comparisons': {
                'vs_previous_period': {
                    'revenue_change': 0.15,
                    'user_growth': 0.08,
                    'conversion_rate_change': 0.03
                },
                'vs_year_ago': {
                    'revenue_change': 0.45,
                    'user_growth': 0.32,
                    'conversion_rate_change': 0.07
                }
            } if comparisons.get('previous_period') or comparisons.get('year_over_year') else {},
            'aggregated_metrics': {
                'total_revenue': 458900,
                'avg_daily_revenue': 14803,
                'total_users': 12450,
                'active_users': 8932,
                'conversion_rate': 4.2
            },
            'insights': [
                'Revenue showing strong upward trend (+23% vs last period)',
                'Conversion rate at all-time high, maintain current strategies',
                'Weekend performance significantly better than weekdays',
                'Customer lifetime value increasing steadily',
                'CAC:LTV ratio healthy at 1:4.5'
            ],
            'recommendations': [
                'Monitor revenue trend for sustainability',
                'Investigate weekend success factors for weekday optimization',
                'Consider increasing marketing spend given healthy CAC:LTV'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate metric calculation parameters."""
        if 'metrics' not in params or not params['metrics']:
            self.logger.error("At least one metric is required")
            return False

        if 'data_source' not in params:
            self.logger.error("Missing required field: data_source")
            return False

        return True

    def _calculate_mock_metrics(
        self,
        metrics: List[Dict[str, Any]],
        time_period: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Calculate mock metric values."""
        return [
            {
                'name': 'Monthly Recurring Revenue',
                'value': 45890,
                'unit': 'USD',
                'change_percentage': 15.3,
                'trend': 'up',
                'status': 'healthy'
            },
            {
                'name': 'Customer Acquisition Cost',
                'value': 42.50,
                'unit': 'USD',
                'change_percentage': -8.2,
                'trend': 'down',
                'status': 'healthy'
            },
            {
                'name': 'Customer Lifetime Value',
                'value': 1850,
                'unit': 'USD',
                'change_percentage': 12.4,
                'trend': 'up',
                'status': 'healthy'
            },
            {
                'name': 'Churn Rate',
                'value': 2.1,
                'unit': 'percent',
                'change_percentage': -38.2,
                'trend': 'down',
                'status': 'healthy'
            },
            {
                'name': 'Net Promoter Score',
                'value': 68,
                'unit': 'score',
                'change_percentage': 6.3,
                'trend': 'up',
                'status': 'good'
            }
        ]
