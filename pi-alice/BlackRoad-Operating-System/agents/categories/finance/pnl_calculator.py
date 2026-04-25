"""
PnL Calculator Agent

Calculates profit and loss with realized/unrealized gains,
FIFO/LIFO accounting, and wash sale tracking.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent
from datetime import datetime, timedelta


class PnLCalculatorAgent(BaseAgent):
    """Calculates profit and loss with tax-aware accounting methods."""

    def __init__(self):
        super().__init__(
            name='pnl-calculator',
            description='Calculate profit and loss with FIFO/LIFO and wash sale tracking',
            category='finance',
            version='1.0.0',
            tags=['pnl', 'profit', 'loss', 'accounting', 'fifo', 'lifo']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate P&L.

        Args:
            params: {
                'method': 'fifo|lifo|average_cost',
                'trades': [{
                    'symbol': 'AAPL',
                    'action': 'buy|sell',
                    'quantity': 100,
                    'price': 150.00,
                    'date': '2025-01-15',
                    'commission': 0.00
                }],
                'track_wash_sales': True
            }

        Returns:
            {
                'status': 'success|failed',
                'realized_pnl': {...},
                'unrealized_pnl': {...},
                'summary': {...}
            }
        """
        method = params.get('method', 'fifo')
        trades = params.get('trades', [])
        track_wash_sales = params.get('track_wash_sales', True)

        self.logger.info(f"Calculating P&L using {method} method for {len(trades)} trades")

        # Group trades by symbol
        trades_by_symbol = {}
        for trade in trades:
            symbol = trade.get('symbol')
            if symbol not in trades_by_symbol:
                trades_by_symbol[symbol] = []
            trades_by_symbol[symbol].append(trade)

        # Calculate P&L for each symbol
        realized_pnl = []
        unrealized_pnl = []

        for symbol, symbol_trades in trades_by_symbol.items():
            pnl_data = self._calculate_symbol_pnl(symbol, symbol_trades, method, track_wash_sales)
            if pnl_data['realized']:
                realized_pnl.extend(pnl_data['realized'])
            if pnl_data['unrealized']:
                unrealized_pnl.append(pnl_data['unrealized'])

        # Calculate summary
        summary = self._calculate_summary(realized_pnl, unrealized_pnl)

        return {
            'status': 'success',
            'method': method,
            'track_wash_sales': track_wash_sales,
            'realized_pnl': realized_pnl,
            'unrealized_pnl': unrealized_pnl,
            'summary': summary,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _calculate_symbol_pnl(
        self,
        symbol: str,
        trades: List[Dict],
        method: str,
        track_wash_sales: bool
    ) -> Dict:
        """Calculate P&L for a single symbol."""
        buys = []
        sells = []

        # Separate buys and sells
        for trade in sorted(trades, key=lambda x: x.get('date', '')):
            if trade.get('action') == 'buy':
                buys.append(trade)
            else:
                sells.append(trade)

        # Match sells with buys using accounting method
        realized = []
        for sell in sells:
            matched_buy = self._match_trade(sell, buys, method)
            if matched_buy:
                pnl = self._calculate_trade_pnl(sell, matched_buy, track_wash_sales)
                realized.append(pnl)

        # Calculate unrealized P&L from remaining open positions
        unrealized = self._calculate_unrealized_pnl(symbol, buys)

        return {
            'realized': realized,
            'unrealized': unrealized
        }

    def _match_trade(self, sell: Dict, buys: List[Dict], method: str) -> Dict:
        """Match a sell trade with a buy using specified accounting method."""
        if not buys:
            return None

        if method == 'fifo':
            # First in, first out
            return buys.pop(0)
        elif method == 'lifo':
            # Last in, first out
            return buys.pop()
        else:  # average_cost
            # Use average cost of all buys
            avg_price = sum(b['price'] * b['quantity'] for b in buys) / sum(b['quantity'] for b in buys)
            buy = buys.pop(0)
            buy['price'] = avg_price
            return buy

    def _calculate_trade_pnl(
        self,
        sell: Dict,
        buy: Dict,
        track_wash_sales: bool
    ) -> Dict:
        """Calculate P&L for a matched trade pair."""
        quantity = min(sell['quantity'], buy['quantity'])
        proceeds = quantity * sell['price'] - sell.get('commission', 0)
        cost_basis = quantity * buy['price'] + buy.get('commission', 0)
        pnl = proceeds - cost_basis

        # Check for wash sale
        is_wash_sale = False
        if track_wash_sales:
            buy_date = datetime.fromisoformat(buy['date'].replace('Z', ''))
            sell_date = datetime.fromisoformat(sell['date'].replace('Z', ''))
            days_diff = abs((sell_date - buy_date).days)
            if pnl < 0 and days_diff <= 30:
                is_wash_sale = True

        # Determine holding period
        buy_date = datetime.fromisoformat(buy['date'].replace('Z', ''))
        sell_date = datetime.fromisoformat(sell['date'].replace('Z', ''))
        holding_days = (sell_date - buy_date).days
        term = 'long' if holding_days > 365 else 'short'

        return {
            'symbol': sell['symbol'],
            'quantity': quantity,
            'buy_price': round(buy['price'], 2),
            'sell_price': round(sell['price'], 2),
            'buy_date': buy['date'],
            'sell_date': sell['date'],
            'holding_days': holding_days,
            'term': term,
            'proceeds': round(proceeds, 2),
            'cost_basis': round(cost_basis, 2),
            'pnl': round(pnl, 2),
            'pnl_pct': round((pnl / cost_basis * 100) if cost_basis > 0 else 0, 2),
            'is_wash_sale': is_wash_sale
        }

    def _calculate_unrealized_pnl(self, symbol: str, remaining_buys: List[Dict]) -> Dict:
        """Calculate unrealized P&L from open positions."""
        if not remaining_buys:
            return None

        total_quantity = sum(b['quantity'] for b in remaining_buys)
        total_cost = sum(b['quantity'] * b['price'] for b in remaining_buys)
        avg_cost = total_cost / total_quantity if total_quantity > 0 else 0

        # Mock current price
        current_price = 155.00

        market_value = total_quantity * current_price
        unrealized_pnl = market_value - total_cost

        return {
            'symbol': symbol,
            'quantity': total_quantity,
            'avg_cost': round(avg_cost, 2),
            'current_price': round(current_price, 2),
            'cost_basis': round(total_cost, 2),
            'market_value': round(market_value, 2),
            'unrealized_pnl': round(unrealized_pnl, 2),
            'unrealized_pnl_pct': round((unrealized_pnl / total_cost * 100) if total_cost > 0 else 0, 2)
        }

    def _calculate_summary(self, realized: List[Dict], unrealized: List[Dict]) -> Dict:
        """Calculate overall P&L summary."""
        total_realized = sum(r['pnl'] for r in realized)
        total_unrealized = sum(u['unrealized_pnl'] for u in unrealized if u)

        short_term = sum(r['pnl'] for r in realized if r['term'] == 'short')
        long_term = sum(r['pnl'] for r in realized if r['term'] == 'long')

        wash_sale_loss = sum(r['pnl'] for r in realized if r.get('is_wash_sale', False))

        return {
            'total_realized_pnl': round(total_realized, 2),
            'total_unrealized_pnl': round(total_unrealized, 2),
            'total_pnl': round(total_realized + total_unrealized, 2),
            'short_term_pnl': round(short_term, 2),
            'long_term_pnl': round(long_term, 2),
            'wash_sale_loss': round(wash_sale_loss, 2),
            'winners': len([r for r in realized if r['pnl'] > 0]),
            'losers': len([r for r in realized if r['pnl'] < 0]),
            'win_rate': round(len([r for r in realized if r['pnl'] > 0]) / len(realized) * 100 if realized else 0, 2)
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate P&L calculation parameters."""
        if 'trades' not in params:
            self.logger.error("Missing required field: trades")
            return False

        valid_methods = ['fifo', 'lifo', 'average_cost']
        method = params.get('method', 'fifo')

        if method not in valid_methods:
            self.logger.error(f"Invalid method: {method}")
            return False

        return True
