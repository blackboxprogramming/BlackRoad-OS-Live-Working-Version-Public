"""
Fraud Detector Agent

Detects fraudulent transactions using anomaly detection,
pattern recognition, and machine learning.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent
from datetime import datetime


class FraudDetectorAgent(BaseAgent):
    """Detects fraudulent transactions using advanced analytics."""

    def __init__(self):
        super().__init__(
            name='fraud-detector',
            description='Detect fraudulent transactions using anomaly detection and ML',
            category='finance',
            version='1.0.0',
            tags=['fraud', 'detection', 'security', 'anomaly', 'ml']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute fraud detection.

        Args:
            params: {
                'transactions': [{
                    'transaction_id': 'TXN123',
                    'amount': 5000.00,
                    'merchant': 'Online Store',
                    'location': 'US',
                    'timestamp': '2025-01-15T10:30:00Z',
                    'customer_id': 'CUST456'
                }],
                'customer_profile': {...},
                'detection_models': ['anomaly', 'rule_based', 'ml']
            }

        Returns:
            {
                'status': 'success|failed',
                'flagged_transactions': [...],
                'risk_score': float,
                'recommendations': [...]
            }
        """
        transactions = params.get('transactions', [])
        customer_profile = params.get('customer_profile', {})
        models = params.get('detection_models', ['anomaly', 'rule_based'])

        self.logger.info(f"Analyzing {len(transactions)} transactions for fraud")

        # Run detection models
        flagged = []
        for txn in transactions:
            fraud_signals = []

            if 'anomaly' in models:
                fraud_signals.extend(self._anomaly_detection(txn, customer_profile))

            if 'rule_based' in models:
                fraud_signals.extend(self._rule_based_detection(txn, customer_profile))

            if 'ml' in models:
                fraud_signals.extend(self._ml_detection(txn, customer_profile))

            if fraud_signals:
                flagged.append({
                    'transaction': txn,
                    'fraud_signals': fraud_signals,
                    'risk_score': self._calculate_risk_score(fraud_signals),
                    'recommended_action': self._get_recommended_action(fraud_signals)
                })

        # Calculate overall risk score
        overall_risk = self._calculate_overall_risk(flagged, transactions)

        # Generate recommendations
        recommendations = self._generate_recommendations(flagged)

        return {
            'status': 'success',
            'total_transactions': len(transactions),
            'flagged_count': len(flagged),
            'flagged_transactions': flagged,
            'overall_risk_score': round(overall_risk, 2),
            'recommendations': recommendations,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _anomaly_detection(self, txn: Dict, profile: Dict) -> List[Dict]:
        """Detect anomalies in transaction patterns."""
        signals = []

        # Check for unusual amount
        avg_transaction = profile.get('avg_transaction_amount', 100.0)
        amount = txn.get('amount', 0)

        if amount > avg_transaction * 5:
            signals.append({
                'type': 'unusual_amount',
                'severity': 'high',
                'description': f'Transaction amount ${amount} is 5x higher than average ${avg_transaction}',
                'confidence': 0.85
            })

        # Check for unusual location
        usual_locations = profile.get('usual_locations', ['US'])
        location = txn.get('location', 'US')

        if location not in usual_locations:
            signals.append({
                'type': 'unusual_location',
                'severity': 'medium',
                'description': f'Transaction from unusual location: {location}',
                'confidence': 0.70
            })

        # Check for unusual time
        hour = datetime.fromisoformat(txn.get('timestamp', '').replace('Z', '')).hour
        if hour < 6 or hour > 23:
            signals.append({
                'type': 'unusual_time',
                'severity': 'low',
                'description': f'Transaction at unusual hour: {hour}:00',
                'confidence': 0.60
            })

        return signals

    def _rule_based_detection(self, txn: Dict, profile: Dict) -> List[Dict]:
        """Apply rule-based fraud detection."""
        signals = []

        # Check for velocity (rapid transactions)
        recent_count = profile.get('transactions_last_hour', 0)
        if recent_count > 10:
            signals.append({
                'type': 'velocity_check',
                'severity': 'high',
                'description': f'{recent_count} transactions in last hour exceeds threshold',
                'confidence': 0.90
            })

        # Check for round amounts (often indicates testing)
        amount = txn.get('amount', 0)
        if amount > 1000 and amount % 1000 == 0:
            signals.append({
                'type': 'round_amount',
                'severity': 'low',
                'description': f'Round amount ${amount} may indicate testing or fraud',
                'confidence': 0.50
            })

        # Check for high-risk merchant categories
        merchant = txn.get('merchant', '').lower()
        high_risk_keywords = ['casino', 'crypto', 'forex', 'gambling']

        if any(keyword in merchant for keyword in high_risk_keywords):
            signals.append({
                'type': 'high_risk_merchant',
                'severity': 'medium',
                'description': f'Transaction with high-risk merchant: {merchant}',
                'confidence': 0.75
            })

        return signals

    def _ml_detection(self, txn: Dict, profile: Dict) -> List[Dict]:
        """Use machine learning models for fraud detection."""
        signals = []

        # Mock ML model prediction
        fraud_probability = 0.65  # Mock probability

        if fraud_probability > 0.8:
            signals.append({
                'type': 'ml_high_risk',
                'severity': 'high',
                'description': f'ML model predicts {fraud_probability*100:.1f}% fraud probability',
                'confidence': fraud_probability
            })
        elif fraud_probability > 0.6:
            signals.append({
                'type': 'ml_medium_risk',
                'severity': 'medium',
                'description': f'ML model indicates moderate fraud risk ({fraud_probability*100:.1f}%)',
                'confidence': fraud_probability
            })

        return signals

    def _calculate_risk_score(self, signals: List[Dict]) -> float:
        """Calculate risk score from fraud signals."""
        if not signals:
            return 0.0

        severity_weights = {
            'high': 1.0,
            'medium': 0.6,
            'low': 0.3
        }

        total_score = 0.0
        for signal in signals:
            weight = severity_weights.get(signal.get('severity', 'low'), 0.3)
            confidence = signal.get('confidence', 0.5)
            total_score += weight * confidence

        # Normalize to 0-100 scale
        max_score = len(signals)
        return min((total_score / max_score) * 100, 100) if max_score > 0 else 0

    def _get_recommended_action(self, signals: List[Dict]) -> str:
        """Get recommended action based on fraud signals."""
        high_severity = [s for s in signals if s.get('severity') == 'high']

        if len(high_severity) >= 2:
            return 'BLOCK_TRANSACTION'
        elif high_severity:
            return 'MANUAL_REVIEW'
        else:
            return 'MONITOR'

    def _calculate_overall_risk(self, flagged: List[Dict], all_txns: List[Dict]) -> float:
        """Calculate overall risk score."""
        if not all_txns:
            return 0.0

        flagged_pct = len(flagged) / len(all_txns) * 100
        avg_risk = sum(f['risk_score'] for f in flagged) / len(flagged) if flagged else 0

        return (flagged_pct + avg_risk) / 2

    def _generate_recommendations(self, flagged: List[Dict]) -> List[str]:
        """Generate fraud prevention recommendations."""
        recommendations = []

        if not flagged:
            recommendations.append('No fraudulent activity detected')
            return recommendations

        high_risk = [f for f in flagged if f['recommended_action'] == 'BLOCK_TRANSACTION']
        if high_risk:
            recommendations.append(f'URGENT: Block {len(high_risk)} high-risk transactions immediately')

        manual_review = [f for f in flagged if f['recommended_action'] == 'MANUAL_REVIEW']
        if manual_review:
            recommendations.append(f'Route {len(manual_review)} transactions to manual review queue')

        recommendations.append('Enable additional authentication for flagged customers')
        recommendations.append('Review and update fraud detection rules monthly')

        return recommendations

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate fraud detection parameters."""
        if 'transactions' not in params:
            self.logger.error("Missing required field: transactions")
            return False

        return True
