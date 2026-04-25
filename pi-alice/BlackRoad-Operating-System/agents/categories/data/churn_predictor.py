"""
Churn Predictor Agent

Predicts customer churn using machine learning models and
identifies at-risk customers for proactive retention.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class ChurnPredictorAgent(BaseAgent):
    """
    Predicts customer churn probability.

    Supports:
    - Multiple ML models (logistic regression, random forest, XGBoost, neural networks)
    - Feature importance analysis
    - Risk scoring and segmentation
    - Proactive intervention recommendations
    - Model performance metrics
    - Real-time prediction API
    """

    def __init__(self):
        super().__init__(
            name='churn-predictor',
            description='Predict customer churn probability using machine learning',
            category='data',
            version='1.0.0',
            tags=['churn-prediction', 'machine-learning', 'retention', 'classification']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict customer churn.

        Args:
            params: {
                'data_source': str,
                'model': 'logistic_regression|random_forest|xgboost|neural_network|auto',
                'features': List[str],
                'prediction_horizon': int,  # Days ahead to predict
                'options': {
                    'risk_threshold': float,
                    'include_feature_importance': bool,
                    'include_recommendations': bool,
                    'segment_predictions': bool,
                    'train_new_model': bool
                },
                'customer_ids': List[str]  # Specific customers to score, or all if empty
            }

        Returns:
            {
                'status': 'success|failed',
                'model_used': str,
                'total_customers_scored': int,
                'high_risk_customers': int,
                'predictions': List[Dict[str, Any]],
                'model_performance': Dict[str, Any],
                'feature_importance': Dict[str, float],
                'execution_time_seconds': float,
                'insights': List[str],
                'recommendations': List[Dict[str, Any]]
            }
        """
        data_source = params.get('data_source')
        model = params.get('model', 'auto')
        features = params.get('features', [])
        prediction_horizon = params.get('prediction_horizon', 30)
        options = params.get('options', {})
        customer_ids = params.get('customer_ids', [])

        self.logger.info(
            f"Predicting churn using {model} model with {prediction_horizon}-day horizon"
        )

        # Mock churn prediction
        total_customers = len(customer_ids) if customer_ids else 25000
        high_risk = int(total_customers * 0.12)  # 12% high risk
        medium_risk = int(total_customers * 0.18)  # 18% medium risk

        predictions = self._generate_churn_predictions(min(total_customers, 100))

        return {
            'status': 'success',
            'data_source': data_source,
            'model_used': 'xgboost' if model == 'auto' else model,
            'prediction_horizon_days': prediction_horizon,
            'total_customers_scored': total_customers,
            'execution_time_seconds': 8.9,
            'risk_distribution': {
                'high_risk': high_risk,
                'medium_risk': medium_risk,
                'low_risk': total_customers - high_risk - medium_risk,
                'high_risk_percentage': round((high_risk / total_customers) * 100, 1),
                'medium_risk_percentage': round((medium_risk / total_customers) * 100, 1)
            },
            'predictions': predictions[:20],  # Return top 20 for preview
            'model_performance': {
                'accuracy': 0.87,
                'precision': 0.82,
                'recall': 0.79,
                'f1_score': 0.80,
                'auc_roc': 0.91,
                'confusion_matrix': {
                    'true_positives': 1580,
                    'true_negatives': 19200,
                    'false_positives': 420,
                    'false_negatives': 800
                }
            },
            'feature_importance': {
                'days_since_last_login': 0.18,
                'support_tickets_count': 0.15,
                'usage_frequency': 0.14,
                'tenure_months': 0.12,
                'payment_failures': 0.11,
                'feature_adoption': 0.10,
                'session_duration_avg': 0.08,
                'plan_tier': 0.07,
                'referral_status': 0.05
            } if options.get('include_feature_importance') else {},
            'segment_analysis': {
                'enterprise': {
                    'total': 2500,
                    'high_risk': 180,
                    'churn_rate': 0.07
                },
                'smb': {
                    'total': 12500,
                    'high_risk': 1500,
                    'churn_rate': 0.12
                },
                'individual': {
                    'total': 10000,
                    'high_risk': 1320,
                    'churn_rate': 0.13
                }
            } if options.get('segment_predictions') else {},
            'churn_factors': {
                'primary_indicators': [
                    'Decreased login frequency (>7 days inactive)',
                    'Multiple support tickets in last 30 days',
                    'Payment failures or billing issues',
                    'Low feature adoption (<3 features used)',
                    'Reduced session duration (-50% vs baseline)'
                ],
                'secondary_indicators': [
                    'Plan downgrade consideration',
                    'No referrals made',
                    'Email engagement declining',
                    'Mobile app not installed'
                ]
            },
            'insights': [
                f'{high_risk} customers ({round((high_risk / total_customers) * 100, 1)}%) at high risk of churning',
                'Days since last login is strongest churn predictor',
                'Support ticket volume correlates with 3x higher churn risk',
                'Customers using <3 features are 4x more likely to churn',
                'Payment failures increase churn probability by 65%'
            ],
            'recommendations': [
                {
                    'customer_segment': 'High Risk (2500+)',
                    'action': 'personal_outreach',
                    'priority': 'critical',
                    'description': 'Immediate personal outreach from account manager',
                    'estimated_impact': 'Reduce churn by 40% in this segment'
                },
                {
                    'customer_segment': 'Inactive Users (7+ days)',
                    'action': 'reengagement_campaign',
                    'priority': 'high',
                    'description': 'Automated email with personalized value proposition',
                    'estimated_impact': 'Recover 25% of inactive users'
                },
                {
                    'customer_segment': 'Low Feature Adoption',
                    'action': 'onboarding_campaign',
                    'priority': 'high',
                    'description': 'Targeted feature education and tutorials',
                    'estimated_impact': 'Increase retention by 30%'
                },
                {
                    'customer_segment': 'Payment Issues',
                    'action': 'billing_support',
                    'priority': 'critical',
                    'description': 'Proactive billing support and payment plan options',
                    'estimated_impact': 'Recover 60% of payment-related churn'
                }
            ] if options.get('include_recommendations') else [],
            'intervention_opportunities': {
                'total_at_risk_customers': high_risk + medium_risk,
                'estimated_churn_without_action': int((high_risk + medium_risk) * 0.65),
                'estimated_churn_with_intervention': int((high_risk + medium_risk) * 0.25),
                'potential_customers_saved': int((high_risk + medium_risk) * 0.40),
                'estimated_revenue_impact': int((high_risk + medium_risk) * 0.40 * 1850)
            },
            'model_metadata': {
                'training_date': '2025-11-10',
                'training_samples': 50000,
                'features_used': len(features) or 15,
                'model_version': '2.3.1',
                'next_retrain_recommended': '2025-12-10'
            }
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate churn prediction parameters."""
        if 'data_source' not in params:
            self.logger.error("Missing required field: data_source")
            return False

        valid_models = ['logistic_regression', 'random_forest', 'xgboost', 'neural_network', 'auto']
        model = params.get('model', 'auto')

        if model not in valid_models:
            self.logger.error(f"Invalid model: {model}")
            return False

        return True

    def _generate_churn_predictions(self, count: int) -> List[Dict[str, Any]]:
        """Generate mock churn predictions."""
        predictions = []
        risk_levels = ['high', 'high', 'medium', 'medium', 'low', 'low', 'low']

        for i in range(count):
            risk = risk_levels[i % len(risk_levels)]
            churn_prob = 0.85 if risk == 'high' else 0.45 if risk == 'medium' else 0.15

            predictions.append({
                'customer_id': f'CUST_{10000 + i}',
                'churn_probability': round(churn_prob + (i % 10) * 0.01, 3),
                'risk_level': risk,
                'top_risk_factors': [
                    'Inactive 12+ days',
                    '3 support tickets',
                    'Low feature usage'
                ] if risk == 'high' else ['Decreased activity'],
                'recommended_action': 'immediate_outreach' if risk == 'high' else 'automated_campaign',
                'customer_value': 1850 + (i * 50),
                'tenure_days': 180 + (i * 10)
            })

        return sorted(predictions, key=lambda x: x['churn_probability'], reverse=True)
