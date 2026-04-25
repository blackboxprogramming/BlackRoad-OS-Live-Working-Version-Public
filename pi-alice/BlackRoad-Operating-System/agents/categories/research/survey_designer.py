"""
Survey Designer Agent

Designs psychometrically sound research surveys and questionnaires
with validated scales, proper formatting, and response options.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class SurveyDesignerAgent(BaseAgent):
    """
    Research survey and questionnaire design agent.

    Capabilities:
    - Survey structure and flow design
    - Question development and validation
    - Scale selection and adaptation
    - Response format optimization
    - Psychometric property assessment
    - Pilot testing and refinement
    - Multi-language adaptation
    """

    def __init__(self):
        super().__init__(
            name='survey-designer',
            description='Design psychometrically sound research surveys',
            category='research',
            version='1.0.0',
            tags=['survey', 'questionnaire', 'measurement', 'psychometrics', 'research']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Design a research survey.

        Args:
            params: {
                'survey_purpose': str,
                'constructs': List[Dict],
                'target_population': str,
                'survey_type': 'cross-sectional|longitudinal|repeated-measures',
                'delivery_method': 'online|paper|interview|mixed',
                'response_formats': List[str],
                'length_target': int,  # minutes
                'psychometric_requirements': {
                    'reliability_target': float,
                    'validity_types': List[str],
                    'factor_structure': str
                },
                'options': {
                    'include_demographics': bool,
                    'include_validated_scales': bool,
                    'pilot_test': bool,
                    'multi_language': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'survey_id': str,
                'survey_structure': Dict,
                'questions': List[Dict],
                'psychometric_assessment': Dict,
                'recommendations': List[str]
            }
        """
        survey_purpose = params.get('survey_purpose')
        constructs = params.get('constructs', [])
        target_population = params.get('target_population')
        options = params.get('options', {})

        self.logger.info(
            f"Designing survey for: {survey_purpose}"
        )

        # Mock survey design
        survey_structure = {
            'title': 'Student Engagement and Academic Performance Survey',
            'sections': [
                {
                    'section_id': 1,
                    'title': 'Introduction and Consent',
                    'purpose': 'Inform participants and obtain consent',
                    'estimated_time': 2
                },
                {
                    'section_id': 2,
                    'title': 'Demographics',
                    'purpose': 'Collect participant characteristics',
                    'question_count': 8,
                    'estimated_time': 3
                },
                {
                    'section_id': 3,
                    'title': 'Academic Engagement Scale',
                    'purpose': 'Measure student engagement',
                    'construct': 'engagement',
                    'question_count': 15,
                    'response_format': 'Likert 5-point',
                    'estimated_time': 5
                },
                {
                    'section_id': 4,
                    'title': 'Academic Self-Efficacy',
                    'purpose': 'Assess self-efficacy beliefs',
                    'construct': 'self_efficacy',
                    'question_count': 12,
                    'response_format': 'Likert 7-point',
                    'estimated_time': 4
                },
                {
                    'section_id': 5,
                    'title': 'Learning Strategies',
                    'purpose': 'Identify learning approaches',
                    'construct': 'learning_strategies',
                    'question_count': 10,
                    'response_format': 'Multiple choice',
                    'estimated_time': 4
                },
                {
                    'section_id': 6,
                    'title': 'Open-Ended Feedback',
                    'purpose': 'Gather qualitative insights',
                    'question_count': 3,
                    'estimated_time': 5
                }
            ],
            'total_questions': 48,
            'estimated_completion_time': 23,
            'format': 'online',
            'platform': 'Qualtrics/LimeSurvey compatible'
        }

        sample_questions = [
            {
                'question_id': 'Q1',
                'section': 'Demographics',
                'text': 'What is your age?',
                'type': 'numeric',
                'required': True,
                'validation': {'min': 18, 'max': 99},
                'skip_logic': None
            },
            {
                'question_id': 'Q2',
                'section': 'Demographics',
                'text': 'What is your current year of study?',
                'type': 'single_choice',
                'required': True,
                'options': ['First year', 'Second year', 'Third year', 'Fourth year', 'Graduate'],
                'randomize_options': False
            },
            {
                'question_id': 'Q10',
                'section': 'Academic Engagement',
                'text': 'I am engaged and interested in my learning',
                'construct': 'behavioral_engagement',
                'type': 'likert',
                'scale': {
                    'points': 5,
                    'labels': {
                        1: 'Strongly Disagree',
                        2: 'Disagree',
                        3: 'Neither Agree nor Disagree',
                        4: 'Agree',
                        5: 'Strongly Agree'
                    }
                },
                'required': True,
                'reverse_coded': False,
                'validated_scale': 'Student Engagement Instrument (Appleton et al., 2006)'
            },
            {
                'question_id': 'Q11',
                'section': 'Academic Engagement',
                'text': 'I often feel bored in class',
                'construct': 'behavioral_engagement',
                'type': 'likert',
                'scale': {
                    'points': 5,
                    'labels': {
                        1: 'Strongly Disagree',
                        2: 'Disagree',
                        3: 'Neither Agree nor Disagree',
                        4: 'Agree',
                        5: 'Strongly Agree'
                    }
                },
                'required': True,
                'reverse_coded': True,
                'validated_scale': 'Student Engagement Instrument (Appleton et al., 2006)'
            },
            {
                'question_id': 'Q25',
                'section': 'Self-Efficacy',
                'text': 'I am confident I can master the skills taught in my courses',
                'construct': 'academic_self_efficacy',
                'type': 'likert',
                'scale': {
                    'points': 7,
                    'labels': {
                        1: 'Not at all true',
                        4: 'Moderately true',
                        7: 'Completely true'
                    }
                },
                'required': True,
                'validated_scale': 'Academic Self-Efficacy Scale (Chemers et al., 2001)'
            },
            {
                'question_id': 'Q45',
                'section': 'Open-Ended',
                'text': 'Please describe any challenges you have faced in using the learning platform',
                'type': 'text_long',
                'required': False,
                'max_characters': 500,
                'qualitative': True
            }
        ]

        psychometric_assessment = {
            'reliability': {
                'method': 'Cronbach\'s alpha',
                'engagement_scale': {
                    'alpha': 0.89,
                    'interpretation': 'Good internal consistency',
                    'item_total_correlations': {'range': [0.45, 0.78], 'mean': 0.63}
                },
                'self_efficacy_scale': {
                    'alpha': 0.92,
                    'interpretation': 'Excellent internal consistency',
                    'item_total_correlations': {'range': [0.52, 0.82], 'mean': 0.69}
                },
                'test_retest': {
                    'reliability': 0.85,
                    'interval': '2 weeks',
                    'interpretation': 'Stable over time'
                }
            },
            'validity': {
                'content_validity': {
                    'expert_review': 'Conducted with 5 educational psychologists',
                    'cvi': 0.92,
                    'interpretation': 'Excellent content validity'
                },
                'construct_validity': {
                    'factor_analysis': {
                        'method': 'Confirmatory Factor Analysis',
                        'fit_indices': {
                            'cfi': 0.96,
                            'tli': 0.95,
                            'rmsea': 0.05,
                            'srmr': 0.04
                        },
                        'interpretation': 'Good model fit'
                    },
                    'convergent_validity': {
                        'ave': 0.58,
                        'interpretation': 'Adequate convergent validity'
                    },
                    'discriminant_validity': {
                        'fornell_larcker': 'Criterion met',
                        'interpretation': 'Scales measure distinct constructs'
                    }
                },
                'criterion_validity': {
                    'concurrent': {
                        'correlation_with_gpa': 0.54,
                        'p_value': 0.001,
                        'interpretation': 'Moderate positive correlation'
                    },
                    'predictive': {
                        'predicts_future_performance': True,
                        'r_squared': 0.32
                    }
                }
            },
            'response_patterns': {
                'straightlining_detection': 'Implemented',
                'acquiescence_bias': 'Controlled via reverse coding',
                'social_desirability': 'Assessed via Marlowe-Crowne short form',
                'attention_checks': 3
            }
        }

        pilot_test_results = {
            'sample_size': 45,
            'completion_rate': 0.93,
            'average_time_minutes': 21.5,
            'feedback_themes': [
                'Clear instructions',
                'Some questions too similar',
                'Likert scale anchors helpful',
                'Survey length acceptable'
            ],
            'revisions_made': [
                'Removed 3 redundant items',
                'Clarified wording of 5 questions',
                'Added progress bar',
                'Improved introduction'
            ],
            'reliability_pilot': {
                'engagement_alpha': 0.87,
                'self_efficacy_alpha': 0.91
            }
        }

        return {
            'status': 'success',
            'survey_id': 'SURV-20251116-001',
            'survey_purpose': survey_purpose,
            'target_population': target_population,
            'survey_structure': survey_structure,
            'sample_questions': sample_questions,
            'all_questions_count': 48,
            'constructs_measured': [
                {
                    'name': 'Academic Engagement',
                    'dimensions': ['behavioral', 'emotional', 'cognitive'],
                    'items': 15
                },
                {
                    'name': 'Academic Self-Efficacy',
                    'dimensions': ['task', 'social', 'self-regulatory'],
                    'items': 12
                },
                {
                    'name': 'Learning Strategies',
                    'dimensions': ['cognitive', 'metacognitive', 'resource management'],
                    'items': 10
                }
            ],
            'psychometric_assessment': psychometric_assessment,
            'pilot_test_results': pilot_test_results,
            'response_formats': {
                'likert_5_point': 15,
                'likert_7_point': 12,
                'multiple_choice': 10,
                'numeric': 5,
                'text_short': 3,
                'text_long': 3
            },
            'quality_features': [
                'Validated scales from published research',
                'Reverse-coded items to reduce bias',
                'Attention check questions included',
                'Progress bar for completion feedback',
                'Mobile-responsive design',
                'Skip logic for efficiency',
                'Randomization of item order within scales'
            ],
            'ethical_considerations': {
                'informed_consent': 'Embedded in survey introduction',
                'anonymity': 'No personally identifiable information collected',
                'withdrawal': 'Can exit survey at any time',
                'data_storage': 'Encrypted and secure',
                'irb_approval': 'Required before deployment'
            },
            'deployment_plan': {
                'platform': 'Qualtrics/LimeSurvey',
                'distribution_method': 'Email invitation with unique link',
                'reminder_schedule': 'Days 3, 7, and 14',
                'incentive': 'Entry into $100 gift card draw',
                'target_responses': 250,
                'collection_period': '4 weeks'
            },
            'data_management': {
                'coding_scheme': 'Documented in codebook',
                'missing_data': 'Flagged for analysis',
                'reverse_coding': 'Automatic in scoring syntax',
                'composite_scores': 'Calculated via mean of items',
                'outlier_detection': 'Values >3 SD flagged'
            },
            'documentation': [
                'Survey instrument PDF',
                'Codebook with variable definitions',
                'Scoring syntax',
                'Administration protocol',
                'Psychometric validation report',
                'Pilot test report'
            ],
            'recommendations': [
                'Conduct cognitive interviews with 5-10 participants',
                'Pilot test with minimum 30 participants',
                'Calculate required sample size for validation study',
                'Include attention check questions',
                'Randomize question order within scales',
                'Provide estimated completion time upfront',
                'Offer progress indicators',
                'Test survey on multiple devices/browsers',
                'Prepare data cleaning protocol in advance',
                'Pre-register validation study'
            ],
            'next_steps': [
                'Obtain IRB approval',
                'Finalize online survey platform',
                'Conduct full pilot study (n=45)',
                'Revise based on pilot feedback',
                'Launch main data collection',
                'Monitor response rates and quality',
                'Conduct psychometric validation analysis'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate survey design parameters."""
        if 'survey_purpose' not in params:
            self.logger.error("Missing required field: survey_purpose")
            return False

        valid_types = ['cross-sectional', 'longitudinal', 'repeated-measures']
        survey_type = params.get('survey_type', 'cross-sectional')
        if survey_type not in valid_types:
            self.logger.error(f"Invalid survey_type: {survey_type}")
            return False

        return True
