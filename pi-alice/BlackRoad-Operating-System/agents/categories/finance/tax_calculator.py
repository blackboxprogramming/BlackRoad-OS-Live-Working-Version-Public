"""
Tax Calculator Agent

Calculates taxes on trades with support for short-term/long-term
capital gains, wash sales, and Form 8949 reporting.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent
from datetime import datetime


class TaxCalculatorAgent(BaseAgent):
    """Calculates taxes on trades with IRS compliance."""

    def __init__(self):
        super().__init__(
            name='tax-calculator',
            description='Calculate taxes on trades with capital gains and wash sale rules',
            category='finance',
            version='1.0.0',
            tags=['tax', 'capital-gains', 'wash-sales', 'irs', 'form-8949']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate taxes.

        Args:
            params: {
                'tax_year': 2025,
                'filing_status': 'single|married_joint|married_separate|head_of_household',
                'realized_trades': [{
                    'symbol': 'AAPL',
                    'pnl': 1500.00,
                    'term': 'short|long',
                    'is_wash_sale': False
                }],
                'income': 75000.00
            }

        Returns:
            {
                'status': 'success|failed',
                'tax_liability': {...},
                'form_8949_data': {...}
            }
        """
        tax_year = params.get('tax_year', 2025)
        filing_status = params.get('filing_status', 'single')
        trades = params.get('realized_trades', [])
        income = params.get('income', 0.0)

        self.logger.info(f"Calculating taxes for {tax_year} ({filing_status})")

        # Separate short-term and long-term gains
        short_term = [t for t in trades if t.get('term') == 'short']
        long_term = [t for t in trades if t.get('term') == 'long']

        # Calculate tax liability
        tax_liability = self._calculate_tax_liability(
            short_term, long_term, filing_status, income
        )

        # Generate Form 8949 data
        form_8949 = self._generate_form_8949(short_term, long_term)

        # Calculate wash sale adjustments
        wash_sales = self._calculate_wash_sales(trades)

        return {
            'status': 'success',
            'tax_year': tax_year,
            'filing_status': filing_status,
            'tax_liability': tax_liability,
            'form_8949_data': form_8949,
            'wash_sales': wash_sales,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _calculate_tax_liability(
        self,
        short_term: List[Dict],
        long_term: List[Dict],
        filing_status: str,
        income: float
    ) -> Dict:
        """Calculate total tax liability."""
        # Calculate gains/losses
        short_term_gain = sum(t['pnl'] for t in short_term)
        long_term_gain = sum(t['pnl'] for t in long_term)

        # 2025 Tax brackets (mock - use actual IRS tables)
        ordinary_rate = self._get_ordinary_rate(income, filing_status)
        capital_gains_rate = self._get_capital_gains_rate(income, filing_status)

        # Calculate taxes
        short_term_tax = max(0, short_term_gain * ordinary_rate)
        long_term_tax = max(0, long_term_gain * capital_gains_rate)

        total_tax = short_term_tax + long_term_tax

        return {
            'short_term_gain': round(short_term_gain, 2),
            'long_term_gain': round(long_term_gain, 2),
            'total_gain': round(short_term_gain + long_term_gain, 2),
            'short_term_tax': round(short_term_tax, 2),
            'long_term_tax': round(long_term_tax, 2),
            'total_tax': round(total_tax, 2),
            'ordinary_rate': round(ordinary_rate * 100, 2),
            'capital_gains_rate': round(capital_gains_rate * 100, 2),
            'effective_rate': round((total_tax / (short_term_gain + long_term_gain) * 100) if (short_term_gain + long_term_gain) > 0 else 0, 2)
        }

    def _get_ordinary_rate(self, income: float, filing_status: str) -> float:
        """Get ordinary income tax rate."""
        # 2025 tax brackets (simplified)
        brackets = {
            'single': [
                (0, 11600, 0.10),
                (11600, 47150, 0.12),
                (47150, 100525, 0.22),
                (100525, 191950, 0.24),
                (191950, 243725, 0.32),
                (243725, 609350, 0.35),
                (609350, float('inf'), 0.37)
            ]
        }

        for min_income, max_income, rate in brackets.get(filing_status, brackets['single']):
            if min_income <= income < max_income:
                return rate

        return 0.37  # Top rate

    def _get_capital_gains_rate(self, income: float, filing_status: str) -> float:
        """Get long-term capital gains tax rate."""
        # 2025 capital gains brackets (simplified)
        if filing_status == 'single':
            if income <= 47025:
                return 0.0
            elif income <= 518900:
                return 0.15
            else:
                return 0.20
        else:
            if income <= 94050:
                return 0.0
            elif income <= 583750:
                return 0.15
            else:
                return 0.20

    def _generate_form_8949(self, short_term: List[Dict], long_term: List[Dict]) -> Dict:
        """Generate Form 8949 data."""
        return {
            'part_1_short_term': {
                'transactions': len(short_term),
                'total_proceeds': round(sum(t.get('proceeds', 0) for t in short_term), 2),
                'total_cost_basis': round(sum(t.get('cost_basis', 0) for t in short_term), 2),
                'total_gain_loss': round(sum(t['pnl'] for t in short_term), 2)
            },
            'part_2_long_term': {
                'transactions': len(long_term),
                'total_proceeds': round(sum(t.get('proceeds', 0) for t in long_term), 2),
                'total_cost_basis': round(sum(t.get('cost_basis', 0) for t in long_term), 2),
                'total_gain_loss': round(sum(t['pnl'] for t in long_term), 2)
            }
        }

    def _calculate_wash_sales(self, trades: List[Dict]) -> Dict:
        """Calculate wash sale adjustments."""
        wash_sale_trades = [t for t in trades if t.get('is_wash_sale', False)]

        total_disallowed = sum(abs(t['pnl']) for t in wash_sale_trades if t['pnl'] < 0)

        return {
            'wash_sale_count': len(wash_sale_trades),
            'disallowed_loss': round(total_disallowed, 2),
            'affected_symbols': list(set(t['symbol'] for t in wash_sale_trades))
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate tax calculation parameters."""
        valid_statuses = ['single', 'married_joint', 'married_separate', 'head_of_household']
        filing_status = params.get('filing_status', 'single')

        if filing_status not in valid_statuses:
            self.logger.error(f"Invalid filing_status: {filing_status}")
            return False

        return True
