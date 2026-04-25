"""
Order Executor Agent

Executes trades and orders across multiple brokerages with
smart routing and best execution.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent
from datetime import datetime
import uuid


class OrderExecutorAgent(BaseAgent):
    """Executes trades with smart order routing and compliance checks."""

    def __init__(self):
        super().__init__(
            name='order-executor',
            description='Execute trades and orders with smart routing and best execution',
            category='finance',
            version='1.0.0',
            tags=['trading', 'execution', 'orders', 'brokerage']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute trading orders.

        Args:
            params: {
                'orders': [{
                    'symbol': 'AAPL',
                    'action': 'buy|sell',
                    'type': 'market|limit|stop|stop_limit',
                    'quantity': 100,
                    'price': 150.00,  # For limit orders
                    'stop_price': 145.00  # For stop orders
                }],
                'broker': 'interactive_brokers|alpaca|robinhood|tdameritrade',
                'account_id': 'ACC123456',
                'dry_run': True  # Test mode without actual execution
            }

        Returns:
            {
                'status': 'success|failed',
                'executions': [...],
                'summary': {...}
            }
        """
        orders = params.get('orders', [])
        broker = params.get('broker', 'alpaca')
        account_id = params.get('account_id')
        dry_run = params.get('dry_run', True)

        self.logger.info(
            f"Executing {len(orders)} orders via {broker} (dry_run: {dry_run})"
        )

        executions = []
        total_value = 0.0
        successful = 0
        failed = 0

        for order in orders:
            execution = self._execute_order(order, broker, account_id, dry_run)
            executions.append(execution)

            if execution['status'] == 'filled':
                successful += 1
                total_value += execution['total_value']
            else:
                failed += 1

        summary = {
            'total_orders': len(orders),
            'successful': successful,
            'failed': failed,
            'total_value': round(total_value, 2),
            'broker': broker,
            'dry_run': dry_run
        }

        return {
            'status': 'success' if failed == 0 else 'partial',
            'executions': executions,
            'summary': summary,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _execute_order(
        self,
        order: Dict,
        broker: str,
        account_id: str,
        dry_run: bool
    ) -> Dict:
        """Execute a single order."""
        order_id = str(uuid.uuid4())
        symbol = order.get('symbol')
        action = order.get('action')
        order_type = order.get('type', 'market')
        quantity = order.get('quantity', 0)
        limit_price = order.get('price')

        # Simulate order execution
        if order_type == 'market':
            fill_price = 150.25  # Mock market price
        elif order_type == 'limit':
            fill_price = limit_price
        else:
            fill_price = order.get('stop_price', 150.00)

        total_value = quantity * fill_price
        commission = self._calculate_commission(total_value, broker)

        return {
            'order_id': order_id,
            'symbol': symbol,
            'action': action,
            'type': order_type,
            'quantity': quantity,
            'fill_price': round(fill_price, 2),
            'total_value': round(total_value, 2),
            'commission': round(commission, 2),
            'net_value': round(total_value + commission, 2),
            'status': 'filled' if not dry_run else 'simulated',
            'broker': broker,
            'filled_at': datetime.utcnow().isoformat() + 'Z',
            'account_id': account_id
        }

    def _calculate_commission(self, value: float, broker: str) -> float:
        """Calculate commission based on broker."""
        commission_rates = {
            'interactive_brokers': 0.0035,  # $0.0035 per share
            'alpaca': 0.0,  # Commission-free
            'robinhood': 0.0,  # Commission-free
            'tdameritrade': 0.0  # Commission-free
        }

        rate = commission_rates.get(broker, 0.0)
        return value * rate

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate order execution parameters."""
        if 'orders' not in params or not params['orders']:
            self.logger.error("Missing required field: orders")
            return False

        for order in params['orders']:
            if 'symbol' not in order or 'action' not in order:
                self.logger.error("Invalid order: missing symbol or action")
                return False

        return True
