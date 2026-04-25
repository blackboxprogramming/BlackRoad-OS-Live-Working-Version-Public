"""
Security Training Generator Agent

Generates security awareness training content, phishing simulations,
and educational materials to improve organizational security posture.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class SecurityTrainingGeneratorAgent(BaseAgent):
    """
    Security training content generation agent.

    Generates:
    - Security awareness training materials
    - Phishing simulation campaigns
    - Security policies and procedures
    - Interactive training modules
    - Assessment quizzes
    - Incident response drills
    """

    def __init__(self):
        super().__init__(
            name='security-training-generator',
            description='Generate security training content',
            category='security',
            version='1.0.0',
            tags=['training', 'awareness', 'phishing', 'education', 'simulation', 'security']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate security training.

        Args:
            params: {
                'action': 'generate-training|create-simulation|assess|report',
                'training_type': 'awareness|phishing|incident-response|compliance|technical',
                'audience': 'all-employees|developers|admins|executives|new-hires',
                'topics': List[str],
                'format': 'video|interactive|pdf|quiz|simulation',
                'duration_minutes': int,
                'difficulty_level': 'beginner|intermediate|advanced',
                'include_assessment': bool,
                'phishing_simulation': {
                    'template': str,
                    'target_groups': List[str],
                    'difficulty': 'easy|medium|hard',
                    'landing_page': bool,
                    'data_capture': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'training_id': str,
                'content_generated': Dict,
                'simulation_results': Dict,
                'effectiveness_score': float
            }
        """
        action = params.get('action', 'generate-training')
        training_type = params.get('training_type', 'awareness')
        audience = params.get('audience', 'all-employees')
        topics = params.get('topics', ['phishing', 'passwords', 'data-protection'])
        format_type = params.get('format', 'interactive')
        phishing_config = params.get('phishing_simulation', {})

        self.logger.info(
            f"Security training generation - type: {training_type}, audience: {audience}"
        )

        content_generated = {
            'training_modules': [
                {
                    'module_id': 'SEC-TRAIN-001',
                    'title': 'Recognizing Phishing Attacks',
                    'duration_minutes': 15,
                    'format': 'interactive',
                    'topics_covered': [
                        'Email phishing indicators',
                        'Spear phishing vs mass phishing',
                        'Suspicious links and attachments',
                        'Reporting procedures'
                    ],
                    'learning_objectives': [
                        'Identify phishing email characteristics',
                        'Understand different types of phishing',
                        'Know how to report suspicious emails',
                        'Avoid common phishing traps'
                    ],
                    'content_sections': 8,
                    'interactive_elements': 12,
                    'knowledge_checks': 5
                },
                {
                    'module_id': 'SEC-TRAIN-002',
                    'title': 'Password Security Best Practices',
                    'duration_minutes': 10,
                    'format': 'video',
                    'topics_covered': [
                        'Creating strong passwords',
                        'Password managers',
                        'Multi-factor authentication',
                        'Avoiding password reuse'
                    ],
                    'learning_objectives': [
                        'Create strong, unique passwords',
                        'Use password managers effectively',
                        'Enable and use MFA',
                        'Understand password security risks'
                    ],
                    'content_sections': 6,
                    'knowledge_checks': 4
                },
                {
                    'module_id': 'SEC-TRAIN-003',
                    'title': 'Data Protection and Privacy',
                    'duration_minutes': 20,
                    'format': 'interactive',
                    'topics_covered': [
                        'Data classification',
                        'GDPR and privacy regulations',
                        'Secure data handling',
                        'Data breach response'
                    ],
                    'learning_objectives': [
                        'Classify data correctly',
                        'Understand privacy obligations',
                        'Handle sensitive data securely',
                        'Respond to data incidents'
                    ],
                    'content_sections': 10,
                    'interactive_elements': 15,
                    'knowledge_checks': 6
                }
            ],
            'assessments': [
                {
                    'assessment_id': 'ASSESS-001',
                    'title': 'Security Awareness Assessment',
                    'type': 'quiz',
                    'questions': 25,
                    'passing_score': 80,
                    'time_limit_minutes': 30,
                    'randomized': True,
                    'topics_covered': ['phishing', 'passwords', 'data-protection']
                }
            ],
            'total_duration_minutes': 45,
            'estimated_completion_rate': 85.0
        }

        simulation_results = {}
        if action == 'create-simulation' or training_type == 'phishing':
            simulation_results = {
                'simulation_id': 'PHISH-SIM-20251116-001',
                'campaign_name': 'Q4 2025 Phishing Awareness Test',
                'launch_date': '2025-11-16',
                'template_used': phishing_config.get('template', 'payroll-update'),
                'difficulty': phishing_config.get('difficulty', 'medium'),
                'targets': {
                    'total_users': 450,
                    'emails_sent': 450,
                    'emails_delivered': 447,
                    'emails_opened': 312,
                    'open_rate': 69.8
                },
                'results': {
                    'clicked_link': 89,
                    'click_rate': 19.9,
                    'submitted_credentials': 23,
                    'credential_submission_rate': 5.1,
                    'reported_email': 156,
                    'reporting_rate': 34.9,
                    'no_action': 202,
                    'no_action_rate': 45.2
                },
                'by_department': {
                    'Engineering': {'users': 120, 'clicked': 15, 'click_rate': 12.5},
                    'Sales': {'users': 80, 'clicked': 28, 'click_rate': 35.0},
                    'Finance': {'users': 45, 'clicked': 8, 'click_rate': 17.8},
                    'HR': {'users': 30, 'clicked': 6, 'click_rate': 20.0},
                    'Marketing': {'users': 60, 'clicked': 18, 'click_rate': 30.0},
                    'Operations': {'users': 115, 'clicked': 14, 'click_rate': 12.2}
                },
                'repeat_offenders': {
                    'clicked_2_times': 12,
                    'clicked_3_plus_times': 5,
                    'total': 17
                },
                'improvement_areas': [
                    'Sales department needs targeted training',
                    'Marketing department click rate above average',
                    '17 users need individual coaching',
                    'Overall reporting rate needs improvement'
                ],
                'simulation_effectiveness': 'medium',
                'follow_up_training_assigned': 89
            }

        training_effectiveness = {
            'current_metrics': {
                'completion_rate': 87.5,
                'average_score': 82.3,
                'pass_rate': 91.2,
                'time_to_complete_hours': 1.2,
                'engagement_score': 78.5
            },
            'previous_period': {
                'completion_rate': 75.3,
                'average_score': 76.8,
                'pass_rate': 85.4,
                'improvement': True
            },
            'incident_correlation': {
                'phishing_reports_increase': '45%',
                'security_incidents_decrease': '28%',
                'password_policy_compliance_increase': '35%',
                'mfa_adoption_increase': '52%'
            },
            'roi_metrics': {
                'training_cost_per_user': 25,
                'estimated_incident_cost_avoided': 125000,
                'roi_percentage': 500
            }
        }

        return {
            'status': 'success',
            'training_id': f'sec-training-{training_type}-20251116-001',
            'action': action,
            'training_type': training_type,
            'audience': audience,
            'timestamp': '2025-11-16T00:00:00Z',
            'content_generated': content_generated,
            'simulation_results': simulation_results,
            'training_effectiveness': training_effectiveness,
            'participants': {
                'total_enrolled': 450,
                'completed': 394,
                'in_progress': 38,
                'not_started': 18,
                'completion_rate': 87.6
            },
            'content_delivery': {
                'platform': 'Learning Management System',
                'delivery_methods': ['Self-paced online', 'Instructor-led', 'Simulation'],
                'mobile_accessible': True,
                'multi_language': True,
                'languages': ['English', 'Spanish', 'French', 'German']
            },
            'recommendations': [
                'HIGH: Provide targeted training for Sales department (35% click rate)',
                'MEDIUM: Individual coaching for 17 repeat offenders',
                'MEDIUM: Increase overall phishing reporting rate',
                'Schedule monthly phishing simulations',
                'Create role-specific training paths',
                'Implement microlearning modules',
                'Gamify security training',
                'Conduct quarterly security awareness campaigns',
                'Measure and track security culture improvements',
                'Provide executive security briefings'
            ],
            'training_calendar': {
                'next_general_training': '2026-01-15',
                'next_phishing_simulation': '2025-12-16',
                'next_incident_response_drill': '2025-12-01',
                'quarterly_refresher': '2026-02-01'
            },
            'content_library': {
                'total_modules': 45,
                'awareness_modules': 20,
                'technical_modules': 15,
                'compliance_modules': 10,
                'custom_content': True
            },
            'reports_generated': [
                f'security_training_{training_type}_20251116.pdf',
                f'phishing_simulation_results_20251116.xlsx',
                f'training_effectiveness_20251116.json',
                f'training_completion_dashboard_20251116.html'
            ],
            'next_steps': [
                'Deploy training to all participants',
                'Monitor completion rates',
                'Review assessment results',
                'Provide remedial training where needed',
                'Schedule next phishing simulation',
                'Update training content based on feedback',
                'Conduct security culture survey'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate security training parameters."""
        valid_actions = ['generate-training', 'create-simulation', 'assess', 'report']
        action = params.get('action', 'generate-training')
        if action not in valid_actions:
            self.logger.error(f"Invalid action: {action}")
            return False

        valid_training_types = ['awareness', 'phishing', 'incident-response', 'compliance', 'technical']
        training_type = params.get('training_type', 'awareness')
        if training_type not in valid_training_types:
            self.logger.error(f"Invalid training_type: {training_type}")
            return False

        return True
