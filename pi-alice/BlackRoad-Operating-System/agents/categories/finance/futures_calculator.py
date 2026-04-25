"""
Futures Calculator Agent

Calculates futures positions, margin requirements, and P&L.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent
from datetime import datetime


class FuturesCalculatorAgent(BaseAgent):
    """Calculates futures positions with margin and P&L tracking."""

    def __init__(self):
        super().__init__(
            name='futures-calculator',
            description='Calculate futures positions, margin requirements, and P&L',
            category='finance',
            version='1.0.0',
            tags=['futures', 'derivatives', 'margin', 'leverage']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate futures position metrics.

        Args:
            params: {
                'contract': 'ES|NQ|CL|GC',  # E-mini S&P, Nasdaq, Crude, Gold
                'action': 'calculate_margin|calculate_pnl|calculate_position',
                'position': {
                    'contracts': 5,
                    'entry_price': 4500.00,
                    'current_price': 4550.00,
                    'direction': 'long|short'
                },
                'account_balance': 50000.00
            }

        Returns:
            {
                'status': 'success|failed',
                'margin_requirements': {...},
                'position_value': {...},
                'pnl': {...}
            }
        """
        contract = params.get('contract', 'ES')
        action = params.get('action', 'calculate_position')
        position = params.get('position', {})
        account_balance = params.get('account_balance', 0.0)

        self.logger.info(f"Calculating {contract} futures {action}")

        # Get contract specifications
        specs = self._get_contract_specs(contract)

        # Calculate margin requirements
        margin_reqs = self._calculate_margin(position, specs, account_balance)

        # Calculate position value
        position_value = self._calculate_position_value(position, specs)

        # Calculate P&L
        pnl = self._calculate_pnl(position, specs)

        # Calculate leverage
        leverage = self._calculate_leverage(position_value, margin_reqs, account_balance)

        return {
            'status': 'success',
            'contract': contract,
            'contract_specs': specs,
            'margin_requirements': margin_reqs,
            'position_value': position_value,
            'pnl': pnl,
            'leverage': leverage,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _get_contract_specs(self, contract: str) -> Dict:
        """Get futures contract specifications."""
        specs = {
            'ES': {  # E-mini S&P 500
                'name': 'E-mini S&P 500',
                'symbol': 'ES',
                'tick_size': 0.25,
                'tick_value': 12.50,
                'contract_multiplier': 50,
                'initial_margin': 12000.00,
                'maintenance_margin': 11000.00,
                'exchange': 'CME'
            },
            'NQ': {  # E-mini Nasdaq-100
                'name': 'E-mini Nasdaq-100',
                'symbol': 'NQ',
                'tick_size': 0.25,
                'tick_value': 5.00,
                'contract_multiplier': 20,
                'initial_margin': 15000.00,
                'maintenance_margin': 14000.00,
                'exchange': 'CME'
            },
            'CL': {  # Crude Oil
                'name': 'Crude Oil',
                'symbol': 'CL',
                'tick_size': 0.01,
                'tick_value': 10.00,
                'contract_multiplier': 1000,
                'initial_margin': 6000.00,
                'maintenance_margin': 5500.00,
                'exchange': 'NYMEX'
            },
            'GC': {  # Gold
                'name': 'Gold',
                'symbol': 'GC',
                'tick_size': 0.10,
                'tick_value': 10.00,
                'contract_multiplier': 100,
                'initial_margin': 9000.00,
                'maintenance_margin': 8000.00,
                'exchange': 'COMEX'
            }
        }

        return specs.get(contract, specs['ES'])

    def _calculate_margin(
        self,
        position: Dict,
        specs: Dict,
        account_balance: float
    ) -> Dict:
        """Calculate margin requirements."""
        contracts = position.get('contracts', 0)

        initial_margin = specs['initial_margin'] * abs(contracts)
        maintenance_margin = specs['maintenance_margin'] * abs(contracts)

        # Calculate margin usage
        margin_usage_pct = (initial_margin / account_balance * 100) if account_balance > 0 else 0

        # Calculate available margin
        available_margin = max(0, account_balance - initial_margin)

        # Calculate margin call price
        direction = position.get('direction', 'long')
        entry_price = position.get('entry_price', 0)
        multiplier = specs['contract_multiplier']

        if direction == 'long':
            # Price at which maintenance margin is breached
            margin_call_price = entry_price - ((initial_margin - maintenance_margin) / (contracts * multiplier))
        else:
            margin_call_price = entry_price + ((initial_margin - maintenance_margin) / (contracts * multiplier))

        return {
            'initial_margin': round(initial_margin, 2),
            'maintenance_margin': round(maintenance_margin, 2),
            'margin_usage_pct': round(margin_usage_pct, 2),
            'available_margin': round(available_margin, 2),
            'margin_call_price': round(margin_call_price, 2),
            'max_contracts': int(account_balance / specs['initial_margin']) if specs['initial_margin'] > 0 else 0
        }

    def _calculate_position_value(self, position: Dict, specs: Dict) -> Dict:
        """Calculate position value metrics."""
        contracts = position.get('contracts', 0)
        current_price = position.get('current_price', 0)
        multiplier = specs['contract_multiplier']

        notional_value = abs(contracts) * current_price * multiplier

        return {
            'contracts': contracts,
            'current_price': current_price,
            'multiplier': multiplier,
            'notional_value': round(notional_value, 2),
            'direction': position.get('direction', 'long')
        }

    def _calculate_pnl(self, position: Dict, specs: Dict) -> Dict:
        """Calculate profit and loss."""
        contracts = position.get('contracts', 0)
        entry_price = position.get('entry_price', 0)
        current_price = position.get('current_price', entry_price)
        direction = position.get('direction', 'long')
        multiplier = specs['contract_multiplier']

        # Calculate price change
        price_change = current_price - entry_price

        # Calculate P&L based on direction
        if direction == 'long':
            unrealized_pnl = price_change * contracts * multiplier
        else:  # short
            unrealized_pnl = -price_change * contracts * multiplier

        # Calculate P&L per contract
        pnl_per_contract = unrealized_pnl / abs(contracts) if contracts != 0 else 0

        # Calculate percentage return on margin
        margin_required = specs['initial_margin'] * abs(contracts)
        return_on_margin = (unrealized_pnl / margin_required * 100) if margin_required > 0 else 0

        # Calculate tick P&L
        ticks_moved = price_change / specs['tick_size']
        tick_pnl = ticks_moved * specs['tick_value'] * abs(contracts)

        return {
            'entry_price': round(entry_price, 2),
            'current_price': round(current_price, 2),
            'price_change': round(price_change, 2),
            'unrealized_pnl': round(unrealized_pnl, 2),
            'pnl_per_contract': round(pnl_per_contract, 2),
            'return_on_margin_pct': round(return_on_margin, 2),
            'ticks_moved': round(ticks_moved, 1),
            'tick_pnl': round(tick_pnl, 2)
        }

    def _calculate_leverage(
        self,
        position_value: Dict,
        margin_reqs: Dict,
        account_balance: float
    ) -> Dict:
        """Calculate leverage metrics."""
        notional = position_value.get('notional_value', 0)
        initial_margin = margin_reqs.get('initial_margin', 0)

        # Effective leverage = Notional Value / Account Balance
        effective_leverage = notional / account_balance if account_balance > 0 else 0

        # Margin leverage = Notional Value / Initial Margin
        margin_leverage = notional / initial_margin if initial_margin > 0 else 0

        return {
            'effective_leverage': round(effective_leverage, 2),
            'margin_leverage': round(margin_leverage, 2),
            'leverage_ratio': f'{effective_leverage:.1f}:1'
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate futures calculator parameters."""
        if 'position' not in params:
            self.logger.error("Missing required field: position")
            return False

        return True
