"""
AUM Calculator Agent

Calculates assets under management with performance tracking
and fee calculations.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent
from datetime import datetime, timedelta


class AUMCalculatorAgent(BaseAgent):
    """Calculates assets under management for investment firms."""

    def __init__(self):
        super().__init__(
            name='aum-calculator',
            description='Calculate assets under management with performance and fees',
            category='finance',
            version='1.0.0',
            tags=['aum', 'assets', 'management', 'fees', 'performance']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate AUM.

        Args:
            params: {
                'accounts': [
                    {
                        'account_id': 'ACC001',
                        'account_type': 'individual|institutional|retirement',
                        'market_value': 1000000.00,
                        'cash': 50000.00,
                        'beginning_value': 900000.00
                    }
                ],
                'fee_structure': {
                    'management_fee': 0.01,  # 1%
                    'performance_fee': 0.20,  # 20%
                    'hurdle_rate': 0.08  # 8%
                },
                'period_start': '2024-01-01',
                'period_end': '2024-12-31'
            }

        Returns:
            {
                'status': 'success|failed',
                'total_aum': float,
                'performance': {...},
                'fees': {...},
                'breakdown': {...}
            }
        """
        accounts = params.get('accounts', [])
        fee_structure = params.get('fee_structure', {})
        period_start = params.get('period_start')
        period_end = params.get('period_end')

        self.logger.info(f"Calculating AUM for {len(accounts)} accounts")

        # Calculate total AUM
        aum_metrics = self._calculate_total_aum(accounts)

        # Calculate performance metrics
        performance = self._calculate_performance(accounts)

        # Calculate fees
        fees = self._calculate_fees(accounts, fee_structure, performance)

        # Get AUM breakdown
        breakdown = self._get_aum_breakdown(accounts)

        # Calculate flows
        flows = self._calculate_flows(accounts)

        return {
            'status': 'success',
            'calculation_period': {
                'start': period_start,
                'end': period_end
            },
            'total_aum': aum_metrics,
            'performance': performance,
            'fees': fees,
            'breakdown': breakdown,
            'flows': flows,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _calculate_total_aum(self, accounts: List[Dict]) -> Dict:
        """Calculate total assets under management."""
        total_market_value = 0.0
        total_cash = 0.0
        total_accounts = len(accounts)

        for account in accounts:
            total_market_value += account.get('market_value', 0)
            total_cash += account.get('cash', 0)

        total_aum = total_market_value + total_cash

        # Calculate average account size
        avg_account_size = total_aum / total_accounts if total_accounts > 0 else 0

        return {
            'total_aum': round(total_aum, 2),
            'total_market_value': round(total_market_value, 2),
            'total_cash': round(total_cash, 2),
            'cash_percentage': round((total_cash / total_aum * 100) if total_aum > 0 else 0, 2),
            'total_accounts': total_accounts,
            'average_account_size': round(avg_account_size, 2)
        }

    def _calculate_performance(self, accounts: List[Dict]) -> Dict:
        """Calculate performance metrics."""
        total_beginning_value = 0.0
        total_ending_value = 0.0
        total_deposits = 0.0
        total_withdrawals = 0.0

        for account in accounts:
            beginning = account.get('beginning_value', 0)
            ending = account.get('market_value', 0) + account.get('cash', 0)
            deposits = account.get('deposits', 0)
            withdrawals = account.get('withdrawals', 0)

            total_beginning_value += beginning
            total_ending_value += ending
            total_deposits += deposits
            total_withdrawals += withdrawals

        # Calculate time-weighted return
        twr = self._calculate_time_weighted_return(
            total_beginning_value,
            total_ending_value,
            total_deposits,
            total_withdrawals
        )

        # Calculate dollar-weighted return
        dwr = self._calculate_dollar_weighted_return(
            total_beginning_value,
            total_ending_value
        )

        # Calculate absolute gain
        absolute_gain = total_ending_value - total_beginning_value - total_deposits + total_withdrawals

        return {
            'time_weighted_return': round(twr, 4),
            'dollar_weighted_return': round(dwr, 4),
            'absolute_gain': round(absolute_gain, 2),
            'beginning_aum': round(total_beginning_value, 2),
            'ending_aum': round(total_ending_value, 2),
            'net_flows': round(total_deposits - total_withdrawals, 2)
        }

    def _calculate_time_weighted_return(
        self,
        beginning: float,
        ending: float,
        deposits: float,
        withdrawals: float
    ) -> float:
        """Calculate time-weighted return (TWR)."""
        # Simplified TWR calculation
        adjusted_beginning = beginning + deposits - withdrawals
        if adjusted_beginning > 0:
            return ((ending - adjusted_beginning) / adjusted_beginning) * 100
        return 0.0

    def _calculate_dollar_weighted_return(
        self,
        beginning: float,
        ending: float
    ) -> float:
        """Calculate dollar-weighted return (DWR)."""
        # Simplified DWR calculation
        if beginning > 0:
            return ((ending - beginning) / beginning) * 100
        return 0.0

    def _calculate_fees(
        self,
        accounts: List[Dict],
        fee_structure: Dict,
        performance: Dict
    ) -> Dict:
        """Calculate management and performance fees."""
        total_aum = sum(a.get('market_value', 0) + a.get('cash', 0) for a in accounts)

        # Management fee (typically annual, based on AUM)
        mgmt_fee_rate = fee_structure.get('management_fee', 0.01)
        annual_mgmt_fee = total_aum * mgmt_fee_rate

        # Performance fee (based on returns above hurdle)
        perf_fee_rate = fee_structure.get('performance_fee', 0.20)
        hurdle_rate = fee_structure.get('hurdle_rate', 0.08)

        twr = performance.get('time_weighted_return', 0) / 100
        excess_return = max(0, twr - hurdle_rate)
        absolute_gain = performance.get('absolute_gain', 0)

        # Performance fee only on returns above hurdle
        performance_fee = max(0, absolute_gain * (excess_return / max(twr, 0.01)) * perf_fee_rate)

        total_fees = annual_mgmt_fee + performance_fee

        return {
            'management_fee': round(annual_mgmt_fee, 2),
            'performance_fee': round(performance_fee, 2),
            'total_fees': round(total_fees, 2),
            'fee_rate_bps': round((total_fees / total_aum * 10000) if total_aum > 0 else 0, 2),
            'management_fee_rate': mgmt_fee_rate,
            'performance_fee_rate': perf_fee_rate,
            'hurdle_rate': hurdle_rate
        }

    def _get_aum_breakdown(self, accounts: List[Dict]) -> Dict:
        """Get AUM breakdown by account type."""
        breakdown = {
            'individual': {'count': 0, 'aum': 0.0},
            'institutional': {'count': 0, 'aum': 0.0},
            'retirement': {'count': 0, 'aum': 0.0}
        }

        for account in accounts:
            account_type = account.get('account_type', 'individual')
            aum = account.get('market_value', 0) + account.get('cash', 0)

            if account_type in breakdown:
                breakdown[account_type]['count'] += 1
                breakdown[account_type]['aum'] += aum

        # Add percentages
        total_aum = sum(b['aum'] for b in breakdown.values())

        for account_type in breakdown:
            aum = breakdown[account_type]['aum']
            breakdown[account_type]['aum'] = round(aum, 2)
            breakdown[account_type]['percentage'] = round(
                (aum / total_aum * 100) if total_aum > 0 else 0, 2
            )

        return breakdown

    def _calculate_flows(self, accounts: List[Dict]) -> Dict:
        """Calculate inflows and outflows."""
        total_inflows = sum(a.get('deposits', 0) for a in accounts)
        total_outflows = sum(a.get('withdrawals', 0) for a in accounts)
        net_flows = total_inflows - total_outflows

        # Calculate flow metrics
        total_beginning = sum(a.get('beginning_value', 0) for a in accounts)
        flow_rate = (net_flows / total_beginning * 100) if total_beginning > 0 else 0

        return {
            'total_inflows': round(total_inflows, 2),
            'total_outflows': round(total_outflows, 2),
            'net_flows': round(net_flows, 2),
            'flow_rate_pct': round(flow_rate, 2),
            'accounts_with_inflows': len([a for a in accounts if a.get('deposits', 0) > 0]),
            'accounts_with_outflows': len([a for a in accounts if a.get('withdrawals', 0) > 0])
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate AUM calculation parameters."""
        if 'accounts' not in params or not params['accounts']:
            self.logger.error("Missing required field: accounts")
            return False

        return True
