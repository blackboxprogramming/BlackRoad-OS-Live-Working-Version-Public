"""
Trading Strategy Executor Agent

Executes automated trading strategies including momentum,
mean reversion, and arbitrage strategies.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent
from datetime import datetime


class TradingStrategyExecutorAgent(BaseAgent):
    """Executes automated trading strategies with risk controls."""

    def __init__(self):
        super().__init__(
            name='trading-strategy-executor',
            description='Execute automated trading strategies with risk management',
            category='finance',
            version='1.0.0',
            tags=['trading', 'strategy', 'automation', 'execution']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute trading strategy.

        Args:
            params: {
                'strategy_type': 'momentum|mean_reversion|arbitrage|breakout|scalping',
                'symbols': ['AAPL', 'GOOGL', 'MSFT'],
                'timeframe': '1m|5m|15m|1h|4h|1d',
                'capital': 100000.00,
                'max_position_size': 0.1,  # 10% of capital
                'stop_loss_pct': 2.0,
                'take_profit_pct': 5.0,
                'market_data': {...}
            }

        Returns:
            {
                'status': 'success|failed',
                'strategy': 'momentum',
                'signals': [...],
                'orders': [...],
                'risk_metrics': {...}
            }
        """
        strategy_type = params.get('strategy_type', 'momentum')
        symbols = params.get('symbols', [])
        timeframe = params.get('timeframe', '1h')
        capital = params.get('capital', 100000.0)
        max_position_size = params.get('max_position_size', 0.1)
        stop_loss_pct = params.get('stop_loss_pct', 2.0)
        take_profit_pct = params.get('take_profit_pct', 5.0)
        market_data = params.get('market_data', {})

        self.logger.info(
            f"Executing {strategy_type} strategy on {len(symbols)} symbols"
        )

        # Generate trading signals based on strategy
        signals = self._generate_signals(
            strategy_type, symbols, market_data, timeframe
        )

        # Generate orders from signals
        orders = self._generate_orders(
            signals, capital, max_position_size, stop_loss_pct, take_profit_pct
        )

        # Calculate risk metrics
        risk_metrics = self._calculate_risk_metrics(
            orders, capital, stop_loss_pct
        )

        return {
            'status': 'success',
            'strategy': strategy_type,
            'timeframe': timeframe,
            'symbols_analyzed': len(symbols),
            'signals': signals,
            'orders': orders,
            'risk_metrics': risk_metrics,
            'capital_allocated': round(sum(o['value'] for o in orders), 2),
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _generate_signals(
        self,
        strategy_type: str,
        symbols: List[str],
        market_data: Dict,
        timeframe: str
    ) -> List[Dict]:
        """Generate trading signals based on strategy type."""
        signals = []

        for symbol in symbols:
            # Mock signal generation based on strategy type
            if strategy_type == 'momentum':
                signal = self._momentum_signal(symbol, market_data)
            elif strategy_type == 'mean_reversion':
                signal = self._mean_reversion_signal(symbol, market_data)
            elif strategy_type == 'breakout':
                signal = self._breakout_signal(symbol, market_data)
            elif strategy_type == 'arbitrage':
                signal = self._arbitrage_signal(symbol, market_data)
            else:
                signal = None

            if signal:
                signals.append(signal)

        return signals

    def _momentum_signal(self, symbol: str, market_data: Dict) -> Dict:
        """Generate momentum-based signal."""
        # Mock: Price above 20-day MA = buy signal
        return {
            'symbol': symbol,
            'signal': 'buy',
            'strategy': 'momentum',
            'strength': 0.75,
            'price': market_data.get(symbol, {}).get('price', 100.0),
            'reason': 'Strong upward momentum detected'
        }

    def _mean_reversion_signal(self, symbol: str, market_data: Dict) -> Dict:
        """Generate mean reversion signal."""
        return {
            'symbol': symbol,
            'signal': 'sell',
            'strategy': 'mean_reversion',
            'strength': 0.65,
            'price': market_data.get(symbol, {}).get('price', 100.0),
            'reason': 'Price extended above mean, expecting reversion'
        }

    def _breakout_signal(self, symbol: str, market_data: Dict) -> Dict:
        """Generate breakout signal."""
        return {
            'symbol': symbol,
            'signal': 'buy',
            'strategy': 'breakout',
            'strength': 0.80,
            'price': market_data.get(symbol, {}).get('price', 100.0),
            'reason': 'Price breaking above resistance level'
        }

    def _arbitrage_signal(self, symbol: str, market_data: Dict) -> Dict:
        """Generate arbitrage signal."""
        return {
            'symbol': symbol,
            'signal': 'buy',
            'strategy': 'arbitrage',
            'strength': 0.90,
            'price': market_data.get(symbol, {}).get('price', 100.0),
            'reason': 'Price discrepancy detected between exchanges'
        }

    def _generate_orders(
        self,
        signals: List[Dict],
        capital: float,
        max_position_size: float,
        stop_loss_pct: float,
        take_profit_pct: float
    ) -> List[Dict]:
        """Generate orders from trading signals."""
        orders = []
        max_position_value = capital * max_position_size

        for signal in signals:
            if signal['strength'] < 0.6:  # Only execute high-confidence signals
                continue

            price = signal['price']
            shares = int(max_position_value / price)

            if shares > 0:
                order = {
                    'symbol': signal['symbol'],
                    'action': signal['signal'],
                    'type': 'limit',
                    'shares': shares,
                    'price': round(price, 2),
                    'value': round(shares * price, 2),
                    'stop_loss': round(price * (1 - stop_loss_pct / 100), 2),
                    'take_profit': round(price * (1 + take_profit_pct / 100), 2),
                    'strategy': signal['strategy'],
                    'reason': signal['reason']
                }
                orders.append(order)

        return orders

    def _calculate_risk_metrics(
        self,
        orders: List[Dict],
        capital: float,
        stop_loss_pct: float
    ) -> Dict[str, Any]:
        """Calculate risk metrics for the strategy."""
        total_exposure = sum(o['value'] for o in orders)
        max_loss_per_trade = total_exposure * (stop_loss_pct / 100)

        return {
            'total_exposure': round(total_exposure, 2),
            'exposure_pct': round((total_exposure / capital) * 100, 2),
            'max_loss_per_trade': round(max_loss_per_trade, 2),
            'max_loss_pct': round((max_loss_per_trade / capital) * 100, 2),
            'number_of_positions': len(orders),
            'avg_position_size': round(total_exposure / len(orders), 2) if orders else 0,
            'risk_reward_ratio': round(5.0 / stop_loss_pct, 2)
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate strategy execution parameters."""
        required = ['strategy_type', 'symbols', 'capital']
        for field in required:
            if field not in params:
                self.logger.error(f"Missing required field: {field}")
                return False

        valid_strategies = [
            'momentum', 'mean_reversion', 'arbitrage', 'breakout', 'scalping'
        ]
        if params['strategy_type'] not in valid_strategies:
            self.logger.error(f"Invalid strategy: {params['strategy_type']}")
            return False

        return True
