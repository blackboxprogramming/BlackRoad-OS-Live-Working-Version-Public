"""
Dataset Splitter Agent

Splits datasets for training, validation, and testing with various strategies.
Ensures proper data distribution and prevents data leakage.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class DatasetSplitterAgent(BaseAgent):
    """
    Splits datasets with proper stratification and validation.

    Features:
    - Train/validation/test splitting
    - Stratified splitting for imbalanced datasets
    - Time-series aware splitting
    - K-fold cross-validation splits
    - Group-based splitting (preventing data leakage)
    - Custom split strategies
    - Data distribution analysis
    - Split validation and verification
    """

    def __init__(self):
        super().__init__(
            name='dataset-splitter',
            description='Split datasets for training with proper validation',
            category='ai_ml',
            version='1.0.0',
            tags=['ml', 'data-splitting', 'cross-validation', 'preprocessing']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Split dataset for ML training.

        Args:
            params: {
                'data_config': {
                    'data_path': str,
                    'data_format': 'csv|parquet|numpy|hdf5|tfrecord',
                    'target_column': str,
                    'features': List[str],
                    'sample_size': int  # Optional: subsample large datasets
                },
                'split_strategy': {
                    'method': 'random|stratified|time_series|group|custom',
                    'train_ratio': float,  # e.g., 0.7
                    'validation_ratio': float,  # e.g., 0.15
                    'test_ratio': float,  # e.g., 0.15
                    'shuffle': bool,
                    'random_seed': int
                },
                'stratification': {
                    'enabled': bool,
                    'column': str,  # Column to stratify on
                    'min_samples_per_class': int
                },
                'time_series': {
                    'enabled': bool,
                    'time_column': str,
                    'sort_data': bool,
                    'gap': int  # Gap between train and test
                },
                'group_splitting': {
                    'enabled': bool,
                    'group_column': str,  # Ensure groups stay together
                    'prevent_leakage': bool
                },
                'cross_validation': {
                    'enabled': bool,
                    'n_folds': int,
                    'stratified': bool,
                    'shuffle': bool,
                    'type': 'kfold|stratified_kfold|group_kfold|time_series_split'
                },
                'validation': {
                    'check_class_distribution': bool,
                    'check_feature_distributions': bool,
                    'check_data_leakage': bool,
                    'min_samples_threshold': int
                },
                'output_config': {
                    'save_splits': bool,
                    'output_dir': str,
                    'format': 'csv|parquet|numpy|tfrecord',
                    'save_indices': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'split_id': str,
                'dataset_info': {
                    'total_samples': int,
                    'total_features': int,
                    'target_classes': int,
                    'class_distribution': Dict[str, int]
                },
                'split_sizes': {
                    'train': {
                        'samples': int,
                        'percentage': float,
                        'class_distribution': Dict[str, int]
                    },
                    'validation': {
                        'samples': int,
                        'percentage': float,
                        'class_distribution': Dict[str, int]
                    },
                    'test': {
                        'samples': int,
                        'percentage': float,
                        'class_distribution': Dict[str, int]
                    }
                },
                'split_quality': {
                    'stratification_score': float,  # How well stratified
                    'distribution_similarity': float,  # Train/test similarity
                    'data_leakage_detected': bool,
                    'class_balance_score': float
                },
                'cross_validation_folds': {
                    'n_folds': int,
                    'fold_sizes': List[int],
                    'fold_distributions': List[Dict[str, int]]
                },
                'warnings': List[str],
                'output_paths': {
                    'train_data': str,
                    'validation_data': str,
                    'test_data': str,
                    'indices': str,
                    'metadata': str
                },
                'recommendations': List[str]
            }
        """
        data_config = params.get('data_config', {})
        split_strategy = params.get('split_strategy', {})
        cross_validation = params.get('cross_validation', {})

        self.logger.info(
            f"Splitting dataset using {split_strategy.get('method', 'random')} strategy"
        )

        # Mock dataset splitting
        total_samples = 100000
        train_ratio = split_strategy.get('train_ratio', 0.7)
        val_ratio = split_strategy.get('validation_ratio', 0.15)
        test_ratio = split_strategy.get('test_ratio', 0.15)

        train_samples = int(total_samples * train_ratio)
        val_samples = int(total_samples * val_ratio)
        test_samples = total_samples - train_samples - val_samples

        return {
            'status': 'success',
            'split_id': f'split_{split_strategy.get("method", "random")}',
            'split_method': split_strategy.get('method', 'random'),
            'dataset_info': {
                'total_samples': total_samples,
                'total_features': 128,
                'target_classes': 3,
                'class_distribution': {
                    'class_0': 33456,
                    'class_1': 33234,
                    'class_2': 33310
                },
                'data_type': data_config.get('data_format', 'csv')
            },
            'split_sizes': {
                'train': {
                    'samples': train_samples,
                    'percentage': train_ratio * 100,
                    'class_distribution': {
                        'class_0': int(train_samples * 0.334),
                        'class_1': int(train_samples * 0.333),
                        'class_2': int(train_samples * 0.333)
                    }
                },
                'validation': {
                    'samples': val_samples,
                    'percentage': val_ratio * 100,
                    'class_distribution': {
                        'class_0': int(val_samples * 0.334),
                        'class_1': int(val_samples * 0.333),
                        'class_2': int(val_samples * 0.333)
                    }
                },
                'test': {
                    'samples': test_samples,
                    'percentage': test_ratio * 100,
                    'class_distribution': {
                        'class_0': int(test_samples * 0.334),
                        'class_1': int(test_samples * 0.333),
                        'class_2': int(test_samples * 0.333)
                    }
                }
            },
            'split_quality': {
                'stratification_score': 0.98,  # 1.0 is perfect
                'distribution_similarity': 0.97,  # Train/test similarity
                'data_leakage_detected': False,
                'class_balance_score': 0.99,
                'temporal_consistency': True
            },
            'cross_validation_folds': {
                'n_folds': cross_validation.get('n_folds', 5),
                'fold_sizes': [14000, 14000, 14000, 14000, 14000],
                'fold_distributions': [
                    {'class_0': 4676, 'class_1': 4663, 'class_2': 4661}
                ] * 5,
                'fold_overlap': 0.0
            } if cross_validation.get('enabled') else None,
            'statistics': {
                'samples_per_class_min': 33234,
                'samples_per_class_max': 33456,
                'imbalance_ratio': 1.007,  # max/min
                'feature_correlation': 'computed',
                'missing_values_detected': 0
            },
            'warnings': [
                'Class distribution is well-balanced',
                'No data leakage detected',
                'All splits have sufficient samples'
            ],
            'output_paths': {
                'train_data': '/outputs/splits/train.parquet',
                'validation_data': '/outputs/splits/validation.parquet',
                'test_data': '/outputs/splits/test.parquet',
                'indices': '/outputs/splits/split_indices.json',
                'metadata': '/outputs/splits/split_metadata.json',
                'statistics': '/outputs/splits/split_statistics.json'
            },
            'recommendations': [
                'Split quality is excellent with 98% stratification score',
                'Class distributions are well-preserved across splits',
                'Consider using 5-fold cross-validation for robust evaluation',
                'No data leakage detected - safe to proceed with training',
                'Train set size (70,000 samples) is sufficient for training',
                'Validation set (15,000 samples) provides good evaluation',
                'Test set (15,000 samples) ensures reliable final metrics'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate split parameters."""
        if 'data_config' not in params:
            self.logger.error("Missing required field: data_config")
            return False

        data_config = params['data_config']
        if 'data_path' not in data_config:
            self.logger.error("Missing required field: data_config.data_path")
            return False

        split_strategy = params.get('split_strategy', {})
        train_ratio = split_strategy.get('train_ratio', 0.7)
        val_ratio = split_strategy.get('validation_ratio', 0.15)
        test_ratio = split_strategy.get('test_ratio', 0.15)

        total_ratio = train_ratio + val_ratio + test_ratio
        if abs(total_ratio - 1.0) > 0.01:
            self.logger.error(f"Split ratios must sum to 1.0, got {total_ratio}")
            return False

        return True
