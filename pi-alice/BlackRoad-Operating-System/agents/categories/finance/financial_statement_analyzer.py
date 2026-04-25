"""
Financial Statement Analyzer Agent

Analyzes income statements, balance sheets, and cash flow statements
using financial ratios and metrics.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent
from datetime import datetime


class FinancialStatementAnalyzerAgent(BaseAgent):
    """Analyzes financial statements using comprehensive financial metrics."""

    def __init__(self):
        super().__init__(
            name='financial-statement-analyzer',
            description='Analyze financial statements with ratios and metrics',
            category='finance',
            version='1.0.0',
            tags=['financial-statements', 'ratios', 'analysis', 'fundamentals']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze financial statements.

        Args:
            params: {
                'symbol': 'AAPL',
                'statements': {
                    'income_statement': {...},
                    'balance_sheet': {...},
                    'cash_flow': {...}
                },
                'analysis_type': 'comprehensive|ratios|trends'
            }

        Returns:
            {
                'status': 'success|failed',
                'ratios': {...},
                'analysis': {...},
                'health_score': float
            }
        """
        symbol = params.get('symbol')
        statements = params.get('statements', {})
        analysis_type = params.get('analysis_type', 'comprehensive')

        self.logger.info(f"Analyzing financial statements for {symbol}")

        # Extract statements
        income = statements.get('income_statement', {})
        balance = statements.get('balance_sheet', {})
        cash_flow = statements.get('cash_flow', {})

        # Calculate financial ratios
        profitability = self._calculate_profitability_ratios(income, balance)
        liquidity = self._calculate_liquidity_ratios(balance)
        leverage = self._calculate_leverage_ratios(balance, income)
        efficiency = self._calculate_efficiency_ratios(income, balance)
        valuation = self._calculate_valuation_ratios(income, balance)

        # Analyze cash flow
        cash_flow_analysis = self._analyze_cash_flow(cash_flow)

        # Calculate overall financial health score
        health_score = self._calculate_health_score(
            profitability, liquidity, leverage, efficiency
        )

        # Generate insights
        insights = self._generate_insights(
            profitability, liquidity, leverage, efficiency, health_score
        )

        return {
            'status': 'success',
            'symbol': symbol,
            'profitability_ratios': profitability,
            'liquidity_ratios': liquidity,
            'leverage_ratios': leverage,
            'efficiency_ratios': efficiency,
            'valuation_ratios': valuation,
            'cash_flow_analysis': cash_flow_analysis,
            'health_score': round(health_score, 2),
            'insights': insights,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    def _calculate_profitability_ratios(self, income: Dict, balance: Dict) -> Dict:
        """Calculate profitability ratios."""
        revenue = income.get('revenue', 100e9)
        gross_profit = income.get('gross_profit', 40e9)
        operating_income = income.get('operating_income', 30e9)
        net_income = income.get('net_income', 25e9)
        total_assets = balance.get('total_assets', 350e9)
        total_equity = balance.get('total_equity', 60e9)

        return {
            'gross_margin': round((gross_profit / revenue * 100) if revenue > 0 else 0, 2),
            'operating_margin': round((operating_income / revenue * 100) if revenue > 0 else 0, 2),
            'net_margin': round((net_income / revenue * 100) if revenue > 0 else 0, 2),
            'roa': round((net_income / total_assets * 100) if total_assets > 0 else 0, 2),
            'roe': round((net_income / total_equity * 100) if total_equity > 0 else 0, 2)
        }

    def _calculate_liquidity_ratios(self, balance: Dict) -> Dict:
        """Calculate liquidity ratios."""
        current_assets = balance.get('current_assets', 150e9)
        current_liabilities = balance.get('current_liabilities', 100e9)
        cash = balance.get('cash', 60e9)
        inventory = balance.get('inventory', 5e9)

        quick_assets = current_assets - inventory

        return {
            'current_ratio': round(current_assets / current_liabilities if current_liabilities > 0 else 0, 2),
            'quick_ratio': round(quick_assets / current_liabilities if current_liabilities > 0 else 0, 2),
            'cash_ratio': round(cash / current_liabilities if current_liabilities > 0 else 0, 2),
            'working_capital': round((current_assets - current_liabilities) / 1e9, 2)
        }

    def _calculate_leverage_ratios(self, balance: Dict, income: Dict) -> Dict:
        """Calculate leverage ratios."""
        total_debt = balance.get('total_debt', 120e9)
        total_equity = balance.get('total_equity', 60e9)
        total_assets = balance.get('total_assets', 350e9)
        ebitda = income.get('ebitda', 35e9)
        interest_expense = income.get('interest_expense', 3e9)

        return {
            'debt_to_equity': round(total_debt / total_equity if total_equity > 0 else 0, 2),
            'debt_to_assets': round(total_debt / total_assets if total_assets > 0 else 0, 2),
            'equity_multiplier': round(total_assets / total_equity if total_equity > 0 else 0, 2),
            'debt_to_ebitda': round(total_debt / ebitda if ebitda > 0 else 0, 2),
            'interest_coverage': round(ebitda / interest_expense if interest_expense > 0 else 999, 2)
        }

    def _calculate_efficiency_ratios(self, income: Dict, balance: Dict) -> Dict:
        """Calculate efficiency ratios."""
        revenue = income.get('revenue', 100e9)
        total_assets = balance.get('total_assets', 350e9)
        inventory = balance.get('inventory', 5e9)
        accounts_receivable = balance.get('accounts_receivable', 25e9)
        cogs = income.get('cogs', 60e9)

        return {
            'asset_turnover': round(revenue / total_assets if total_assets > 0 else 0, 2),
            'inventory_turnover': round(cogs / inventory if inventory > 0 else 0, 2),
            'receivables_turnover': round(revenue / accounts_receivable if accounts_receivable > 0 else 0, 2),
            'days_sales_outstanding': round(365 / (revenue / accounts_receivable) if accounts_receivable > 0 else 0, 0)
        }

    def _calculate_valuation_ratios(self, income: Dict, balance: Dict) -> Dict:
        """Calculate valuation ratios."""
        net_income = income.get('net_income', 25e9)
        shares_outstanding = income.get('shares_outstanding', 16e9)
        book_value = balance.get('total_equity', 60e9)
        market_cap = 2500e9  # Mock market cap

        eps = net_income / shares_outstanding if shares_outstanding > 0 else 0
        book_value_per_share = book_value / shares_outstanding if shares_outstanding > 0 else 0
        price = market_cap / shares_outstanding if shares_outstanding > 0 else 0

        return {
            'eps': round(eps, 2),
            'book_value_per_share': round(book_value_per_share, 2),
            'pe_ratio': round(price / eps if eps > 0 else 0, 2),
            'price_to_book': round(price / book_value_per_share if book_value_per_share > 0 else 0, 2),
            'market_cap_billions': round(market_cap / 1e9, 2)
        }

    def _analyze_cash_flow(self, cash_flow: Dict) -> Dict:
        """Analyze cash flow statement."""
        operating_cf = cash_flow.get('operating_cash_flow', 30e9)
        investing_cf = cash_flow.get('investing_cash_flow', -10e9)
        financing_cf = cash_flow.get('financing_cash_flow', -15e9)
        capex = cash_flow.get('capital_expenditures', -8e9)
        net_income = cash_flow.get('net_income', 25e9)

        free_cash_flow = operating_cf + capex

        return {
            'operating_cash_flow': round(operating_cf / 1e9, 2),
            'investing_cash_flow': round(investing_cf / 1e9, 2),
            'financing_cash_flow': round(financing_cf / 1e9, 2),
            'free_cash_flow': round(free_cash_flow / 1e9, 2),
            'fcf_margin': round((free_cash_flow / operating_cf * 100) if operating_cf > 0 else 0, 2),
            'ocf_to_net_income': round(operating_cf / net_income if net_income > 0 else 0, 2),
            'cash_flow_quality': 'excellent' if operating_cf > net_income else 'good' if operating_cf > 0 else 'concerning'
        }

    def _calculate_health_score(
        self,
        profitability: Dict,
        liquidity: Dict,
        leverage: Dict,
        efficiency: Dict
    ) -> float:
        """Calculate overall financial health score (0-100)."""
        score = 0.0

        # Profitability (30 points)
        if profitability['net_margin'] > 20:
            score += 30
        elif profitability['net_margin'] > 10:
            score += 20
        elif profitability['net_margin'] > 5:
            score += 10

        # Liquidity (25 points)
        if liquidity['current_ratio'] > 2.0:
            score += 25
        elif liquidity['current_ratio'] > 1.5:
            score += 20
        elif liquidity['current_ratio'] > 1.0:
            score += 10

        # Leverage (25 points)
        if leverage['debt_to_equity'] < 0.5:
            score += 25
        elif leverage['debt_to_equity'] < 1.0:
            score += 20
        elif leverage['debt_to_equity'] < 2.0:
            score += 10

        # Efficiency (20 points)
        if efficiency['asset_turnover'] > 0.8:
            score += 20
        elif efficiency['asset_turnover'] > 0.5:
            score += 15
        elif efficiency['asset_turnover'] > 0.3:
            score += 10

        return score

    def _generate_insights(
        self,
        profitability: Dict,
        liquidity: Dict,
        leverage: Dict,
        efficiency: Dict,
        health_score: float
    ) -> List[str]:
        """Generate financial insights."""
        insights = []

        # Overall health
        if health_score >= 80:
            insights.append('Excellent financial health with strong fundamentals')
        elif health_score >= 60:
            insights.append('Good financial health with solid fundamentals')
        elif health_score >= 40:
            insights.append('Moderate financial health with some concerns')
        else:
            insights.append('Weak financial health requiring attention')

        # Profitability insights
        if profitability['net_margin'] > 20:
            insights.append('Outstanding profitability margins')
        elif profitability['roe'] > 15:
            insights.append('Strong return on equity')

        # Liquidity insights
        if liquidity['current_ratio'] < 1.0:
            insights.append('WARNING: Current ratio below 1.0 indicates liquidity concerns')
        elif liquidity['quick_ratio'] > 1.5:
            insights.append('Strong liquidity position')

        # Leverage insights
        if leverage['debt_to_equity'] > 2.0:
            insights.append('High leverage may increase financial risk')
        elif leverage['interest_coverage'] > 10:
            insights.append('Excellent ability to service debt')

        return insights

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate financial statement analysis parameters."""
        if 'symbol' not in params:
            self.logger.error("Missing required field: symbol")
            return False

        return True
