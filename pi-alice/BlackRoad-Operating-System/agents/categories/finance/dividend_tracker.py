"""
Dividend Tracker Agent

Tracks dividend payments, ex-dividend dates, and dividend yield analysis.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent
from datetime import datetime, timedelta


class DividendTrackerAgent(BaseAgent):
    """Tracks dividend payments and analyzes dividend yield."""

    def __init__(self):
        super().__init__(
            name='dividend-tracker',
            description='Track dividend payments, ex-dividend dates, and yield analysis',
            category='finance',
            version='1.0.0',
            tags=['dividends', 'income', 'yield', 'distributions']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Track dividends.

        Args:
            params: {
                'action': 'track|forecast|analyze',
                'portfolio': [
                    {
                        'symbol': 'AAPL',
                        'shares': 100,
                        'cost_basis': 150.00,
                        'current_price': 175.00
                    }
                ],
                'include_projections': True
            }

        Returns:
            {
                'status': 'success|failed',
                'dividend_summary': {...},
                'upcoming_dividends': [...],
                'historical_dividends': [...]
            }
        """
        action = params.get('action', 'track')
        portfolio = params.get('portfolio', [])
        include_projections = params.get('include_projections', True)

        self.logger.info(f"Tracking dividends for {len(portfolio)} positions")

        # Get dividend data for each holding
        dividend_data = []
        for holding in portfolio:
            data = self._get_dividend_info(holding)
            dividend_data.append(data)

        # Calculate portfolio summary
        summary = self._calculate_dividend_summary(dividend_data, portfolio)

        # Get upcoming dividends
        upcoming = self._get_upcoming_dividends(dividend_data)

        # Get historical dividends
        historical = self._get_historical_dividends(dividend_data)

        # Project future dividends
        projections = None
        if include_projections:
            projections = self._project_dividends(dividend_data, portfolio)

        return {
            'status': 'success',
            'action': action,
            'portfolio_positions': len(portfolio),
            'dividend_summary': summary,
            'upcoming_dividends': upcoming,
            'historical_dividends': historical,
            'projections': projections,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _get_dividend_info(self, holding: Dict) -> Dict:
        """Get dividend information for a holding."""
        symbol = holding.get('symbol')

        # Mock dividend data
        dividend_info = {
            'AAPL': {
                'annual_dividend': 0.96,
                'dividend_frequency': 'quarterly',
                'next_ex_date': (datetime.utcnow() + timedelta(days=15)).strftime('%Y-%m-%d'),
                'next_pay_date': (datetime.utcnow() + timedelta(days=30)).strftime('%Y-%m-%d'),
                'next_amount': 0.24,
                'dividend_growth_rate': 0.08,
                'payout_ratio': 0.15
            },
            'MSFT': {
                'annual_dividend': 3.00,
                'dividend_frequency': 'quarterly',
                'next_ex_date': (datetime.utcnow() + timedelta(days=20)).strftime('%Y-%m-%d'),
                'next_pay_date': (datetime.utcnow() + timedelta(days=35)).strftime('%Y-%m-%d'),
                'next_amount': 0.75,
                'dividend_growth_rate': 0.10,
                'payout_ratio': 0.25
            }
        }

        default_info = {
            'annual_dividend': 0.0,
            'dividend_frequency': 'none',
            'next_ex_date': None,
            'next_pay_date': None,
            'next_amount': 0.0,
            'dividend_growth_rate': 0.0,
            'payout_ratio': 0.0
        }

        info = dividend_info.get(symbol, default_info)
        info['symbol'] = symbol
        return info

    def _calculate_dividend_summary(
        self,
        dividend_data: List[Dict],
        portfolio: List[Dict]
    ) -> Dict:
        """Calculate portfolio-wide dividend summary."""
        total_annual_income = 0.0
        total_portfolio_value = 0.0
        total_cost_basis = 0.0

        for i, data in enumerate(dividend_data):
            holding = portfolio[i]
            shares = holding.get('shares', 0)
            current_price = holding.get('current_price', 0)
            cost_basis = holding.get('cost_basis', 0)

            annual_dividend = data.get('annual_dividend', 0)
            annual_income = shares * annual_dividend

            total_annual_income += annual_income
            total_portfolio_value += shares * current_price
            total_cost_basis += shares * cost_basis

        # Calculate yields
        current_yield = (total_annual_income / total_portfolio_value * 100) if total_portfolio_value > 0 else 0
        yield_on_cost = (total_annual_income / total_cost_basis * 100) if total_cost_basis > 0 else 0

        # Calculate monthly income
        monthly_income = total_annual_income / 12

        return {
            'total_annual_income': round(total_annual_income, 2),
            'monthly_income': round(monthly_income, 2),
            'quarterly_income': round(total_annual_income / 4, 2),
            'portfolio_value': round(total_portfolio_value, 2),
            'current_yield_pct': round(current_yield, 3),
            'yield_on_cost_pct': round(yield_on_cost, 3),
            'dividend_paying_positions': len([d for d in dividend_data if d.get('annual_dividend', 0) > 0])
        }

    def _get_upcoming_dividends(self, dividend_data: List[Dict]) -> List[Dict]:
        """Get upcoming dividend payments."""
        upcoming = []

        for data in dividend_data:
            if data.get('next_ex_date'):
                upcoming.append({
                    'symbol': data['symbol'],
                    'ex_date': data['next_ex_date'],
                    'pay_date': data['next_pay_date'],
                    'amount': data['next_amount'],
                    'frequency': data['dividend_frequency']
                })

        # Sort by ex-date
        upcoming.sort(key=lambda x: x['ex_date'])

        return upcoming

    def _get_historical_dividends(self, dividend_data: List[Dict]) -> List[Dict]:
        """Get historical dividend payments."""
        historical = []

        for data in dividend_data:
            symbol = data['symbol']
            annual_div = data.get('annual_dividend', 0)

            if annual_div > 0:
                # Generate mock historical data
                for i in range(4):  # Last 4 quarters
                    payment_date = (datetime.utcnow() - timedelta(days=90 * i)).strftime('%Y-%m-%d')
                    historical.append({
                        'symbol': symbol,
                        'payment_date': payment_date,
                        'amount': round(annual_div / 4, 4),
                        'type': 'regular'
                    })

        # Sort by payment date (most recent first)
        historical.sort(key=lambda x: x['payment_date'], reverse=True)

        return historical[:20]  # Limit to 20 most recent

    def _project_dividends(
        self,
        dividend_data: List[Dict],
        portfolio: List[Dict]
    ) -> Dict:
        """Project future dividend income."""
        current_year = datetime.utcnow().year

        projections = {}

        for year in range(current_year, current_year + 5):
            year_income = 0.0

            for i, data in enumerate(dividend_data):
                holding = portfolio[i]
                shares = holding.get('shares', 0)
                annual_div = data.get('annual_dividend', 0)
                growth_rate = data.get('dividend_growth_rate', 0)

                # Project dividend with growth
                years_out = year - current_year
                projected_div = annual_div * ((1 + growth_rate) ** years_out)
                year_income += shares * projected_div

            projections[str(year)] = {
                'year': year,
                'projected_income': round(year_income, 2),
                'monthly_income': round(year_income / 12, 2)
            }

        return projections

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate dividend tracking parameters."""
        if 'portfolio' not in params:
            self.logger.error("Missing required field: portfolio")
            return False

        return True
