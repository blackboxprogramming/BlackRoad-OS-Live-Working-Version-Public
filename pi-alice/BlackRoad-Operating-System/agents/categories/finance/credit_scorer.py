"""
Credit Scorer Agent

Scores credit risk using FICO-like algorithms and alternative data.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent
from datetime import datetime


class CreditScorerAgent(BaseAgent):
    """Scores credit risk using traditional and alternative data sources."""

    def __init__(self):
        super().__init__(
            name='credit-scorer',
            description='Score credit risk using FICO-like algorithms and alternative data',
            category='finance',
            version='1.0.0',
            tags=['credit', 'risk', 'scoring', 'underwriting', 'fico']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate credit score.

        Args:
            params: {
                'applicant_data': {
                    'payment_history': {...},
                    'credit_utilization': 0.30,
                    'credit_history_months': 120,
                    'new_credit_inquiries': 2,
                    'credit_mix': ['mortgage', 'auto', 'credit_card'],
                    'total_debt': 50000,
                    'annual_income': 75000
                },
                'use_alternative_data': True
            }

        Returns:
            {
                'status': 'success|failed',
                'credit_score': int,
                'score_breakdown': {...},
                'risk_tier': str
            }
        """
        applicant_data = params.get('applicant_data', {})
        use_alternative = params.get('use_alternative_data', False)

        self.logger.info("Calculating credit score")

        # Calculate FICO-like score
        score_components = {
            'payment_history': self._score_payment_history(applicant_data),
            'amounts_owed': self._score_amounts_owed(applicant_data),
            'credit_history': self._score_credit_history(applicant_data),
            'new_credit': self._score_new_credit(applicant_data),
            'credit_mix': self._score_credit_mix(applicant_data)
        }

        # Apply FICO weights
        weighted_score = (
            score_components['payment_history'] * 0.35 +
            score_components['amounts_owed'] * 0.30 +
            score_components['credit_history'] * 0.15 +
            score_components['new_credit'] * 0.10 +
            score_components['credit_mix'] * 0.10
        )

        # Alternative data boost
        if use_alternative:
            alt_score = self._calculate_alternative_score(applicant_data)
            weighted_score = (weighted_score * 0.85) + (alt_score * 0.15)

        # Scale to 300-850 range
        credit_score = int(300 + (weighted_score / 100 * 550))
        credit_score = max(300, min(850, credit_score))

        # Determine risk tier
        risk_tier = self._get_risk_tier(credit_score)

        # Generate recommendations
        recommendations = self._generate_recommendations(score_components, credit_score)

        return {
            'status': 'success',
            'credit_score': credit_score,
            'score_breakdown': score_components,
            'risk_tier': risk_tier,
            'score_factors': self._get_score_factors(score_components),
            'recommendations': recommendations,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _score_payment_history(self, data: Dict) -> float:
        """Score payment history (35% of FICO)."""
        payment_history = data.get('payment_history', {})
        on_time_pct = payment_history.get('on_time_percentage', 100)
        late_payments = payment_history.get('late_payments_count', 0)
        delinquencies = payment_history.get('delinquencies', 0)

        score = 100.0

        # Deduct for late payments
        score -= late_payments * 5
        score -= delinquencies * 15

        # Reward high on-time percentage
        score = score * (on_time_pct / 100)

        return max(0, min(100, score))

    def _score_amounts_owed(self, data: Dict) -> float:
        """Score amounts owed / credit utilization (30% of FICO)."""
        utilization = data.get('credit_utilization', 0.0)

        # Optimal utilization is 10-30%
        if utilization <= 0.10:
            score = 100
        elif utilization <= 0.30:
            score = 95
        elif utilization <= 0.50:
            score = 75
        elif utilization <= 0.75:
            score = 50
        else:
            score = 25

        return score

    def _score_credit_history(self, data: Dict) -> float:
        """Score length of credit history (15% of FICO)."""
        months = data.get('credit_history_months', 0)

        if months >= 120:  # 10+ years
            return 100
        elif months >= 84:  # 7+ years
            return 90
        elif months >= 60:  # 5+ years
            return 80
        elif months >= 36:  # 3+ years
            return 70
        elif months >= 24:  # 2+ years
            return 60
        else:
            return 40

    def _score_new_credit(self, data: Dict) -> float:
        """Score new credit inquiries (10% of FICO)."""
        inquiries = data.get('new_credit_inquiries', 0)

        if inquiries == 0:
            return 100
        elif inquiries <= 2:
            return 90
        elif inquiries <= 4:
            return 70
        elif inquiries <= 6:
            return 50
        else:
            return 30

    def _score_credit_mix(self, data: Dict) -> float:
        """Score credit mix diversity (10% of FICO)."""
        credit_types = data.get('credit_mix', [])
        num_types = len(set(credit_types))

        if num_types >= 4:
            return 100
        elif num_types == 3:
            return 90
        elif num_types == 2:
            return 75
        elif num_types == 1:
            return 60
        else:
            return 40

    def _calculate_alternative_score(self, data: Dict) -> float:
        """Calculate score using alternative data."""
        score = 50.0  # Base score

        # Income stability
        income = data.get('annual_income', 0)
        if income > 100000:
            score += 20
        elif income > 75000:
            score += 15
        elif income > 50000:
            score += 10

        # Debt-to-income ratio
        total_debt = data.get('total_debt', 0)
        dti = total_debt / income if income > 0 else 999
        if dti < 0.20:
            score += 20
        elif dti < 0.36:
            score += 15
        elif dti < 0.43:
            score += 10

        # Other positive factors
        if data.get('employment_verified', False):
            score += 5
        if data.get('rent_payments_on_time', False):
            score += 5

        return min(100, score)

    def _get_risk_tier(self, score: int) -> str:
        """Get risk tier from credit score."""
        if score >= 800:
            return 'exceptional'
        elif score >= 740:
            return 'very_good'
        elif score >= 670:
            return 'good'
        elif score >= 580:
            return 'fair'
        else:
            return 'poor'

    def _get_score_factors(self, components: Dict) -> List[str]:
        """Get top factors affecting score."""
        sorted_components = sorted(
            components.items(),
            key=lambda x: x[1]
        )

        factors = []
        for name, score in sorted_components[:3]:
            if score < 70:
                factor_name = name.replace('_', ' ').title()
                factors.append(f'{factor_name} ({score:.0f}/100)')

        return factors if factors else ['Excellent credit profile']

    def _generate_recommendations(self, components: Dict, score: int) -> List[str]:
        """Generate credit improvement recommendations."""
        recommendations = []

        if components['payment_history'] < 90:
            recommendations.append('Make all payments on time to improve payment history')

        if components['amounts_owed'] < 75:
            recommendations.append('Reduce credit utilization below 30%')

        if components['credit_history'] < 80:
            recommendations.append('Keep old credit accounts open to extend credit history')

        if components['new_credit'] < 80:
            recommendations.append('Limit new credit inquiries to maintain score')

        if components['credit_mix'] < 75:
            recommendations.append('Consider diversifying credit types responsibly')

        if not recommendations:
            recommendations.append('Maintain excellent credit habits')

        return recommendations

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate credit scoring parameters."""
        if 'applicant_data' not in params:
            self.logger.error("Missing required field: applicant_data")
            return False

        return True
