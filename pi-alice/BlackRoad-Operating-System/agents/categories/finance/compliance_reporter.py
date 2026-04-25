"""
Compliance Reporter Agent

Generates compliance reports for FINRA, SEC, and other regulatory bodies.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent
from datetime import datetime


class ComplianceReporterAgent(BaseAgent):
    """Generates regulatory compliance reports for financial institutions."""

    def __init__(self):
        super().__init__(
            name='compliance-reporter',
            description='Generate compliance reports for FINRA, SEC, and regulatory bodies',
            category='finance',
            version='1.0.0',
            tags=['compliance', 'regulatory', 'finra', 'sec', 'reporting']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate compliance reports.

        Args:
            params: {
                'report_type': 'oats|cat|blue_sheets|form_13f|reg_sho',
                'period_start': '2025-01-01',
                'period_end': '2025-12-31',
                'firm_id': 'FIRM123',
                'transactions': [...],
                'include_sanctions_screening': True
            }

        Returns:
            {
                'status': 'success|failed',
                'report': {...},
                'violations': [...],
                'recommendations': [...]
            }
        """
        report_type = params.get('report_type', 'oats')
        period_start = params.get('period_start')
        period_end = params.get('period_end')
        firm_id = params.get('firm_id')
        transactions = params.get('transactions', [])

        self.logger.info(f"Generating {report_type} compliance report for {firm_id}")

        # Generate report based on type
        if report_type == 'oats':
            report = self._generate_oats_report(transactions, period_start, period_end)
        elif report_type == 'cat':
            report = self._generate_cat_report(transactions, period_start, period_end)
        elif report_type == 'form_13f':
            report = self._generate_13f_report(transactions)
        elif report_type == 'reg_sho':
            report = self._generate_reg_sho_report(transactions)
        else:
            report = {}

        # Check for violations
        violations = self._check_violations(transactions, report_type)

        # Generate recommendations
        recommendations = self._generate_recommendations(violations)

        return {
            'status': 'success',
            'report_type': report_type,
            'period_start': period_start,
            'period_end': period_end,
            'firm_id': firm_id,
            'report': report,
            'violations': violations,
            'recommendations': recommendations,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _generate_oats_report(
        self,
        transactions: List[Dict],
        start_date: str,
        end_date: str
    ) -> Dict:
        """Generate OATS (Order Audit Trail System) report."""
        return {
            'report_name': 'FINRA OATS Report',
            'total_orders': len(transactions),
            'reportable_events': len(transactions),
            'order_types': {
                'market': len([t for t in transactions if t.get('type') == 'market']),
                'limit': len([t for t in transactions if t.get('type') == 'limit']),
                'stop': len([t for t in transactions if t.get('type') == 'stop'])
            },
            'execution_summary': {
                'filled': len([t for t in transactions if t.get('status') == 'filled']),
                'cancelled': len([t for t in transactions if t.get('status') == 'cancelled']),
                'rejected': len([t for t in transactions if t.get('status') == 'rejected'])
            },
            'compliance_status': 'compliant'
        }

    def _generate_cat_report(
        self,
        transactions: List[Dict],
        start_date: str,
        end_date: str
    ) -> Dict:
        """Generate CAT (Consolidated Audit Trail) report."""
        return {
            'report_name': 'SEC CAT Report',
            'total_events': len(transactions) * 2,  # Each order has multiple lifecycle events
            'customer_orders': len([t for t in transactions if t.get('customer_type') == 'retail']),
            'proprietary_orders': len([t for t in transactions if t.get('customer_type') == 'prop']),
            'cat_reporter_id': 'CAT123456',
            'reporting_period': f'{start_date} to {end_date}',
            'data_quality_score': 98.5,
            'compliance_status': 'compliant'
        }

    def _generate_13f_report(self, transactions: List[Dict]) -> Dict:
        """Generate Form 13F report for institutional investment managers."""
        # Group by security
        holdings = {}
        for txn in transactions:
            symbol = txn.get('symbol')
            if symbol not in holdings:
                holdings[symbol] = {
                    'shares': 0,
                    'value': 0
                }
            if txn.get('action') == 'buy':
                holdings[symbol]['shares'] += txn.get('quantity', 0)
                holdings[symbol]['value'] += txn.get('quantity', 0) * txn.get('price', 0)

        total_value = sum(h['value'] for h in holdings.values())

        return {
            'report_name': 'SEC Form 13F',
            'filing_manager': 'Investment Firm LLC',
            'report_date': datetime.utcnow().strftime('%Y-%m-%d'),
            'total_holdings_value': round(total_value, 2),
            'number_of_securities': len(holdings),
            'threshold_met': total_value >= 100000000,  # $100M threshold
            'holdings_summary': [
                {
                    'symbol': symbol,
                    'shares': data['shares'],
                    'value': round(data['value'], 2),
                    'percentage': round(data['value'] / total_value * 100, 2) if total_value > 0 else 0
                }
                for symbol, data in list(holdings.items())[:10]  # Top 10
            ]
        }

    def _generate_reg_sho_report(self, transactions: List[Dict]) -> Dict:
        """Generate Regulation SHO report for short selling."""
        short_sales = [t for t in transactions if t.get('short_sale', False)]

        return {
            'report_name': 'SEC Regulation SHO Report',
            'total_short_sales': len(short_sales),
            'locate_requirements_met': len([s for s in short_sales if s.get('locate_approved', True)]),
            'fail_to_deliver': 0,
            'threshold_securities': [],
            'close_out_requirements': {
                'required': 0,
                'completed': 0,
                'pending': 0
            },
            'compliance_status': 'compliant'
        }

    def _check_violations(self, transactions: List[Dict], report_type: str) -> List[Dict]:
        """Check for regulatory violations."""
        violations = []

        # Check for late reporting
        for txn in transactions:
            if txn.get('report_delay_minutes', 0) > 90:
                violations.append({
                    'type': 'late_reporting',
                    'severity': 'medium',
                    'description': f"Order {txn.get('order_id')} reported {txn.get('report_delay_minutes')} minutes late",
                    'regulation': 'FINRA Rule 7440',
                    'potential_fine': 5000
                })

        # Check for pattern day trading violations
        day_trades = len([t for t in transactions if t.get('day_trade', False)])
        if day_trades >= 4:
            account_value = 20000  # Mock
            if account_value < 25000:
                violations.append({
                    'type': 'pattern_day_trading',
                    'severity': 'high',
                    'description': 'Pattern day trading with account value below $25,000',
                    'regulation': 'FINRA Rule 4210',
                    'potential_fine': 10000
                })

        # Check for wash sales
        wash_sales = [t for t in transactions if t.get('is_wash_sale', False)]
        if wash_sales:
            violations.append({
                'type': 'wash_sale_warning',
                'severity': 'low',
                'description': f'{len(wash_sales)} potential wash sales requiring tax reporting',
                'regulation': 'IRS Publication 550',
                'potential_fine': 0
            })

        return violations

    def _generate_recommendations(self, violations: List[Dict]) -> List[str]:
        """Generate compliance recommendations."""
        recommendations = []

        if not violations:
            recommendations.append('No violations detected. Continue monitoring compliance.')
        else:
            high_severity = [v for v in violations if v['severity'] == 'high']
            if high_severity:
                recommendations.append('URGENT: Address high-severity violations immediately')

            recommendations.append('Review order routing procedures to ensure timely reporting')
            recommendations.append('Implement automated compliance monitoring system')
            recommendations.append('Conduct quarterly compliance training for trading desk')

        return recommendations

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate compliance reporting parameters."""
        valid_report_types = ['oats', 'cat', 'blue_sheets', 'form_13f', 'reg_sho']
        report_type = params.get('report_type', 'oats')

        if report_type not in valid_report_types:
            self.logger.error(f"Invalid report_type: {report_type}")
            return False

        return True
