"""
Sentiment Analyzer Agent

Analyzes market sentiment from news, social media, and financial reports.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent
from datetime import datetime


class SentimentAnalyzerAgent(BaseAgent):
    """Analyzes market sentiment from multiple sources."""

    def __init__(self):
        super().__init__(
            name='sentiment-analyzer',
            description='Analyze market sentiment from news, social media, and reports',
            category='finance',
            version='1.0.0',
            tags=['sentiment', 'nlp', 'social-media', 'news', 'analysis']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute sentiment analysis.

        Args:
            params: {
                'symbol': 'AAPL',
                'sources': ['news', 'twitter', 'reddit', 'stocktwits'],
                'timeframe': '1h|12h|24h|7d|30d',
                'threshold': 0.1  # Minimum sentiment threshold
            }

        Returns:
            {
                'status': 'success|failed',
                'overall_sentiment': {...},
                'source_breakdown': {...},
                'signals': [...]
            }
        """
        symbol = params.get('symbol')
        sources = params.get('sources', ['news', 'twitter'])
        timeframe = params.get('timeframe', '24h')

        self.logger.info(
            f"Analyzing sentiment for {symbol} from {len(sources)} sources"
        )

        # Analyze sentiment from each source
        source_sentiments = {}
        for source in sources:
            source_sentiments[source] = self._analyze_source(symbol, source, timeframe)

        # Calculate overall sentiment
        overall = self._calculate_overall_sentiment(source_sentiments)

        # Generate trading signals from sentiment
        signals = self._generate_sentiment_signals(overall, symbol)

        return {
            'status': 'success',
            'symbol': symbol,
            'timeframe': timeframe,
            'overall_sentiment': overall,
            'source_breakdown': source_sentiments,
            'signals': signals,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _analyze_source(self, symbol: str, source: str, timeframe: str) -> Dict:
        """Analyze sentiment from a specific source."""
        # Mock sentiment analysis
        sentiments = {
            'news': {'score': 0.65, 'volume': 45, 'trend': 'positive'},
            'twitter': {'score': 0.72, 'volume': 1250, 'trend': 'very_positive'},
            'reddit': {'score': 0.58, 'volume': 380, 'trend': 'positive'},
            'stocktwits': {'score': 0.68, 'volume': 890, 'trend': 'positive'}
        }

        base_data = sentiments.get(source, {'score': 0.5, 'volume': 0, 'trend': 'neutral'})

        return {
            'source': source,
            'sentiment_score': base_data['score'],
            'volume': base_data['volume'],
            'trend': base_data['trend'],
            'positive_count': int(base_data['volume'] * 0.6),
            'neutral_count': int(base_data['volume'] * 0.25),
            'negative_count': int(base_data['volume'] * 0.15),
            'top_keywords': ['earnings', 'growth', 'innovation', 'revenue'],
            'reliability': 0.75
        }

    def _calculate_overall_sentiment(self, sources: Dict) -> Dict:
        """Calculate weighted overall sentiment."""
        # Weight sources by reliability and volume
        total_weight = 0
        weighted_score = 0

        for source_name, data in sources.items():
            weight = data['reliability'] * (data['volume'] ** 0.5)
            weighted_score += data['sentiment_score'] * weight
            total_weight += weight

        overall_score = weighted_score / total_weight if total_weight > 0 else 0.5

        # Classify sentiment
        if overall_score >= 0.7:
            classification = 'very_positive'
        elif overall_score >= 0.6:
            classification = 'positive'
        elif overall_score >= 0.4:
            classification = 'neutral'
        elif overall_score >= 0.3:
            classification = 'negative'
        else:
            classification = 'very_negative'

        return {
            'score': round(overall_score, 3),
            'classification': classification,
            'confidence': 0.78,
            'total_mentions': sum(s['volume'] for s in sources.values())
        }

    def _generate_sentiment_signals(self, sentiment: Dict, symbol: str) -> List[Dict]:
        """Generate trading signals from sentiment."""
        signals = []
        score = sentiment['score']

        if score >= 0.7:
            signals.append({
                'signal': 'buy',
                'strength': min((score - 0.5) * 2, 1.0),
                'reason': 'Very positive market sentiment detected',
                'sentiment_score': score
            })
        elif score >= 0.6:
            signals.append({
                'signal': 'buy',
                'strength': (score - 0.5) * 2,
                'reason': 'Positive market sentiment',
                'sentiment_score': score
            })
        elif score <= 0.3:
            signals.append({
                'signal': 'sell',
                'strength': (0.5 - score) * 2,
                'reason': 'Very negative market sentiment detected',
                'sentiment_score': score
            })
        elif score <= 0.4:
            signals.append({
                'signal': 'sell',
                'strength': (0.5 - score) * 1.5,
                'reason': 'Negative market sentiment',
                'sentiment_score': score
            })
        else:
            signals.append({
                'signal': 'hold',
                'strength': 0.5,
                'reason': 'Neutral market sentiment',
                'sentiment_score': score
            })

        return signals

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate sentiment analysis parameters."""
        if 'symbol' not in params:
            self.logger.error("Missing required field: symbol")
            return False

        return True
