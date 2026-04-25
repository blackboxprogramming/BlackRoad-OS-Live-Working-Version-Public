"""
Risk Analyzer Agent

Analyzes financial risk including VaR, beta, volatility,
and portfolio risk metrics.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent
from datetime import datetime
import math


class RiskAnalyzerAgent(BaseAgent):
    """Analyzes financial risk using industry-standard metrics."""

    def __init__(self):
        super().__init__(
            name='risk-analyzer',
            description='Analyze financial risk with VaR, beta, and volatility metrics',
            category='finance',
            version='1.0.0',
            tags=['risk', 'var', 'volatility', 'beta', 'analysis']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute risk analysis.

        Args:
            params: {
                'analysis_type': 'portfolio|security|market',
                'positions': [{'symbol': 'AAPL', 'value': 10000, 'volatility': 0.25}],
                'benchmark': 'SPY',
                'confidence_level': 0.95,  # For VaR calculation
                'time_horizon_days': 1,
                'historical_returns': [...]  # Optional historical data
            }

        Returns:
            {
                'status': 'success|failed',
                'var': {...},
                'volatility': {...},
                'beta': {...},
                'sharpe_ratio': float,
                'risk_grade': 'A|B|C|D|F'
            }
        """
        analysis_type = params.get('analysis_type', 'portfolio')
        positions = params.get('positions', [])
        confidence_level = params.get('confidence_level', 0.95)
        time_horizon = params.get('time_horizon_days', 1)
        benchmark = params.get('benchmark', 'SPY')

        self.logger.info(f"Analyzing {analysis_type} risk for {len(positions)} positions")

        # Calculate Value at Risk (VaR)
        var_metrics = self._calculate_var(positions, confidence_level, time_horizon)

        # Calculate volatility metrics
        volatility_metrics = self._calculate_volatility(positions)

        # Calculate beta (market sensitivity)
        beta = self._calculate_beta(positions, benchmark)

        # Calculate Sharpe Ratio
        sharpe_ratio = self._calculate_sharpe_ratio(positions)

        # Calculate risk grade
        risk_grade = self._calculate_risk_grade(var_metrics, volatility_metrics)

        # Generate risk warnings
        warnings = self._generate_risk_warnings(
            var_metrics, volatility_metrics, beta
        )

        return {
            'status': 'success',
            'analysis_type': analysis_type,
            'confidence_level': confidence_level,
            'time_horizon_days': time_horizon,
            'var': var_metrics,
            'volatility': volatility_metrics,
            'beta': beta,
            'sharpe_ratio': round(sharpe_ratio, 3),
            'risk_grade': risk_grade,
            'warnings': warnings,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _calculate_var(
        self,
        positions: List[Dict],
        confidence_level: float,
        time_horizon: int
    ) -> Dict[str, Any]:
        """Calculate Value at Risk (VaR) using parametric method."""
        total_value = sum(p.get('value', 0) for p in positions)

        # Weighted average volatility
        weighted_vol = 0.0
        for pos in positions:
            weight = pos.get('value', 0) / total_value if total_value > 0 else 0
            volatility = pos.get('volatility', 0.20)  # Default 20% annualized
            weighted_vol += weight * volatility

        # Daily volatility (assuming 252 trading days)
        daily_vol = weighted_vol / math.sqrt(252)

        # Z-score for confidence level (1.65 for 95%, 2.33 for 99%)
        z_score = 1.65 if confidence_level == 0.95 else 2.33

        # VaR calculation
        var_dollar = total_value * daily_vol * z_score * math.sqrt(time_horizon)
        var_percent = (var_dollar / total_value * 100) if total_value > 0 else 0

        return {
            'var_dollar': round(var_dollar, 2),
            'var_percent': round(var_percent, 2),
            'confidence_level': confidence_level,
            'time_horizon_days': time_horizon,
            'interpretation': f'95% confident losses will not exceed ${var_dollar:,.2f} in {time_horizon} day(s)'
        }

    def _calculate_volatility(self, positions: List[Dict]) -> Dict[str, Any]:
        """Calculate portfolio volatility metrics."""
        if not positions:
            return {'annualized': 0.0, 'daily': 0.0}

        total_value = sum(p.get('value', 0) for p in positions)

        # Weighted average volatility
        weighted_vol = 0.0
        for pos in positions:
            weight = pos.get('value', 0) / total_value if total_value > 0 else 0
            volatility = pos.get('volatility', 0.20)
            weighted_vol += weight * volatility

        daily_vol = weighted_vol / math.sqrt(252)

        return {
            'annualized': round(weighted_vol * 100, 2),
            'daily': round(daily_vol * 100, 2),
            'monthly': round(weighted_vol / math.sqrt(12) * 100, 2),
            'interpretation': self._interpret_volatility(weighted_vol)
        }

    def _interpret_volatility(self, vol: float) -> str:
        """Interpret volatility level."""
        if vol < 0.15:
            return 'Low volatility - Conservative risk profile'
        elif vol < 0.25:
            return 'Moderate volatility - Balanced risk profile'
        elif vol < 0.40:
            return 'High volatility - Aggressive risk profile'
        else:
            return 'Very high volatility - Speculative risk profile'

    def _calculate_beta(self, positions: List[Dict], benchmark: str) -> Dict[str, Any]:
        """Calculate portfolio beta (market sensitivity)."""
        if not positions:
            return {'beta': 1.0, 'interpretation': 'Neutral market sensitivity'}

        total_value = sum(p.get('value', 0) for p in positions)

        # Weighted average beta
        weighted_beta = 0.0
        for pos in positions:
            weight = pos.get('value', 0) / total_value if total_value > 0 else 0
            beta = pos.get('beta', 1.0)  # Default beta of 1.0
            weighted_beta += weight * beta

        interpretation = ''
        if weighted_beta < 0.8:
            interpretation = 'Defensive - Less volatile than market'
        elif weighted_beta < 1.2:
            interpretation = 'Neutral - Moves with market'
        else:
            interpretation = 'Aggressive - More volatile than market'

        return {
            'beta': round(weighted_beta, 3),
            'benchmark': benchmark,
            'interpretation': interpretation
        }

    def _calculate_sharpe_ratio(self, positions: List[Dict]) -> float:
        """Calculate Sharpe Ratio (risk-adjusted return)."""
        # Mock calculation - would need actual returns data
        avg_return = 0.10  # 10% average annual return
        risk_free_rate = 0.04  # 4% risk-free rate

        total_value = sum(p.get('value', 0) for p in positions)
        weighted_vol = 0.0
        for pos in positions:
            weight = pos.get('value', 0) / total_value if total_value > 0 else 0
            volatility = pos.get('volatility', 0.20)
            weighted_vol += weight * volatility

        if weighted_vol == 0:
            return 0.0

        sharpe = (avg_return - risk_free_rate) / weighted_vol
        return sharpe

    def _calculate_risk_grade(
        self,
        var_metrics: Dict,
        volatility_metrics: Dict
    ) -> str:
        """Calculate overall risk grade A-F."""
        var_pct = var_metrics.get('var_percent', 0)
        vol = volatility_metrics.get('annualized', 0)

        # Risk scoring
        risk_score = 0
        if var_pct < 2:
            risk_score += 20
        elif var_pct < 5:
            risk_score += 15
        elif var_pct < 10:
            risk_score += 10
        else:
            risk_score += 5

        if vol < 15:
            risk_score += 30
        elif vol < 25:
            risk_score += 20
        elif vol < 40:
            risk_score += 10
        else:
            risk_score += 5

        # Convert to grade
        if risk_score >= 45:
            return 'A'
        elif risk_score >= 35:
            return 'B'
        elif risk_score >= 25:
            return 'C'
        elif risk_score >= 15:
            return 'D'
        else:
            return 'F'

    def _generate_risk_warnings(
        self,
        var_metrics: Dict,
        volatility_metrics: Dict,
        beta: Dict
    ) -> List[str]:
        """Generate risk warnings based on analysis."""
        warnings = []

        if var_metrics.get('var_percent', 0) > 10:
            warnings.append('HIGH RISK: Daily VaR exceeds 10% of portfolio value')

        if volatility_metrics.get('annualized', 0) > 40:
            warnings.append('HIGH VOLATILITY: Annualized volatility exceeds 40%')

        if beta.get('beta', 1.0) > 1.5:
            warnings.append('HIGH BETA: Portfolio is 50% more volatile than market')

        if not warnings:
            warnings.append('No significant risk warnings at this time')

        return warnings

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate risk analysis parameters."""
        if 'positions' not in params:
            self.logger.error("Missing required field: positions")
            return False

        confidence = params.get('confidence_level', 0.95)
        if confidence not in [0.90, 0.95, 0.99]:
            self.logger.error(f"Invalid confidence level: {confidence}")
            return False

        return True
