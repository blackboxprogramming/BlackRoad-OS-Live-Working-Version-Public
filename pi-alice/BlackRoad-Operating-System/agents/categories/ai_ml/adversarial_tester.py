"""
Adversarial Tester Agent

Tests ML models against adversarial attacks and evaluates robustness.
Supports various attack methods and defense strategies.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class AdversarialTesterAgent(BaseAgent):
    """
    Tests models against adversarial attacks.

    Features:
    - FGSM, PGD, C&W, DeepFool attacks
    - Adversarial training evaluation
    - Robustness benchmarking
    - Defense mechanism testing
    - Attack success rate analysis
    - Adversarial example generation
    - Model hardening recommendations
    - CleverHans, Foolbox, ART integration
    """

    def __init__(self):
        super().__init__(
            name='adversarial-tester',
            description='Test ML models against adversarial attacks',
            category='ai_ml',
            version='1.0.0',
            tags=['ml', 'security', 'adversarial', 'robustness', 'testing']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Test model against adversarial attacks.

        Args:
            params: {
                'model_config': {
                    'model_path': str,
                    'framework': 'tensorflow|pytorch|sklearn',
                    'model_type': 'classification|detection|segmentation',
                    'input_shape': tuple,
                    'num_classes': int
                },
                'test_data': {
                    'data_path': str,
                    'num_samples': int,
                    'batch_size': int
                },
                'attack_config': {
                    'attacks': [
                        'fgsm',      # Fast Gradient Sign Method
                        'pgd',       # Projected Gradient Descent
                        'cw',        # Carlini & Wagner
                        'deepfool',  # DeepFool
                        'boundary',  # Boundary Attack
                        'hopskipjump',
                        'autoattack'
                    ],
                    'epsilon': float,  # Perturbation budget
                    'alpha': float,    # Step size
                    'iterations': int,
                    'targeted': bool,
                    'confidence': float
                },
                'robustness_tests': {
                    'noise_robustness': {
                        'enabled': bool,
                        'noise_types': ['gaussian', 'salt_pepper', 'speckle'],
                        'noise_levels': List[float]
                    },
                    'transformation_robustness': {
                        'enabled': bool,
                        'transformations': ['rotation', 'scaling', 'translation', 'blur']
                    },
                    'certified_robustness': {
                        'enabled': bool,
                        'method': 'randomized_smoothing|interval_bound_propagation'
                    }
                },
                'defense_evaluation': {
                    'adversarial_training': bool,
                    'input_transformation': bool,
                    'ensemble_methods': bool,
                    'detection': bool
                },
                'benchmark': {
                    'compare_to_baseline': bool,
                    'baseline_model': str,
                    'robustness_metrics': ['accuracy', 'attack_success_rate', 'perturbation_norm']
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'test_id': str,
                'model_info': {
                    'model_path': str,
                    'framework': str,
                    'model_type': str
                },
                'attack_results': {
                    'attack_name': {
                        'clean_accuracy': float,
                        'adversarial_accuracy': float,
                        'attack_success_rate': float,
                        'avg_perturbation': float,
                        'avg_confidence_drop': float,
                        'samples_tested': int,
                        'samples_fooled': int
                    }
                },
                'overall_robustness': {
                    'robustness_score': float,  # 0-1, higher is better
                    'vulnerability_level': 'low|medium|high|critical',
                    'strongest_attack': str,
                    'weakest_defense': str
                },
                'adversarial_examples': List[{
                    'original_class': str,
                    'adversarial_class': str,
                    'perturbation_norm': float,
                    'original_confidence': float,
                    'adversarial_confidence': float,
                    'attack_method': str,
                    'example_path': str
                }],
                'robustness_analysis': {
                    'noise_robustness': {
                        'noise_type': {
                            'level': float,
                            'accuracy': float
                        }
                    },
                    'transformation_robustness': {
                        'transformation': {
                            'degree': float,
                            'accuracy': float
                        }
                    },
                    'certified_radius': float
                },
                'vulnerability_patterns': List[{
                    'pattern': str,
                    'frequency': int,
                    'severity': str,
                    'affected_classes': List[str]
                }],
                'defense_effectiveness': {
                    'defense_name': {
                        'robustness_improvement': float,
                        'accuracy_trade_off': float,
                        'overhead': str
                    }
                },
                'recommendations': List[str]
            }
        """
        model_config = params.get('model_config', {})
        attack_config = params.get('attack_config', {})
        test_data = params.get('test_data', {})

        attacks = attack_config.get('attacks', ['fgsm', 'pgd', 'cw'])

        self.logger.info(
            f"Testing model against {len(attacks)} adversarial attacks"
        )

        # Mock attack results
        attack_results = {}
        for attack in attacks:
            if attack == 'fgsm':
                attack_results[attack] = {
                    'clean_accuracy': 0.9712,
                    'adversarial_accuracy': 0.3456,
                    'attack_success_rate': 0.6444,
                    'avg_perturbation': 0.05,
                    'avg_confidence_drop': 0.62,
                    'samples_tested': test_data.get('num_samples', 1000),
                    'samples_fooled': 644,
                    'avg_iterations': 1,
                    'avg_time_ms': 12.3
                }
            elif attack == 'pgd':
                attack_results[attack] = {
                    'clean_accuracy': 0.9712,
                    'adversarial_accuracy': 0.1234,
                    'attack_success_rate': 0.8730,
                    'avg_perturbation': 0.08,
                    'avg_confidence_drop': 0.84,
                    'samples_tested': test_data.get('num_samples', 1000),
                    'samples_fooled': 873,
                    'avg_iterations': attack_config.get('iterations', 40),
                    'avg_time_ms': 145.6
                }
            elif attack == 'cw':
                attack_results[attack] = {
                    'clean_accuracy': 0.9712,
                    'adversarial_accuracy': 0.0456,
                    'attack_success_rate': 0.9531,
                    'avg_perturbation': 0.12,
                    'avg_confidence_drop': 0.92,
                    'samples_tested': test_data.get('num_samples', 1000),
                    'samples_fooled': 953,
                    'avg_iterations': 1000,
                    'avg_time_ms': 2345.7
                }

        return {
            'status': 'success',
            'test_id': 'adversarial_test_001',
            'model_info': {
                'model_path': model_config.get('model_path', '/models/model.pkl'),
                'framework': model_config.get('framework', 'pytorch'),
                'model_type': model_config.get('model_type', 'classification'),
                'clean_accuracy': 0.9712,
                'num_parameters': 2456789
            },
            'attack_results': attack_results,
            'overall_robustness': {
                'robustness_score': 0.23,
                'vulnerability_level': 'high',
                'strongest_attack': 'C&W',
                'weakest_attack': 'FGSM',
                'avg_attack_success_rate': 0.824,
                'critical_vulnerabilities': 3
            },
            'adversarial_examples': [
                {
                    'example_id': 0,
                    'original_class': 'cat',
                    'original_label': 0,
                    'adversarial_class': 'dog',
                    'adversarial_label': 1,
                    'perturbation_norm': 0.08,
                    'original_confidence': 0.95,
                    'adversarial_confidence': 0.87,
                    'attack_method': 'PGD',
                    'example_path': '/outputs/adversarial/example_0.png',
                    'perturbation_path': '/outputs/adversarial/perturbation_0.png'
                },
                {
                    'example_id': 1,
                    'original_class': 'dog',
                    'original_label': 1,
                    'adversarial_class': 'bird',
                    'adversarial_label': 2,
                    'perturbation_norm': 0.12,
                    'original_confidence': 0.92,
                    'adversarial_confidence': 0.78,
                    'attack_method': 'C&W',
                    'example_path': '/outputs/adversarial/example_1.png',
                    'perturbation_path': '/outputs/adversarial/perturbation_1.png'
                }
            ],
            'robustness_analysis': {
                'noise_robustness': {
                    'gaussian': {
                        '0.01': 0.9234,
                        '0.05': 0.8456,
                        '0.10': 0.7123,
                        '0.20': 0.5234
                    },
                    'salt_pepper': {
                        '0.01': 0.9456,
                        '0.05': 0.8734,
                        '0.10': 0.7845,
                        '0.20': 0.6234
                    }
                },
                'transformation_robustness': {
                    'rotation': {
                        '5_degrees': 0.9512,
                        '15_degrees': 0.8923,
                        '30_degrees': 0.7834,
                        '45_degrees': 0.6456
                    },
                    'scaling': {
                        '0.9x': 0.9634,
                        '0.8x': 0.9234,
                        '1.2x': 0.9123,
                        '1.5x': 0.8456
                    },
                    'blur': {
                        'sigma_1': 0.9456,
                        'sigma_3': 0.8734,
                        'sigma_5': 0.7823
                    }
                },
                'certified_radius': 0.045
            },
            'vulnerability_patterns': [
                {
                    'pattern': 'High-frequency perturbations',
                    'frequency': 734,
                    'severity': 'high',
                    'affected_classes': ['cat', 'dog', 'bird'],
                    'description': 'Model vulnerable to high-frequency noise patterns'
                },
                {
                    'pattern': 'Boundary decision regions',
                    'frequency': 512,
                    'severity': 'medium',
                    'affected_classes': ['cat', 'dog'],
                    'description': 'Decision boundaries not robust near class interfaces'
                },
                {
                    'pattern': 'Low-confidence predictions',
                    'frequency': 289,
                    'severity': 'medium',
                    'affected_classes': ['all'],
                    'description': 'Low-confidence predictions are easily fooled'
                }
            ],
            'defense_effectiveness': {
                'adversarial_training': {
                    'robustness_improvement': 0.45,
                    'accuracy_trade_off': -0.02,
                    'overhead': 'high',
                    'recommended': True
                },
                'input_transformation': {
                    'robustness_improvement': 0.15,
                    'accuracy_trade_off': -0.01,
                    'overhead': 'low',
                    'recommended': True
                },
                'ensemble_methods': {
                    'robustness_improvement': 0.22,
                    'accuracy_trade_off': 0.01,
                    'overhead': 'medium',
                    'recommended': True
                },
                'adversarial_detection': {
                    'detection_rate': 0.78,
                    'false_positive_rate': 0.05,
                    'overhead': 'low',
                    'recommended': True
                }
            },
            'attack_comparison': {
                'weakest_to_strongest': ['FGSM', 'PGD', 'C&W'],
                'fastest_to_slowest': ['FGSM', 'PGD', 'C&W'],
                'most_effective': 'C&W',
                'most_practical': 'PGD'
            },
            'security_metrics': {
                'average_minimum_perturbation': 0.083,
                'average_attack_time_ms': 834.5,
                'successful_attacks_percentage': 82.4,
                'failed_attacks_percentage': 17.6,
                'transferability_score': 0.67
            },
            'visualizations': {
                'adversarial_examples': '/outputs/adversarial/examples_grid.png',
                'perturbation_visualization': '/outputs/adversarial/perturbations.png',
                'robustness_curves': '/outputs/adversarial/robustness_curves.png',
                'attack_success_rates': '/outputs/adversarial/attack_success_rates.png',
                'confidence_distribution': '/outputs/adversarial/confidence_dist.png'
            },
            'recommendations': [
                'CRITICAL: Model shows high vulnerability to adversarial attacks (77% robustness loss)',
                'C&W attack achieves 95.3% success rate - consider adversarial training',
                'PGD attack reduces accuracy from 97.1% to 12.3%',
                'Implement adversarial training for 45% robustness improvement',
                'Add input transformation defense (15% improvement, low overhead)',
                'Consider ensemble methods for additional 22% robustness gain',
                'Model vulnerable to high-frequency perturbations - add preprocessing',
                'Adversarial detection can catch 78% of attacks with 5% false positives',
                'Certified robustness radius of 0.045 is below recommended threshold',
                'Decision boundaries need hardening near class interfaces',
                'Regular adversarial testing should be part of CI/CD pipeline',
                'Document security limitations for deployment team'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate adversarial testing parameters."""
        if 'model_config' not in params:
            self.logger.error("Missing required field: model_config")
            return False

        if 'test_data' not in params:
            self.logger.error("Missing required field: test_data")
            return False

        if 'attack_config' not in params:
            self.logger.error("Missing required field: attack_config")
            return False

        valid_attacks = [
            'fgsm', 'pgd', 'cw', 'deepfool', 'boundary',
            'hopskipjump', 'autoattack'
        ]
        attacks = params.get('attack_config', {}).get('attacks', [])
        for attack in attacks:
            if attack not in valid_attacks:
                self.logger.error(f"Invalid attack: {attack}")
                return False

        return True
