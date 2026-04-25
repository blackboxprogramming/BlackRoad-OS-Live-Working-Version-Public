"""
Options Pricer Agent

Prices options contracts using Black-Scholes, binomial trees,
and Monte Carlo simulation.
"""

from typing import Any, Dict
from agents.base import BaseAgent
from datetime import datetime
import math


class OptionsPricerAgent(BaseAgent):
    """Prices options using industry-standard pricing models."""

    def __init__(self):
        super().__init__(
            name='options-pricer',
            description='Price options contracts using Black-Scholes and other models',
            category='finance',
            version='1.0.0',
            tags=['options', 'derivatives', 'black-scholes', 'pricing']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Price options contracts.

        Args:
            params: {
                'underlying_price': 150.00,
                'strike_price': 155.00,
                'time_to_expiry_days': 30,
                'volatility': 0.25,  # 25% annualized
                'risk_free_rate': 0.05,  # 5%
                'option_type': 'call|put',
                'pricing_model': 'black_scholes|binomial|monte_carlo',
                'dividend_yield': 0.02  # 2%
            }

        Returns:
            {
                'status': 'success|failed',
                'option_price': float,
                'greeks': {...},
                'model_used': str
            }
        """
        underlying = params.get('underlying_price', 100.0)
        strike = params.get('strike_price', 100.0)
        days = params.get('time_to_expiry_days', 30)
        volatility = params.get('volatility', 0.25)
        risk_free = params.get('risk_free_rate', 0.05)
        option_type = params.get('option_type', 'call')
        model = params.get('pricing_model', 'black_scholes')
        dividend_yield = params.get('dividend_yield', 0.0)

        self.logger.info(f"Pricing {option_type} option using {model} model")

        # Convert days to years
        time_to_expiry = days / 365.0

        # Price the option
        if model == 'black_scholes':
            price = self._black_scholes(
                underlying, strike, time_to_expiry,
                volatility, risk_free, dividend_yield, option_type
            )
        elif model == 'binomial':
            price = self._binomial_tree(
                underlying, strike, time_to_expiry,
                volatility, risk_free, option_type
            )
        else:  # monte_carlo
            price = self._monte_carlo(
                underlying, strike, time_to_expiry,
                volatility, risk_free, option_type
            )

        # Calculate Greeks
        greeks = self._calculate_greeks(
            underlying, strike, time_to_expiry,
            volatility, risk_free, dividend_yield, option_type
        )

        # Calculate intrinsic and time value
        intrinsic = self._calculate_intrinsic_value(underlying, strike, option_type)
        time_value = price - intrinsic

        return {
            'status': 'success',
            'option_type': option_type,
            'pricing_model': model,
            'option_price': round(price, 4),
            'intrinsic_value': round(intrinsic, 4),
            'time_value': round(time_value, 4),
            'greeks': greeks,
            'inputs': {
                'underlying_price': underlying,
                'strike_price': strike,
                'time_to_expiry_days': days,
                'volatility': volatility,
                'risk_free_rate': risk_free,
                'dividend_yield': dividend_yield
            },
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _black_scholes(
        self,
        S: float,  # underlying price
        K: float,  # strike price
        T: float,  # time to expiry
        sigma: float,  # volatility
        r: float,  # risk-free rate
        q: float,  # dividend yield
        option_type: str
    ) -> float:
        """Black-Scholes option pricing formula."""
        if T <= 0:
            return max(0, S - K) if option_type == 'call' else max(0, K - S)

        # Calculate d1 and d2
        d1 = (math.log(S / K) + (r - q + 0.5 * sigma ** 2) * T) / (sigma * math.sqrt(T))
        d2 = d1 - sigma * math.sqrt(T)

        # Standard normal CDF approximation
        N_d1 = self._norm_cdf(d1)
        N_d2 = self._norm_cdf(d2)

        if option_type == 'call':
            price = S * math.exp(-q * T) * N_d1 - K * math.exp(-r * T) * N_d2
        else:  # put
            price = K * math.exp(-r * T) * self._norm_cdf(-d2) - S * math.exp(-q * T) * self._norm_cdf(-d1)

        return max(0, price)

    def _norm_cdf(self, x: float) -> float:
        """Cumulative distribution function for standard normal distribution."""
        return (1.0 + math.erf(x / math.sqrt(2.0))) / 2.0

    def _binomial_tree(
        self,
        S: float,
        K: float,
        T: float,
        sigma: float,
        r: float,
        option_type: str,
        steps: int = 100
    ) -> float:
        """Binomial tree option pricing."""
        dt = T / steps
        u = math.exp(sigma * math.sqrt(dt))
        d = 1 / u
        p = (math.exp(r * dt) - d) / (u - d)

        # Initialize asset prices at maturity
        prices = [S * (u ** (steps - 2 * i)) for i in range(steps + 1)]

        # Calculate option values at maturity
        if option_type == 'call':
            values = [max(0, price - K) for price in prices]
        else:
            values = [max(0, K - price) for price in prices]

        # Backward induction
        for _ in range(steps):
            values = [(p * values[i] + (1 - p) * values[i + 1]) * math.exp(-r * dt)
                     for i in range(len(values) - 1)]

        return values[0]

    def _monte_carlo(
        self,
        S: float,
        K: float,
        T: float,
        sigma: float,
        r: float,
        option_type: str,
        simulations: int = 10000
    ) -> float:
        """Monte Carlo option pricing."""
        total_payoff = 0.0

        for _ in range(simulations):
            # Simulate price at expiry
            Z = (2 * (sum([1 if i % 2 == 0 else -1 for i in range(12)])) - 6) / math.sqrt(12)  # Simplified normal
            ST = S * math.exp((r - 0.5 * sigma ** 2) * T + sigma * math.sqrt(T) * Z)

            # Calculate payoff
            if option_type == 'call':
                payoff = max(0, ST - K)
            else:
                payoff = max(0, K - ST)

            total_payoff += payoff

        # Average and discount
        price = (total_payoff / simulations) * math.exp(-r * T)
        return price

    def _calculate_greeks(
        self,
        S: float,
        K: float,
        T: float,
        sigma: float,
        r: float,
        q: float,
        option_type: str
    ) -> Dict[str, float]:
        """Calculate option Greeks."""
        if T <= 0:
            return {'delta': 0, 'gamma': 0, 'theta': 0, 'vega': 0, 'rho': 0}

        d1 = (math.log(S / K) + (r - q + 0.5 * sigma ** 2) * T) / (sigma * math.sqrt(T))
        d2 = d1 - sigma * math.sqrt(T)

        N_d1 = self._norm_cdf(d1)
        n_d1 = math.exp(-0.5 * d1 ** 2) / math.sqrt(2 * math.pi)  # PDF

        # Delta
        if option_type == 'call':
            delta = math.exp(-q * T) * N_d1
        else:
            delta = math.exp(-q * T) * (N_d1 - 1)

        # Gamma
        gamma = (math.exp(-q * T) * n_d1) / (S * sigma * math.sqrt(T))

        # Vega (per 1% change in volatility)
        vega = S * math.exp(-q * T) * n_d1 * math.sqrt(T) / 100

        # Theta (per day)
        if option_type == 'call':
            theta = (-(S * n_d1 * sigma * math.exp(-q * T)) / (2 * math.sqrt(T))
                    - r * K * math.exp(-r * T) * self._norm_cdf(d2)
                    + q * S * math.exp(-q * T) * N_d1) / 365
        else:
            theta = (-(S * n_d1 * sigma * math.exp(-q * T)) / (2 * math.sqrt(T))
                    + r * K * math.exp(-r * T) * self._norm_cdf(-d2)
                    - q * S * math.exp(-q * T) * self._norm_cdf(-d1)) / 365

        # Rho (per 1% change in interest rate)
        if option_type == 'call':
            rho = K * T * math.exp(-r * T) * self._norm_cdf(d2) / 100
        else:
            rho = -K * T * math.exp(-r * T) * self._norm_cdf(-d2) / 100

        return {
            'delta': round(delta, 4),
            'gamma': round(gamma, 4),
            'theta': round(theta, 4),
            'vega': round(vega, 4),
            'rho': round(rho, 4)
        }

    def _calculate_intrinsic_value(self, S: float, K: float, option_type: str) -> float:
        """Calculate intrinsic value of option."""
        if option_type == 'call':
            return max(0, S - K)
        else:
            return max(0, K - S)

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate options pricing parameters."""
        required = ['underlying_price', 'strike_price', 'time_to_expiry_days', 'volatility']
        for field in required:
            if field not in params:
                self.logger.error(f"Missing required field: {field}")
                return False

        return True
