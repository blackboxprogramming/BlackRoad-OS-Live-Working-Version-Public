"""
Sales Forecaster Agent

Forecasts sales using historical data, market trends, and AI-driven
predictive analytics to support business planning.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class SalesForecasterAgent(BaseAgent):
    """
    Forecasts sales and revenue using predictive analytics.

    Features:
    - Time series forecasting
    - Trend analysis
    - Seasonality detection
    - Multi-variable prediction
    - Confidence intervals
    - Scenario planning
    """

    def __init__(self):
        super().__init__(
            name='sales-forecaster',
            description='Forecast sales using AI-driven predictive analytics',
            category='business',
            version='1.0.0',
            tags=['sales', 'forecasting', 'analytics', 'prediction', 'planning']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate sales forecasts.

        Args:
            params: {
                'forecast_period': 'weekly|monthly|quarterly|yearly',
                'forecast_horizon': int,  # Number of periods ahead
                'model_type': 'time_series|regression|ml|ensemble',
                'include_products': List[str],
                'options': {
                    'include_seasonality': bool,
                    'include_trends': bool,
                    'include_external_factors': bool,
                    'confidence_level': float
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'forecast': Dict,
                'accuracy_metrics': Dict,
                'insights': List[str],
                'recommendations': List[str]
            }
        """
        forecast_period = params.get('forecast_period', 'monthly')
        forecast_horizon = params.get('forecast_horizon', 6)
        model_type = params.get('model_type', 'ensemble')
        options = params.get('options', {})

        self.logger.info(
            f"Generating {forecast_period} sales forecast for {forecast_horizon} periods"
        )

        # Mock historical sales data
        historical_sales = {
            'period': 'monthly',
            'data': [
                {'month': '2025-05', 'revenue': 425000, 'units': 1234, 'deals': 45},
                {'month': '2025-06', 'revenue': 456000, 'units': 1345, 'deals': 48},
                {'month': '2025-07', 'revenue': 438000, 'units': 1289, 'deals': 46},
                {'month': '2025-08', 'revenue': 489000, 'units': 1423, 'deals': 52},
                {'month': '2025-09', 'revenue': 512000, 'units': 1489, 'deals': 54},
                {'month': '2025-10', 'revenue': 534000, 'units': 1556, 'deals': 58},
                {'month': '2025-11', 'revenue': 485000, 'units': 1412, 'deals': 51}  # Partial
            ],
            'total_revenue_ytd': 3339000,
            'total_units_ytd': 9748,
            'total_deals_ytd': 354,
            'avg_deal_size': 9432
        }

        # Mock forecast data
        forecast_data = [
            {
                'period': '2025-12',
                'revenue_forecast': 548000,
                'revenue_lower_bound': 521000,
                'revenue_upper_bound': 575000,
                'confidence': 0.85,
                'units_forecast': 1598,
                'deals_forecast': 59,
                'growth_rate': 0.13
            },
            {
                'period': '2026-01',
                'revenue_forecast': 478000,
                'revenue_lower_bound': 445000,
                'revenue_upper_bound': 511000,
                'confidence': 0.82,
                'units_forecast': 1389,
                'deals_forecast': 51,
                'growth_rate': -0.13,  # Post-holiday dip
                'notes': 'Expected seasonal decrease after holiday surge'
            },
            {
                'period': '2026-02',
                'revenue_forecast': 492000,
                'revenue_lower_bound': 458000,
                'revenue_upper_bound': 526000,
                'confidence': 0.80,
                'units_forecast': 1432,
                'deals_forecast': 53,
                'growth_rate': 0.03
            },
            {
                'period': '2026-03',
                'revenue_forecast': 535000,
                'revenue_lower_bound': 498000,
                'revenue_upper_bound': 572000,
                'confidence': 0.78,
                'units_forecast': 1556,
                'deals_forecast': 57,
                'growth_rate': 0.09
            },
            {
                'period': '2026-04',
                'revenue_forecast': 556000,
                'revenue_lower_bound': 516000,
                'revenue_upper_bound': 596000,
                'confidence': 0.76,
                'units_forecast': 1618,
                'deals_forecast': 59,
                'growth_rate': 0.04
            },
            {
                'period': '2026-05',
                'revenue_forecast': 578000,
                'revenue_lower_bound': 535000,
                'revenue_upper_bound': 621000,
                'confidence': 0.74,
                'units_forecast': 1682,
                'deals_forecast': 61,
                'growth_rate': 0.04
            }
        ]

        # Mock trend analysis
        trend_analysis = {
            'overall_trend': 'upward',
            'growth_rate_avg': 0.036,  # 3.6% monthly
            'momentum': 'positive',
            'seasonality_detected': True,
            'seasonal_pattern': {
                'peak_months': ['November', 'December', 'March'],
                'low_months': ['January', 'February'],
                'seasonal_variance': 0.18
            },
            'trend_components': {
                'base_trend': 0.025,  # 2.5% base growth
                'seasonal_adjustment': 0.011,  # 1.1% seasonal boost
                'market_factor': 0.008  # 0.8% market growth
            }
        }

        # Mock accuracy metrics
        accuracy_metrics = {
            'model_type': model_type,
            'historical_accuracy': 0.91,  # 91% accurate historically
            'mae': 28450,  # Mean Absolute Error
            'mape': 0.062,  # Mean Absolute Percentage Error (6.2%)
            'rmse': 34200,  # Root Mean Squared Error
            'r_squared': 0.87,
            'forecast_confidence': 0.80,
            'training_period': '24 months',
            'last_updated': '2025-11-16'
        }

        # Mock contributing factors
        contributing_factors = {
            'internal_factors': [
                {
                    'factor': 'Sales team expansion',
                    'impact': '+8%',
                    'confidence': 0.85,
                    'description': 'Added 3 sales reps in Q3'
                },
                {
                    'factor': 'Marketing campaigns',
                    'impact': '+5%',
                    'confidence': 0.78,
                    'description': 'Increased lead generation by 45%'
                },
                {
                    'factor': 'Product improvements',
                    'impact': '+3%',
                    'confidence': 0.82,
                    'description': 'Higher conversion rates from new features'
                }
            ],
            'external_factors': [
                {
                    'factor': 'Market growth',
                    'impact': '+4%',
                    'confidence': 0.75,
                    'description': 'Industry growing at 4% annually'
                },
                {
                    'factor': 'Economic conditions',
                    'impact': '+2%',
                    'confidence': 0.70,
                    'description': 'Favorable business climate'
                },
                {
                    'factor': 'Competition',
                    'impact': '-3%',
                    'confidence': 0.65,
                    'description': 'New competitor entered market'
                }
            ]
        }

        # Mock scenario analysis
        scenarios = {
            'optimistic': {
                'description': 'Best case scenario',
                'assumptions': 'Strong market, successful campaigns, no competition',
                'revenue_forecast_total': 3387000,
                'growth_rate': 0.064,
                'probability': 0.20
            },
            'base': {
                'description': 'Most likely scenario',
                'assumptions': 'Current trends continue',
                'revenue_forecast_total': 3187000,
                'growth_rate': 0.036,
                'probability': 0.60
            },
            'pessimistic': {
                'description': 'Worst case scenario',
                'assumptions': 'Market slowdown, increased competition',
                'revenue_forecast_total': 2945000,
                'growth_rate': 0.012,
                'probability': 0.20
            }
        }

        # Mock pipeline analysis
        pipeline_analysis = {
            'current_pipeline_value': 4567000,
            'weighted_pipeline_value': 2234000,
            'pipeline_coverage_ratio': 1.43,  # 1.43x quota
            'conversion_rate': 0.28,
            'average_sales_cycle_days': 45,
            'expected_closed_revenue_30days': 623000,
            'expected_closed_revenue_60days': 1145000,
            'expected_closed_revenue_90days': 1689000
        }

        # Mock product forecast
        product_forecast = [
            {
                'product': 'Enterprise Plan',
                'current_monthly_revenue': 285000,
                'forecast_monthly_revenue': 312000,
                'growth_rate': 0.095,
                'confidence': 0.84
            },
            {
                'product': 'Professional Plan',
                'current_monthly_revenue': 145000,
                'forecast_monthly_revenue': 158000,
                'growth_rate': 0.090,
                'confidence': 0.81
            },
            {
                'product': 'Starter Plan',
                'current_monthly_revenue': 55000,
                'forecast_monthly_revenue': 54000,
                'growth_rate': -0.018,
                'confidence': 0.76,
                'notes': 'Users migrating to Professional Plan'
            }
        ]

        # Mock insights
        insights = [
            'Strong upward trend with 3.6% average monthly growth',
            'Seasonal peak expected in December (+13% over November)',
            'Q1 2026 shows typical post-holiday dip in January',
            'Pipeline coverage at 1.43x indicates healthy forecast achievement',
            'Enterprise Plan driving majority of growth',
            'Sales team expansion showing positive ROI',
            'Marketing campaigns contributing 5% to growth',
            'Competition impact manageable at -3%'
        ]

        return {
            'status': 'success',
            'forecast_period': forecast_period,
            'forecast_horizon': forecast_horizon,
            'model_type': model_type,
            'historical_sales': historical_sales,
            'forecast': forecast_data,
            'forecast_summary': {
                'total_forecast_revenue': sum(f['revenue_forecast'] for f in forecast_data),
                'average_monthly_forecast': sum(f['revenue_forecast'] for f in forecast_data) / len(forecast_data),
                'total_growth_projected': 0.216,  # 21.6% over 6 months
                'best_month': max(forecast_data, key=lambda x: x['revenue_forecast']),
                'weakest_month': min(forecast_data, key=lambda x: x['revenue_forecast'])
            },
            'trend_analysis': trend_analysis,
            'accuracy_metrics': accuracy_metrics,
            'contributing_factors': contributing_factors,
            'scenarios': scenarios,
            'pipeline_analysis': pipeline_analysis,
            'product_forecast': product_forecast,
            'insights': insights,
            'risk_factors': [
                {
                    'risk': 'Economic downturn',
                    'probability': 'low',
                    'potential_impact': '-15% to -25%',
                    'mitigation': 'Diversify customer base, focus on retention'
                },
                {
                    'risk': 'Increased competition',
                    'probability': 'medium',
                    'potential_impact': '-5% to -10%',
                    'mitigation': 'Accelerate product development, strengthen differentiation'
                },
                {
                    'risk': 'Sales team turnover',
                    'probability': 'low',
                    'potential_impact': '-8% to -12%',
                    'mitigation': 'Improve retention programs, cross-training'
                }
            ],
            'recommendations': [
                'Prepare inventory for December peak - expect 13% increase',
                'Plan hiring to support sustained growth trajectory',
                'Increase marketing spend in Q1 to counter seasonal dip',
                'Focus on Enterprise Plan - driving 95% growth',
                'Monitor pipeline closely - maintain 1.5x coverage ratio',
                'Implement retention programs for Starter Plan customers',
                'Develop competitive response strategy',
                'Set realistic quotas based on 3.6% monthly growth',
                'Plan for $3.2M revenue in next 6 months (base scenario)'
            ],
            'next_steps': [
                'Review forecast with sales leadership',
                'Adjust sales quotas and territories',
                'Update financial projections',
                'Allocate marketing budget based on forecast',
                'Plan resource capacity for peak periods',
                'Monitor actual vs forecast monthly',
                'Retrain model with new data quarterly'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate sales forecasting parameters."""
        valid_periods = ['weekly', 'monthly', 'quarterly', 'yearly']
        valid_models = ['time_series', 'regression', 'ml', 'ensemble']

        forecast_period = params.get('forecast_period')
        if forecast_period and forecast_period not in valid_periods:
            self.logger.error(f"Invalid forecast period: {forecast_period}")
            return False

        model_type = params.get('model_type')
        if model_type and model_type not in valid_models:
            self.logger.error(f"Invalid model type: {model_type}")
            return False

        forecast_horizon = params.get('forecast_horizon', 6)
        if forecast_horizon < 1 or forecast_horizon > 36:
            self.logger.error(f"Invalid forecast horizon: {forecast_horizon}")
            return False

        return True
