"""
Classification Agent

Performs data classification tasks using supervised machine learning
algorithms for categorical prediction.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class ClassificationAgent(BaseAgent):
    """
    Performs data classification tasks.

    Supports:
    - Binary and multi-class classification
    - Multiple algorithms (logistic regression, decision trees, random forest, SVM, neural networks)
    - Feature engineering and selection
    - Model evaluation and validation
    - Class imbalance handling
    - Hyperparameter tuning
    """

    def __init__(self):
        super().__init__(
            name='classification-agent',
            description='Perform data classification tasks',
            category='data',
            version='1.0.0',
            tags=['classification', 'machine-learning', 'supervised-learning', 'prediction']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform classification task.

        Args:
            params: {
                'data_source': str,
                'target_column': str,
                'features': List[str],
                'model': 'logistic_regression|decision_tree|random_forest|svm|xgboost|neural_network|auto',
                'task_type': 'binary|multiclass',
                'options': {
                    'train_test_split': float,
                    'cross_validation': int,
                    'handle_imbalance': bool,
                    'tune_hyperparameters': bool,
                    'feature_selection': bool,
                    'include_probabilities': bool
                },
                'prediction_data': List[Dict[str, Any]]  # Optional: data to classify
            }

        Returns:
            {
                'status': 'success|failed',
                'model_used': str,
                'task_type': str,
                'predictions': List[Dict[str, Any]],
                'model_performance': Dict[str, Any],
                'feature_importance': Dict[str, float],
                'execution_time_seconds': float,
                'insights': List[str]
            }
        """
        data_source = params.get('data_source')
        target_column = params.get('target_column')
        features = params.get('features', [])
        model = params.get('model', 'auto')
        task_type = params.get('task_type', 'binary')
        options = params.get('options', {})
        prediction_data = params.get('prediction_data', [])

        self.logger.info(
            f"Performing {task_type} classification using {model} on '{target_column}'"
        )

        # Mock classification
        num_predictions = len(prediction_data) if prediction_data else 1000
        predictions = self._generate_predictions(num_predictions, task_type, options)

        return {
            'status': 'success',
            'data_source': data_source,
            'target_column': target_column,
            'model_used': 'random_forest' if model == 'auto' else model,
            'task_type': task_type,
            'num_classes': 2 if task_type == 'binary' else 5,
            'features_used': len(features) or 15,
            'execution_time_seconds': 6.7,
            'training_samples': 40000,
            'predictions': predictions[:20],  # Return first 20
            'total_predictions': num_predictions,
            'model_performance': {
                'accuracy': 0.89,
                'precision': 0.87,
                'recall': 0.85,
                'f1_score': 0.86,
                'auc_roc': 0.92,
                'confusion_matrix': {
                    'true_positives': 17000,
                    'true_negatives': 18600,
                    'false_positives': 2000,
                    'false_negatives': 2400
                } if task_type == 'binary' else {},
                'per_class_metrics': {
                    'class_0': {'precision': 0.90, 'recall': 0.88, 'f1': 0.89},
                    'class_1': {'precision': 0.85, 'recall': 0.83, 'f1': 0.84},
                    'class_2': {'precision': 0.88, 'recall': 0.86, 'f1': 0.87}
                } if task_type == 'multiclass' else {}
            },
            'cross_validation_scores': {
                'mean_accuracy': 0.88,
                'std_accuracy': 0.03,
                'fold_scores': [0.87, 0.89, 0.88, 0.87, 0.89]
            } if options.get('cross_validation') else {},
            'feature_importance': {
                'transaction_amount': 0.18,
                'user_age': 0.15,
                'account_age_days': 0.14,
                'previous_purchases': 0.12,
                'login_frequency': 0.11,
                'session_duration': 0.10,
                'device_type': 0.08,
                'location': 0.07,
                'payment_method': 0.05
            },
            'feature_selection': {
                'original_features': 25,
                'selected_features': 15,
                'selection_method': 'recursive_feature_elimination',
                'features_removed': ['feature_23', 'feature_17', 'feature_9']
            } if options.get('feature_selection') else {},
            'class_distribution': {
                'class_0': 0.52,
                'class_1': 0.48
            } if task_type == 'binary' else {
                'class_0': 0.25,
                'class_1': 0.22,
                'class_2': 0.20,
                'class_3': 0.18,
                'class_4': 0.15
            },
            'imbalance_handling': {
                'method': 'smote',
                'original_ratio': 0.3,
                'balanced_ratio': 0.5
            } if options.get('handle_imbalance') else {},
            'hyperparameter_tuning': {
                'method': 'grid_search',
                'parameters_tuned': 5,
                'best_parameters': {
                    'n_estimators': 100,
                    'max_depth': 15,
                    'min_samples_split': 5
                },
                'improvement': 0.04
            } if options.get('tune_hyperparameters') else {},
            'insights': [
                'Model achieves 89% accuracy on test set',
                'Transaction amount is strongest predictor',
                'Good balance between precision and recall',
                'Cross-validation shows consistent performance',
                'Feature selection reduced complexity without accuracy loss'
            ],
            'recommendations': [
                'Monitor model performance on production data',
                'Retrain model monthly with new data',
                'Consider ensemble methods for further improvement',
                'Collect more data for underrepresented classes',
                'Implement A/B test to validate model impact'
            ],
            'model_metadata': {
                'training_date': '2025-11-16',
                'model_version': '1.2.0',
                'framework': 'scikit-learn',
                'next_retrain': '2025-12-16'
            }
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate classification parameters."""
        if 'data_source' not in params:
            self.logger.error("Missing required field: data_source")
            return False

        if 'target_column' not in params:
            self.logger.error("Missing required field: target_column")
            return False

        valid_models = ['logistic_regression', 'decision_tree', 'random_forest',
                       'svm', 'xgboost', 'neural_network', 'auto']
        model = params.get('model', 'auto')

        if model not in valid_models:
            self.logger.error(f"Invalid model: {model}")
            return False

        return True

    def _generate_predictions(
        self,
        count: int,
        task_type: str,
        options: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate mock predictions."""
        predictions = []
        classes = [0, 1] if task_type == 'binary' else [0, 1, 2, 3, 4]

        for i in range(min(count, 20)):
            predicted_class = classes[i % len(classes)]
            confidence = 0.95 - (i % 5) * 0.1

            prediction = {
                'id': i,
                'predicted_class': predicted_class,
                'confidence': round(confidence, 3)
            }

            if options.get('include_probabilities'):
                if task_type == 'binary':
                    prediction['probabilities'] = {
                        'class_0': round(1 - confidence, 3),
                        'class_1': round(confidence, 3)
                    }
                else:
                    probs = {f'class_{j}': round(0.1, 3) for j in classes}
                    probs[f'class_{predicted_class}'] = round(confidence, 3)
                    prediction['probabilities'] = probs

            predictions.append(prediction)

        return predictions
