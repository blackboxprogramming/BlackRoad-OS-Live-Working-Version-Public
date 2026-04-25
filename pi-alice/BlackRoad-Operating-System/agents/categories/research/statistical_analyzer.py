"""
Statistical Analyzer Agent

Performs rigorous statistical analysis including hypothesis testing,
regression, multivariate analysis, and advanced statistical methods.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class StatisticalAnalyzerAgent(BaseAgent):
    """
    Advanced statistical analysis agent for research.

    Capabilities:
    - Descriptive statistics and visualization
    - Hypothesis testing (t-tests, ANOVA, chi-square)
    - Regression analysis (linear, logistic, multilevel)
    - Multivariate analysis (MANOVA, factor analysis)
    - Non-parametric methods
    - Effect size calculation
    - Power analysis and sample size determination
    - Assumption testing and diagnostics
    """

    def __init__(self):
        super().__init__(
            name='statistical-analyzer',
            description='Perform rigorous statistical analysis',
            category='research',
            version='1.0.0',
            tags=['statistics', 'analysis', 'hypothesis-testing', 'regression', 'research']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform statistical analysis.

        Args:
            params: {
                'analysis_type': 'descriptive|inferential|regression|multivariate|mixed',
                'data_source': str,
                'variables': {
                    'dependent': List[str],
                    'independent': List[str],
                    'covariates': List[str],
                    'grouping': List[str]
                },
                'tests': List[str],  # ['t-test', 'anova', 'regression', 'correlation']
                'assumptions': {
                    'test_normality': bool,
                    'test_homogeneity': bool,
                    'test_independence': bool,
                    'test_linearity': bool
                },
                'parameters': {
                    'alpha': float,
                    'confidence_level': float,
                    'missing_data_method': str,
                    'correction_method': str
                },
                'options': {
                    'effect_sizes': bool,
                    'post_hoc': bool,
                    'diagnostics': bool,
                    'visualizations': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'analysis_id': str,
                'results': Dict,
                'assumption_tests': Dict,
                'effect_sizes': Dict,
                'interpretations': List[str],
                'recommendations': List[str]
            }
        """
        analysis_type = params.get('analysis_type', 'inferential')
        tests = params.get('tests', ['t-test'])
        variables = params.get('variables', {})
        parameters = params.get('parameters', {})
        options = params.get('options', {})

        self.logger.info(
            f"Performing {analysis_type} statistical analysis: {', '.join(tests)}"
        )

        # Mock statistical analysis results
        descriptive_statistics = {
            'sample_size': 245,
            'variables_analyzed': 12,
            'continuous_variables': {
                'academic_performance': {
                    'n': 245,
                    'mean': 79.8,
                    'sd': 8.3,
                    'median': 80.5,
                    'mode': 82.0,
                    'min': 45.2,
                    'max': 98.7,
                    'quartiles': {'q1': 74.2, 'q2': 80.5, 'q3': 86.1},
                    'skewness': -0.15,
                    'kurtosis': 0.23,
                    'ci_95': [78.7, 80.9]
                },
                'engagement': {
                    'n': 245,
                    'mean': 4.2,
                    'sd': 0.7,
                    'median': 4.3,
                    'min': 2.1,
                    'max': 5.0,
                    'quartiles': {'q1': 3.8, 'q2': 4.3, 'q3': 4.7},
                    'skewness': -0.42,
                    'kurtosis': 0.18,
                    'ci_95': [4.11, 4.29]
                }
            },
            'categorical_variables': {
                'group': {
                    'experimental': {'count': 122, 'percentage': 49.8},
                    'control': {'count': 123, 'percentage': 50.2}
                },
                'gender': {
                    'female': {'count': 142, 'percentage': 58.0},
                    'male': {'count': 98, 'percentage': 40.0},
                    'other': {'count': 5, 'percentage': 2.0}
                }
            }
        }

        assumption_tests = {
            'normality': {
                'shapiro_wilk': {
                    'academic_performance': {'W': 0.987, 'p': 0.156, 'result': 'normal'},
                    'engagement': {'W': 0.982, 'p': 0.098, 'result': 'normal'}
                },
                'kolmogorov_smirnov': {
                    'academic_performance': {'D': 0.045, 'p': 0.234, 'result': 'normal'},
                    'engagement': {'D': 0.052, 'p': 0.187, 'result': 'normal'}
                },
                'qq_plots': 'generated',
                'conclusion': 'Data meets normality assumption'
            },
            'homogeneity_of_variance': {
                'levenes_test': {
                    'academic_performance': {'F': 1.23, 'p': 0.268, 'result': 'equal variances'},
                    'engagement': {'F': 0.87, 'p': 0.351, 'result': 'equal variances'}
                },
                'bartletts_test': {
                    'academic_performance': {'chi2': 2.15, 'p': 0.143, 'result': 'equal variances'}
                },
                'conclusion': 'Data meets homogeneity assumption'
            },
            'independence': {
                'durbin_watson': {'statistic': 1.98, 'result': 'independent'},
                'conclusion': 'Observations are independent'
            },
            'linearity': {
                'pearson_correlation': 0.73,
                'residual_plots': 'linear pattern confirmed',
                'conclusion': 'Linear relationship present'
            },
            'multicollinearity': {
                'vif': {
                    'variable_1': 1.23,
                    'variable_2': 1.45,
                    'variable_3': 1.18
                },
                'tolerance': {
                    'variable_1': 0.81,
                    'variable_2': 0.69,
                    'variable_3': 0.85
                },
                'conclusion': 'No multicollinearity detected (all VIF < 10)'
            }
        }

        inferential_results = {
            'independent_t_test': {
                'test': 'Independent samples t-test',
                'groups': ['experimental', 'control'],
                'hypothesis': 'H0: μ1 = μ2 vs H1: μ1 ≠ μ2',
                'statistics': {
                    't_statistic': 3.42,
                    'df': 243,
                    'p_value': 0.0007,
                    'p_value_two_tailed': 0.0014,
                    'critical_value': 1.96
                },
                'group_statistics': {
                    'experimental': {'n': 122, 'mean': 82.4, 'sd': 7.9},
                    'control': {'n': 123, 'mean': 77.2, 'sd': 8.5}
                },
                'mean_difference': 5.2,
                'se_difference': 1.52,
                'ci_95': [2.21, 8.19],
                'effect_size': {
                    'cohens_d': 0.63,
                    'interpretation': 'medium effect',
                    'r': 0.30,
                    'r_squared': 0.09
                },
                'power': 0.92,
                'conclusion': 'Reject null hypothesis',
                'interpretation': 'Experimental group scored significantly higher than control group'
            },
            'anova': {
                'test': 'One-way ANOVA',
                'factor': 'treatment_group',
                'levels': 3,
                'hypothesis': 'H0: All group means are equal',
                'statistics': {
                    'F_statistic': 12.45,
                    'df_between': 2,
                    'df_within': 242,
                    'p_value': 0.000008,
                    'critical_value': 3.03
                },
                'effect_size': {
                    'eta_squared': 0.093,
                    'omega_squared': 0.086,
                    'interpretation': 'medium effect'
                },
                'group_means': {
                    'experimental': 82.4,
                    'control': 77.2,
                    'placebo': 78.1
                },
                'post_hoc': {
                    'method': 'Tukey HSD',
                    'comparisons': [
                        {
                            'groups': ['experimental', 'control'],
                            'mean_diff': 5.2,
                            'p_value': 0.0003,
                            'ci_95': [2.3, 8.1],
                            'significant': True
                        },
                        {
                            'groups': ['experimental', 'placebo'],
                            'mean_diff': 4.3,
                            'p_value': 0.0021,
                            'ci_95': [1.4, 7.2],
                            'significant': True
                        },
                        {
                            'groups': ['control', 'placebo'],
                            'mean_diff': -0.9,
                            'p_value': 0.723,
                            'ci_95': [-3.8, 2.0],
                            'significant': False
                        }
                    ]
                },
                'conclusion': 'Reject null hypothesis',
                'interpretation': 'Significant differences among treatment groups'
            },
            'correlation_analysis': {
                'method': 'Pearson correlation',
                'pairs': [
                    {
                        'variables': ['academic_performance', 'engagement'],
                        'r': 0.73,
                        'r_squared': 0.53,
                        'p_value': 0.000001,
                        'ci_95': [0.66, 0.79],
                        'interpretation': 'strong positive correlation'
                    },
                    {
                        'variables': ['academic_performance', 'self_efficacy'],
                        'r': 0.58,
                        'r_squared': 0.34,
                        'p_value': 0.00001,
                        'ci_95': [0.48, 0.67],
                        'interpretation': 'moderate positive correlation'
                    }
                ]
            }
        }

        regression_results = {
            'multiple_regression': {
                'model': 'Multiple linear regression',
                'dependent_variable': 'academic_performance',
                'independent_variables': ['engagement', 'self_efficacy', 'prior_achievement'],
                'model_fit': {
                    'r_squared': 0.68,
                    'adjusted_r_squared': 0.67,
                    'f_statistic': 165.3,
                    'p_value': 0.000001,
                    'rmse': 4.72,
                    'aic': 1245.3,
                    'bic': 1268.7
                },
                'coefficients': [
                    {
                        'variable': 'intercept',
                        'b': 12.34,
                        'se': 3.21,
                        't': 3.84,
                        'p': 0.0001,
                        'beta': 0.00,
                        'ci_95': [6.02, 18.66]
                    },
                    {
                        'variable': 'engagement',
                        'b': 6.45,
                        'se': 0.87,
                        't': 7.41,
                        'p': 0.000001,
                        'beta': 0.51,
                        'ci_95': [4.74, 8.16],
                        'interpretation': 'strongest predictor'
                    },
                    {
                        'variable': 'self_efficacy',
                        'b': 3.21,
                        'se': 0.65,
                        't': 4.94,
                        'p': 0.00001,
                        'beta': 0.28,
                        'ci_95': [1.93, 4.49]
                    },
                    {
                        'variable': 'prior_achievement',
                        'b': 0.42,
                        'se': 0.08,
                        't': 5.25,
                        'p': 0.000001,
                        'beta': 0.34,
                        'ci_95': [0.26, 0.58]
                    }
                ],
                'diagnostics': {
                    'residuals_normal': True,
                    'heteroscedasticity': 'none detected (Breusch-Pagan p=0.234)',
                    'influential_cases': 3,
                    'cooks_distance_max': 0.15
                },
                'interpretation': 'Model explains 68% of variance in academic performance'
            }
        }

        return {
            'status': 'success',
            'analysis_id': 'STAT-20251116-001',
            'timestamp': '2025-11-16T00:00:00Z',
            'analysis_type': analysis_type,
            'sample_size': 245,
            'alpha_level': parameters.get('alpha', 0.05),
            'descriptive_statistics': descriptive_statistics,
            'assumption_tests': assumption_tests,
            'inferential_results': inferential_results,
            'regression_results': regression_results,
            'effect_sizes': {
                'primary_analysis': {
                    'cohens_d': 0.63,
                    'interpretation': 'medium effect',
                    'practical_significance': 'meaningful difference'
                },
                'anova': {
                    'eta_squared': 0.093,
                    'interpretation': 'medium effect'
                }
            },
            'power_analysis': {
                'achieved_power': 0.92,
                'target_power': 0.80,
                'conclusion': 'Adequate power to detect effects'
            },
            'missing_data': {
                'total_cases': 250,
                'complete_cases': 245,
                'missing_rate': 0.02,
                'missing_pattern': 'Missing Completely At Random (MCAR)',
                'handling_method': 'Listwise deletion',
                'little_mcar_test': {'chi2': 12.3, 'p': 0.423, 'result': 'MCAR confirmed'}
            },
            'visualizations': [
                'histogram_academic_performance.png',
                'boxplot_by_group.png',
                'scatter_engagement_vs_performance.png',
                'qq_plot_residuals.png',
                'regression_diagnostics.png'
            ],
            'interpretations': [
                'Experimental group showed significantly better performance (p < 0.001)',
                'Effect size of d=0.63 indicates meaningful practical difference',
                'All statistical assumptions were met',
                'Model explains 68% of variance in outcomes',
                'Engagement is the strongest predictor of performance',
                'Results are robust to assumption violations'
            ],
            'statistical_significance_summary': {
                'significant_tests': 5,
                'non_significant_tests': 1,
                'alpha_level': 0.05,
                'multiple_comparison_correction': 'Bonferroni',
                'adjusted_alpha': 0.0083
            },
            'recommendations': [
                'Report effect sizes alongside p-values',
                'Consider replication with larger sample',
                'Examine moderating variables',
                'Conduct sensitivity analysis',
                'Report confidence intervals for all estimates',
                'Consider longitudinal analysis for causal claims',
                'Investigate mechanisms through mediation analysis',
                'Pre-register future confirmatory analyses'
            ],
            'limitations': [
                'Cross-sectional design limits causal inference',
                'Self-report measures may introduce bias',
                'Sample limited to specific population',
                'Potential unmeasured confounders',
                '2% missing data may introduce minor bias'
            ],
            'tables_generated': [
                'descriptive_statistics_table.csv',
                'correlation_matrix.csv',
                'regression_coefficients_table.csv',
                'anova_summary_table.csv',
                'post_hoc_comparisons_table.csv'
            ],
            'software_used': {
                'statistical_package': 'Advanced Statistical Analysis Engine v1.0',
                'methods': ['t-test', 'ANOVA', 'regression', 'correlation'],
                'reproducibility': 'Analysis script and data available'
            }
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate statistical analysis parameters."""
        valid_analysis_types = ['descriptive', 'inferential', 'regression', 'multivariate', 'mixed']
        analysis_type = params.get('analysis_type', 'inferential')
        if analysis_type not in valid_analysis_types:
            self.logger.error(f"Invalid analysis_type: {analysis_type}")
            return False

        valid_tests = ['t-test', 'anova', 'chi-square', 'correlation', 'regression',
                       'manova', 'factor-analysis', 'sem']
        tests = params.get('tests', [])
        for test in tests:
            if test not in valid_tests:
                self.logger.error(f"Invalid test: {test}")
                return False

        return True
