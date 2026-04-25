"""
Portfolio Manager Agent

Manages investment portfolios with rebalancing, diversification,
and performance tracking capabilities.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent
from datetime import datetime


class PortfolioManagerAgent(BaseAgent):
    """Manages investment portfolios with asset allocation and rebalancing."""

    def __init__(self):
        super().__init__(
            name='portfolio-manager',
            description='Manage investment portfolios with asset allocation and rebalancing',
            category='finance',
            version='1.0.0',
            tags=['portfolio', 'investment', 'asset-allocation', 'rebalancing']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute portfolio management operations.

        Args:
            params: {
                'action': 'analyze|rebalance|optimize|report',
                'portfolio': {
                    'holdings': [{'symbol': 'AAPL', 'shares': 100, 'cost_basis': 150.00}],
                    'cash': 10000.00
                },
                'target_allocation': {'stocks': 60, 'bonds': 30, 'cash': 10},
                'risk_tolerance': 'conservative|moderate|aggressive'
            }

        Returns:
            {
                'status': 'success|failed',
                'current_allocation': {...},
                'recommendations': [...],
                'performance': {...},
                'rebalance_trades': [...]
            }
        """
        action = params.get('action', 'analyze')
        portfolio = params.get('portfolio', {})
        target_allocation = params.get('target_allocation', {})
        risk_tolerance = params.get('risk_tolerance', 'moderate')

        self.logger.info(f"Portfolio {action} for risk tolerance: {risk_tolerance}")

        holdings = portfolio.get('holdings', [])
        cash = portfolio.get('cash', 0.0)

        # Calculate total portfolio value
        total_value = cash
        for holding in holdings:
            shares = holding.get('shares', 0)
            current_price = holding.get('current_price', holding.get('cost_basis', 0))
            total_value += shares * current_price

        # Calculate current allocation
        current_allocation = self._calculate_allocation(holdings, cash, total_value)

        # Generate recommendations based on action
        recommendations = []
        rebalance_trades = []

        if action == 'rebalance' and target_allocation:
            rebalance_trades = self._generate_rebalance_trades(
                holdings, cash, total_value, target_allocation
            )
            recommendations.append({
                'type': 'rebalance',
                'description': f'Execute {len(rebalance_trades)} trades to rebalance portfolio',
                'priority': 'high'
            })

        # Calculate performance metrics
        performance = self._calculate_performance(holdings, total_value)

        return {
            'status': 'success',
            'action': action,
            'portfolio_value': round(total_value, 2),
            'current_allocation': current_allocation,
            'target_allocation': target_allocation,
            'recommendations': recommendations,
            'rebalance_trades': rebalance_trades,
            'performance': performance,
            'risk_tolerance': risk_tolerance,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _calculate_allocation(self, holdings: List[Dict], cash: float, total_value: float) -> Dict[str, float]:
        """Calculate current asset allocation percentages."""
        if total_value == 0:
            return {'cash': 100.0}

        allocation = {
            'stocks': 0.0,
            'bonds': 0.0,
            'cash': round((cash / total_value) * 100, 2)
        }

        for holding in holdings:
            asset_type = holding.get('type', 'stocks')
            shares = holding.get('shares', 0)
            current_price = holding.get('current_price', holding.get('cost_basis', 0))
            value = shares * current_price
            percentage = (value / total_value) * 100

            if asset_type in allocation:
                allocation[asset_type] += percentage
            else:
                allocation[asset_type] = percentage

        # Round all values
        return {k: round(v, 2) for k, v in allocation.items()}

    def _generate_rebalance_trades(
        self,
        holdings: List[Dict],
        cash: float,
        total_value: float,
        target: Dict[str, float]
    ) -> List[Dict]:
        """Generate trades needed to rebalance portfolio."""
        trades = []

        # Simple example: if stocks are over-allocated, suggest selling
        current = self._calculate_allocation(holdings, cash, total_value)

        for asset_type, target_pct in target.items():
            current_pct = current.get(asset_type, 0.0)
            difference = target_pct - current_pct

            if abs(difference) > 5.0:  # Only rebalance if >5% difference
                target_value = (target_pct / 100) * total_value
                current_value = (current_pct / 100) * total_value
                trade_value = target_value - current_value

                trades.append({
                    'asset_type': asset_type,
                    'action': 'buy' if trade_value > 0 else 'sell',
                    'amount': abs(round(trade_value, 2)),
                    'reason': f'Rebalance {asset_type} from {current_pct:.1f}% to {target_pct:.1f}%'
                })

        return trades

    def _calculate_performance(self, holdings: List[Dict], total_value: float) -> Dict[str, Any]:
        """Calculate portfolio performance metrics."""
        total_cost = 0.0
        total_current = 0.0

        for holding in holdings:
            shares = holding.get('shares', 0)
            cost_basis = holding.get('cost_basis', 0)
            current_price = holding.get('current_price', cost_basis)

            total_cost += shares * cost_basis
            total_current += shares * current_price

        gain_loss = total_current - total_cost
        gain_loss_pct = (gain_loss / total_cost * 100) if total_cost > 0 else 0.0

        return {
            'total_cost_basis': round(total_cost, 2),
            'total_market_value': round(total_current, 2),
            'unrealized_gain_loss': round(gain_loss, 2),
            'unrealized_gain_loss_pct': round(gain_loss_pct, 2),
            'total_return_pct': round(gain_loss_pct, 2)
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate portfolio management parameters."""
        valid_actions = ['analyze', 'rebalance', 'optimize', 'report']
        action = params.get('action', 'analyze')

        if action not in valid_actions:
            self.logger.error(f"Invalid action: {action}")
            return False

        if 'portfolio' not in params:
            self.logger.error("Missing required field: portfolio")
            return False

        return True
