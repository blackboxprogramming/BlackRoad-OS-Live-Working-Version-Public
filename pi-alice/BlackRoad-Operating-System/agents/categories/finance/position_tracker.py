"""
Position Tracker Agent

Tracks trading positions, cost basis, and real-time P&L.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent
from datetime import datetime


class PositionTrackerAgent(BaseAgent):
    """Tracks trading positions with real-time updates and P&L calculation."""

    def __init__(self):
        super().__init__(
            name='position-tracker',
            description='Track trading positions with real-time P&L and cost basis',
            category='finance',
            version='1.0.0',
            tags=['positions', 'tracking', 'pnl', 'cost-basis']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Track positions.

        Args:
            params: {
                'action': 'list|update|close',
                'account_id': 'ACC123456',
                'positions': [{
                    'symbol': 'AAPL',
                    'quantity': 100,
                    'avg_cost': 150.00,
                    'current_price': 155.00
                }]
            }

        Returns:
            {
                'status': 'success|failed',
                'positions': [...],
                'summary': {...}
            }
        """
        action = params.get('action', 'list')
        positions = params.get('positions', [])
        account_id = params.get('account_id')

        self.logger.info(f"Tracking {len(positions)} positions for account {account_id}")

        # Process each position
        tracked_positions = []
        total_value = 0.0
        total_pnl = 0.0

        for pos in positions:
            tracked = self._track_position(pos)
            tracked_positions.append(tracked)
            total_value += tracked['market_value']
            total_pnl += tracked['unrealized_pnl']

        summary = {
            'total_positions': len(tracked_positions),
            'total_market_value': round(total_value, 2),
            'total_cost_basis': round(sum(p['cost_basis'] for p in tracked_positions), 2),
            'total_unrealized_pnl': round(total_pnl, 2),
            'total_unrealized_pnl_pct': round((total_pnl / total_value * 100) if total_value > 0 else 0, 2),
            'winners': len([p for p in tracked_positions if p['unrealized_pnl'] > 0]),
            'losers': len([p for p in tracked_positions if p['unrealized_pnl'] < 0])
        }

        return {
            'status': 'success',
            'action': action,
            'account_id': account_id,
            'positions': tracked_positions,
            'summary': summary,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _track_position(self, position: Dict) -> Dict:
        """Track a single position with P&L calculation."""
        symbol = position.get('symbol')
        quantity = position.get('quantity', 0)
        avg_cost = position.get('avg_cost', 0.0)
        current_price = position.get('current_price', avg_cost)

        cost_basis = quantity * avg_cost
        market_value = quantity * current_price
        unrealized_pnl = market_value - cost_basis
        unrealized_pnl_pct = (unrealized_pnl / cost_basis * 100) if cost_basis > 0 else 0

        return {
            'symbol': symbol,
            'quantity': quantity,
            'avg_cost': round(avg_cost, 2),
            'current_price': round(current_price, 2),
            'cost_basis': round(cost_basis, 2),
            'market_value': round(market_value, 2),
            'unrealized_pnl': round(unrealized_pnl, 2),
            'unrealized_pnl_pct': round(unrealized_pnl_pct, 2),
            'day_change': round((current_price - avg_cost), 2),
            'day_change_pct': round(((current_price - avg_cost) / avg_cost * 100) if avg_cost > 0 else 0, 2)
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate position tracking parameters."""
        if 'positions' not in params:
            self.logger.error("Missing required field: positions")
            return False

        return True
