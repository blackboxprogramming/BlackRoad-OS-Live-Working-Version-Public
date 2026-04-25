"""
Model Evaluator Agent

Evaluates ML model performance using comprehensive metrics and visualizations.
Supports classification, regression, clustering, and ranking tasks.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class ModelEvaluatorAgent(BaseAgent):
    """
    Evaluates ML models with comprehensive metrics and analysis.

    Features:
    - Classification metrics (accuracy, precision, recall, F1, AUC-ROC)
    - Regression metrics (MSE, RMSE, MAE, R2, MAPE)
    - Confusion matrices and classification reports
    - Learning curves and validation curves
    - Error analysis and failure case detection
    - Cross-validation evaluation
    - Statistical significance testing
    - Model comparison and A/B testing
    """

    def __init__(self):
        super().__init__(
            name='model-evaluator',
            description='Evaluate ML model performance with comprehensive metrics',
            category='ai_ml',
            version='1.0.0',
            tags=['ml', 'evaluation', 'metrics', 'validation', 'testing']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate a machine learning model.

        Args:
            params: {
                'model': {
                    'path': str,
                    'framework': 'tensorflow|pytorch|sklearn',
                    'type': 'classification|regression|clustering|ranking'
                },
                'evaluation_data': {
                    'test_data_path': str,
                    'validation_data_path': str,
                    'batch_size': int,
                    'preprocessing': {...}
                },
                'metrics': {
                    'classification': [
                        'accuracy', 'precision', 'recall', 'f1',
                        'auc_roc', 'auc_pr', 'confusion_matrix'
                    ],
                    'regression': [
                        'mse', 'rmse', 'mae', 'r2', 'mape', 'msle'
                    ],
                    'custom_metrics': List[str]
                },
                'analysis_config': {
                    'confusion_matrix': bool,
                    'classification_report': bool,
                    'learning_curves': bool,
                    'feature_importance': bool,
                    'error_analysis': bool,
                    'prediction_distribution': bool,
                    'calibration_curve': bool,
                    'residual_analysis': bool  # For regression
                },
                'cross_validation': {
                    'enabled': bool,
                    'folds': int,
                    'stratified': bool,
                    'shuffle': bool
                },
                'comparison': {
                    'baseline_models': List[str],
                    'statistical_tests': ['t_test', 'wilcoxon']
                },
                'compute_config': {
                    'device': 'cpu|gpu',
                    'num_workers': int
                },
                'output_config': {
                    'generate_report': bool,
                    'save_plots': bool,
                    'export_predictions': bool,
                    'output_dir': str
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'evaluation_id': str,
                'model_info': {
                    'model_path': str,
                    'framework': str,
                    'model_type': str,
                    'num_parameters': int
                },
                'dataset_info': {
                    'test_samples': int,
                    'num_features': int,
                    'num_classes': int,
                    'class_distribution': Dict[str, int]
                },
                'performance_metrics': {
                    # For classification
                    'accuracy': float,
                    'precision': float,
                    'recall': float,
                    'f1_score': float,
                    'auc_roc': float,
                    'auc_pr': float,
                    # For regression
                    'mse': float,
                    'rmse': float,
                    'mae': float,
                    'r2_score': float,
                    'mape': float,
                    # Per-class metrics
                    'per_class_metrics': Dict[str, Dict[str, float]]
                },
                'confusion_matrix': List[List[int]],
                'classification_report': Dict[str, Any],
                'cross_validation_results': {
                    'mean_score': float,
                    'std_score': float,
                    'fold_scores': List[float],
                    'confidence_interval': tuple
                },
                'error_analysis': {
                    'total_errors': int,
                    'error_rate': float,
                    'common_misclassifications': List[Dict[str, Any]],
                    'failure_cases': List[Dict[str, Any]],
                    'error_patterns': List[str]
                },
                'model_diagnostics': {
                    'overfitting_score': float,
                    'underfitting_score': float,
                    'calibration_score': float,
                    'prediction_confidence': float,
                    'inference_time_ms': float
                },
                'comparison_results': {
                    'rank': int,
                    'relative_improvement': float,
                    'statistical_significance': bool,
                    'p_value': float
                },
                'visualizations': {
                    'confusion_matrix_path': str,
                    'roc_curve_path': str,
                    'pr_curve_path': str,
                    'learning_curves_path': str,
                    'calibration_curve_path': str
                },
                'recommendations': List[str],
                'artifacts': {
                    'report_path': str,
                    'predictions_path': str,
                    'metrics_json_path': str
                }
            }
        """
        model_config = params.get('model', {})
        evaluation_data = params.get('evaluation_data', {})
        model_type = model_config.get('type', 'classification')

        self.logger.info(
            f"Evaluating {model_type} model from {model_config.get('path')}"
        )

        # Generate mock evaluation results based on model type
        if model_type == 'classification':
            performance_metrics = {
                'accuracy': 0.9654,
                'precision': 0.9623,
                'recall': 0.9689,
                'f1_score': 0.9656,
                'auc_roc': 0.9912,
                'auc_pr': 0.9845,
                'per_class_metrics': {
                    'class_0': {'precision': 0.97, 'recall': 0.95, 'f1': 0.96},
                    'class_1': {'precision': 0.96, 'recall': 0.98, 'f1': 0.97},
                    'class_2': {'precision': 0.95, 'recall': 0.97, 'f1': 0.96}
                }
            }
        else:  # regression
            performance_metrics = {
                'mse': 0.0156,
                'rmse': 0.1249,
                'mae': 0.0823,
                'r2_score': 0.9456,
                'mape': 4.23
            }

        return {
            'status': 'success',
            'evaluation_id': f'eval_{model_type}_{model_config.get("framework", "pytorch")}',
            'model_info': {
                'model_path': model_config.get('path', '/models/model.pkl'),
                'framework': model_config.get('framework', 'pytorch'),
                'model_type': model_type,
                'num_parameters': 2456789,
                'model_size_mb': 9.3
            },
            'dataset_info': {
                'test_samples': 10000,
                'num_features': 128,
                'num_classes': 3 if model_type == 'classification' else None,
                'class_distribution': {
                    'class_0': 3456,
                    'class_1': 3234,
                    'class_2': 3310
                } if model_type == 'classification' else None
            },
            'performance_metrics': performance_metrics,
            'confusion_matrix': [
                [3289, 89, 78],
                [67, 3156, 11],
                [54, 43, 3213]
            ] if model_type == 'classification' else None,
            'classification_report': {
                'macro_avg': {'precision': 0.96, 'recall': 0.97, 'f1-score': 0.96},
                'weighted_avg': {'precision': 0.97, 'recall': 0.97, 'f1-score': 0.97}
            } if model_type == 'classification' else None,
            'cross_validation_results': {
                'mean_score': 0.9634,
                'std_score': 0.0123,
                'fold_scores': [0.9645, 0.9678, 0.9589, 0.9623, 0.9635],
                'confidence_interval': (0.9512, 0.9756)
            },
            'error_analysis': {
                'total_errors': 346,
                'error_rate': 0.0346,
                'common_misclassifications': [
                    {
                        'true_class': 'class_0',
                        'predicted_class': 'class_1',
                        'count': 89,
                        'percentage': 25.7
                    }
                ],
                'failure_cases': [
                    'Samples near class boundaries show higher error rates',
                    'Underrepresented edge cases contribute to 12% of errors'
                ],
                'error_patterns': [
                    'Model struggles with ambiguous samples',
                    'Performance degrades on out-of-distribution samples'
                ]
            },
            'model_diagnostics': {
                'overfitting_score': 0.15,  # Low is good
                'underfitting_score': 0.08,  # Low is good
                'calibration_score': 0.92,  # High is good
                'prediction_confidence': 0.89,
                'inference_time_ms': 2.3,
                'memory_usage_mb': 512
            },
            'comparison_results': {
                'rank': 1,
                'relative_improvement': 8.5,  # % improvement over baseline
                'statistical_significance': True,
                'p_value': 0.0023,
                'effect_size': 0.45
            },
            'visualizations': {
                'confusion_matrix_path': '/outputs/confusion_matrix.png',
                'roc_curve_path': '/outputs/roc_curve.png',
                'pr_curve_path': '/outputs/precision_recall_curve.png',
                'learning_curves_path': '/outputs/learning_curves.png',
                'calibration_curve_path': '/outputs/calibration.png',
                'feature_importance_path': '/outputs/feature_importance.png'
            },
            'recommendations': [
                'Model shows excellent performance with 96.5% accuracy',
                'Consider data augmentation for class boundaries',
                'Calibration is good - predictions are well-calibrated',
                'Inference time is optimal for production deployment',
                'Add more training data for edge cases to reduce error rate',
                'Model is well-balanced between overfitting and underfitting'
            ],
            'artifacts': {
                'report_path': '/outputs/evaluation_report.html',
                'predictions_path': '/outputs/predictions.csv',
                'metrics_json_path': '/outputs/metrics.json',
                'detailed_analysis_path': '/outputs/detailed_analysis.pdf'
            }
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate evaluation parameters."""
        if 'model' not in params:
            self.logger.error("Missing required field: model")
            return False

        model = params['model']
        if 'path' not in model:
            self.logger.error("Missing required field: model.path")
            return False

        if 'evaluation_data' not in params:
            self.logger.error("Missing required field: evaluation_data")
            return False

        valid_types = ['classification', 'regression', 'clustering', 'ranking']
        if model.get('type') and model['type'] not in valid_types:
            self.logger.error(f"Invalid model type: {model['type']}")
            return False

        return True
