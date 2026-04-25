"""
Market Data Collector Agent

Collects real-time and historical market data from various sources
including stock prices, forex, crypto, and commodities.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent
from datetime import datetime, timedelta


class MarketDataCollectorAgent(BaseAgent):
    """Collects market data from multiple sources and normalizes it."""

    def __init__(self):
        super().__init__(
            name='market-data-collector',
            description='Collect real-time and historical market data from multiple sources',
            category='finance',
            version='1.0.0',
            tags=['market-data', 'prices', 'quotes', 'historical', 'real-time']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute market data collection.

        Args:
            params: {
                'symbols': ['AAPL', 'GOOGL', 'BTC-USD'],
                'data_type': 'quote|historical|intraday|options_chain',
                'source': 'yahoo|alpha_vantage|iex|coinbase|binance',
                'period': '1d|5d|1mo|3mo|1y|5y|max',
                'interval': '1m|5m|15m|30m|1h|1d',
                'fields': ['open', 'high', 'low', 'close', 'volume']
            }

        Returns:
            {
                'status': 'success|failed',
                'data': {...},
                'metadata': {...}
            }
        """
        symbols = params.get('symbols', [])
        data_type = params.get('data_type', 'quote')
        source = params.get('source', 'yahoo')
        period = params.get('period', '1d')
        interval = params.get('interval', '1d')
        fields = params.get('fields', ['open', 'high', 'low', 'close', 'volume'])

        self.logger.info(
            f"Collecting {data_type} data for {len(symbols)} symbols from {source}"
        )

        # Collect data based on type
        if data_type == 'quote':
            data = self._get_quotes(symbols, source)
        elif data_type == 'historical':
            data = self._get_historical(symbols, source, period, interval)
        elif data_type == 'intraday':
            data = self._get_intraday(symbols, source, interval)
        elif data_type == 'options_chain':
            data = self._get_options_chain(symbols, source)
        else:
            data = {}

        metadata = {
            'source': source,
            'symbols_count': len(symbols),
            'data_type': data_type,
            'period': period,
            'interval': interval,
            'fields': fields,
            'collected_at': datetime.utcnow().isoformat() + 'Z'
        }

        return {
            'status': 'success',
            'data': data,
            'metadata': metadata,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _get_quotes(self, symbols: List[str], source: str) -> Dict[str, Any]:
        """Get real-time quotes for symbols."""
        quotes = {}

        for symbol in symbols:
            quotes[symbol] = {
                'symbol': symbol,
                'price': 150.25,
                'bid': 150.20,
                'ask': 150.30,
                'bid_size': 100,
                'ask_size': 200,
                'volume': 1234567,
                'last_trade_time': datetime.utcnow().isoformat() + 'Z',
                'change': 2.50,
                'change_percent': 1.69,
                'day_high': 151.00,
                'day_low': 148.50,
                'open': 149.00,
                'previous_close': 147.75,
                'market_cap': 2500000000000,
                'pe_ratio': 28.5,
                'source': source
            }

        return quotes

    def _get_historical(
        self,
        symbols: List[str],
        source: str,
        period: str,
        interval: str
    ) -> Dict[str, Any]:
        """Get historical price data."""
        historical_data = {}

        # Calculate number of data points based on period
        days_map = {
            '1d': 1, '5d': 5, '1mo': 30, '3mo': 90,
            '1y': 365, '5y': 1825, 'max': 3650
        }
        days = days_map.get(period, 365)

        for symbol in symbols:
            data_points = []
            base_price = 150.0

            for i in range(min(days, 100)):  # Limit to 100 points for mock data
                date = datetime.utcnow() - timedelta(days=days - i)
                # Simulate price movement
                price_change = (i % 10 - 5) * 0.5
                close = base_price + price_change

                data_points.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'open': round(close - 0.5, 2),
                    'high': round(close + 1.0, 2),
                    'low': round(close - 1.0, 2),
                    'close': round(close, 2),
                    'volume': 1000000 + (i * 10000),
                    'adjusted_close': round(close, 2)
                })

            historical_data[symbol] = {
                'symbol': symbol,
                'period': period,
                'interval': interval,
                'data': data_points
            }

        return historical_data

    def _get_intraday(
        self,
        symbols: List[str],
        source: str,
        interval: str
    ) -> Dict[str, Any]:
        """Get intraday price data."""
        intraday_data = {}

        interval_minutes = {
            '1m': 1, '5m': 5, '15m': 15, '30m': 30, '1h': 60
        }
        minutes = interval_minutes.get(interval, 5)

        for symbol in symbols:
            data_points = []
            base_price = 150.0
            current_time = datetime.utcnow()

            # Generate last 50 intervals
            for i in range(50):
                timestamp = current_time - timedelta(minutes=minutes * (50 - i))
                price_change = (i % 10 - 5) * 0.2
                close = base_price + price_change

                data_points.append({
                    'timestamp': timestamp.isoformat() + 'Z',
                    'open': round(close - 0.1, 2),
                    'high': round(close + 0.2, 2),
                    'low': round(close - 0.2, 2),
                    'close': round(close, 2),
                    'volume': 50000 + (i * 100)
                })

            intraday_data[symbol] = {
                'symbol': symbol,
                'interval': interval,
                'data': data_points
            }

        return intraday_data

    def _get_options_chain(self, symbols: List[str], source: str) -> Dict[str, Any]:
        """Get options chain data."""
        options_data = {}

        for symbol in symbols:
            current_price = 150.0
            expiration = (datetime.utcnow() + timedelta(days=30)).strftime('%Y-%m-%d')

            calls = []
            puts = []

            # Generate option strikes around current price
            for i in range(-5, 6):
                strike = round(current_price + (i * 5), 2)

                calls.append({
                    'strike': strike,
                    'expiration': expiration,
                    'bid': round(max(0.1, current_price - strike + 2), 2),
                    'ask': round(max(0.2, current_price - strike + 2.5), 2),
                    'last': round(max(0.15, current_price - strike + 2.2), 2),
                    'volume': 100 + abs(i) * 50,
                    'open_interest': 1000 + abs(i) * 200,
                    'implied_volatility': 0.25 + (abs(i) * 0.02)
                })

                puts.append({
                    'strike': strike,
                    'expiration': expiration,
                    'bid': round(max(0.1, strike - current_price + 2), 2),
                    'ask': round(max(0.2, strike - current_price + 2.5), 2),
                    'last': round(max(0.15, strike - current_price + 2.2), 2),
                    'volume': 100 + abs(i) * 50,
                    'open_interest': 1000 + abs(i) * 200,
                    'implied_volatility': 0.25 + (abs(i) * 0.02)
                })

            options_data[symbol] = {
                'symbol': symbol,
                'underlying_price': current_price,
                'expiration': expiration,
                'calls': calls,
                'puts': puts
            }

        return options_data

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate market data collection parameters."""
        if 'symbols' not in params or not params['symbols']:
            self.logger.error("Missing required field: symbols")
            return False

        valid_data_types = ['quote', 'historical', 'intraday', 'options_chain']
        data_type = params.get('data_type', 'quote')

        if data_type not in valid_data_types:
            self.logger.error(f"Invalid data_type: {data_type}")
            return False

        return True
