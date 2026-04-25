"""
Liquidity Analyzer Agent

Analyzes market liquidity using bid-ask spreads, order book depth,
and volume metrics.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent
from datetime import datetime


class LiquidityAnalyzerAgent(BaseAgent):
    """Analyzes market liquidity and trading conditions."""

    def __init__(self):
        super().__init__(
            name='liquidity-analyzer',
            description='Analyze market liquidity using spreads, depth, and volume',
            category='finance',
            version='1.0.0',
            tags=['liquidity', 'market-microstructure', 'volume', 'order-book']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze market liquidity.

        Args:
            params: {
                'symbol': 'AAPL',
                'order_book': {
                    'bids': [[150.00, 1000], [149.95, 500]],
                    'asks': [[150.05, 800], [150.10, 1200]]
                },
                'volume_data': {...},
                'quote_data': {...}
            }

        Returns:
            {
                'status': 'success|failed',
                'liquidity_score': float,
                'metrics': {...},
                'classification': str
            }
        """
        symbol = params.get('symbol')
        order_book = params.get('order_book', {})
        volume_data = params.get('volume_data', {})
        quote_data = params.get('quote_data', {})

        self.logger.info(f"Analyzing liquidity for {symbol}")

        # Calculate liquidity metrics
        spread_metrics = self._analyze_spreads(order_book, quote_data)
        depth_metrics = self._analyze_depth(order_book)
        volume_metrics = self._analyze_volume(volume_data)

        # Calculate overall liquidity score
        liquidity_score = self._calculate_liquidity_score(
            spread_metrics,
            depth_metrics,
            volume_metrics
        )

        # Classify liquidity
        classification = self._classify_liquidity(liquidity_score)

        # Generate trading recommendations
        recommendations = self._generate_recommendations(
            spread_metrics,
            depth_metrics,
            classification
        )

        return {
            'status': 'success',
            'symbol': symbol,
            'liquidity_score': round(liquidity_score, 2),
            'classification': classification,
            'spread_metrics': spread_metrics,
            'depth_metrics': depth_metrics,
            'volume_metrics': volume_metrics,
            'recommendations': recommendations,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _analyze_spreads(self, order_book: Dict, quote_data: Dict) -> Dict:
        """Analyze bid-ask spreads."""
        bids = order_book.get('bids', [[150.00, 1000]])
        asks = order_book.get('asks', [[150.05, 800]])

        best_bid = bids[0][0] if bids else 0
        best_ask = asks[0][0] if asks else 0

        # Calculate spreads
        absolute_spread = best_ask - best_bid
        mid_price = (best_bid + best_ask) / 2
        relative_spread = (absolute_spread / mid_price * 100) if mid_price > 0 else 0

        # Effective spread (from trades)
        effective_spread = quote_data.get('effective_spread', absolute_spread)

        return {
            'best_bid': round(best_bid, 2),
            'best_ask': round(best_ask, 2),
            'absolute_spread': round(absolute_spread, 4),
            'relative_spread_bps': round(relative_spread * 100, 2),  # basis points
            'mid_price': round(mid_price, 2),
            'effective_spread': round(effective_spread, 4),
            'spread_quality': 'tight' if relative_spread < 0.01 else 'wide' if relative_spread > 0.05 else 'moderate'
        }

    def _analyze_depth(self, order_book: Dict) -> Dict:
        """Analyze order book depth."""
        bids = order_book.get('bids', [])
        asks = order_book.get('asks', [])

        # Calculate depth at various levels
        bid_depth_5 = sum(qty for _, qty in bids[:5])
        ask_depth_5 = sum(qty for _, qty in asks[:5])

        bid_depth_10 = sum(qty for _, qty in bids[:10])
        ask_depth_10 = sum(qty for _, qty in asks[:10])

        # Calculate imbalance
        total_bid = bid_depth_10
        total_ask = ask_depth_10
        imbalance = (total_bid - total_ask) / (total_bid + total_ask) if (total_bid + total_ask) > 0 else 0

        return {
            'bid_depth_5_levels': bid_depth_5,
            'ask_depth_5_levels': ask_depth_5,
            'bid_depth_10_levels': bid_depth_10,
            'ask_depth_10_levels': ask_depth_10,
            'order_book_imbalance': round(imbalance, 3),
            'imbalance_direction': 'bid' if imbalance > 0.1 else 'ask' if imbalance < -0.1 else 'balanced',
            'depth_quality': 'deep' if bid_depth_10 > 5000 else 'shallow' if bid_depth_10 < 1000 else 'moderate'
        }

    def _analyze_volume(self, volume_data: Dict) -> Dict:
        """Analyze trading volume metrics."""
        daily_volume = volume_data.get('daily_volume', 1000000)
        avg_volume = volume_data.get('avg_30day_volume', 1200000)
        dollar_volume = volume_data.get('dollar_volume', 150000000)

        # Volume relative to average
        volume_ratio = daily_volume / avg_volume if avg_volume > 0 else 1.0

        # Turnover rate
        market_cap = volume_data.get('market_cap', 1000000000)
        turnover = (dollar_volume / market_cap * 100) if market_cap > 0 else 0

        return {
            'daily_volume': daily_volume,
            'avg_volume': avg_volume,
            'volume_ratio': round(volume_ratio, 2),
            'dollar_volume': dollar_volume,
            'turnover_rate': round(turnover, 3),
            'volume_trend': 'above_average' if volume_ratio > 1.2 else 'below_average' if volume_ratio < 0.8 else 'average'
        }

    def _calculate_liquidity_score(
        self,
        spread: Dict,
        depth: Dict,
        volume: Dict
    ) -> float:
        """Calculate overall liquidity score (0-100)."""
        score = 0.0

        # Spread component (40% weight)
        spread_bps = spread.get('relative_spread_bps', 10)
        if spread_bps < 5:
            score += 40
        elif spread_bps < 10:
            score += 30
        elif spread_bps < 20:
            score += 20
        else:
            score += 10

        # Depth component (30% weight)
        depth_quality = depth.get('depth_quality', 'moderate')
        if depth_quality == 'deep':
            score += 30
        elif depth_quality == 'moderate':
            score += 20
        else:
            score += 10

        # Volume component (30% weight)
        volume_trend = volume.get('volume_trend', 'average')
        if volume_trend == 'above_average':
            score += 30
        elif volume_trend == 'average':
            score += 20
        else:
            score += 10

        return score

    def _classify_liquidity(self, score: float) -> str:
        """Classify liquidity level."""
        if score >= 80:
            return 'highly_liquid'
        elif score >= 60:
            return 'liquid'
        elif score >= 40:
            return 'moderately_liquid'
        else:
            return 'illiquid'

    def _generate_recommendations(
        self,
        spread: Dict,
        depth: Dict,
        classification: str
    ) -> List[str]:
        """Generate trading recommendations based on liquidity."""
        recommendations = []

        if classification == 'illiquid':
            recommendations.append('Use limit orders to avoid slippage')
            recommendations.append('Break large orders into smaller chunks')
            recommendations.append('Trade during peak market hours for better liquidity')
        elif classification == 'moderately_liquid':
            recommendations.append('Monitor bid-ask spread before executing')
            recommendations.append('Consider using limit orders for large positions')
        else:
            recommendations.append('Market orders acceptable for normal position sizes')
            recommendations.append('Good conditions for larger trades')

        if spread.get('spread_quality') == 'wide':
            recommendations.append('Wide spreads detected - be cautious with market orders')

        if depth.get('imbalance_direction') != 'balanced':
            imbalance = depth.get('imbalance_direction')
            recommendations.append(f'Order book shows {imbalance}-side pressure')

        return recommendations

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate liquidity analysis parameters."""
        if 'symbol' not in params:
            self.logger.error("Missing required field: symbol")
            return False

        return True
