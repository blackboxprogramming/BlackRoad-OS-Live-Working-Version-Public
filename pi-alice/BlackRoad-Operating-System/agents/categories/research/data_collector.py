"""
Data Collector Agent

Manages systematic research data collection including surveys, observations,
measurements, and multi-modal data gathering with quality assurance.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class DataCollectorAgent(BaseAgent):
    """
    Research data collection and management agent.

    Capabilities:
    - Multi-modal data collection (surveys, observations, sensors)
    - Data quality monitoring and validation
    - Standardized data collection protocols
    - Real-time data capture and storage
    - Participant tracking and management
    - Data completeness monitoring
    - Collection workflow automation
    """

    def __init__(self):
        super().__init__(
            name='data-collector',
            description='Collect and manage research data systematically',
            category='research',
            version='1.0.0',
            tags=['data-collection', 'research', 'measurement', 'survey', 'observation']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute data collection protocol.

        Args:
            params: {
                'study_id': str,
                'collection_methods': List[str],  # ['survey', 'observation', 'measurement', 'interview']
                'participants': {
                    'total': int,
                    'completed': int,
                    'demographic_criteria': Dict
                },
                'instruments': List[Dict],
                'timepoints': List[str],
                'data_types': List[str],  # ['quantitative', 'qualitative', 'mixed']
                'quality_checks': {
                    'validation_rules': List[Dict],
                    'completeness_threshold': float,
                    'consistency_checks': bool
                },
                'options': {
                    'real_time_monitoring': bool,
                    'automated_reminders': bool,
                    'data_encryption': bool,
                    'multi_site': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'collection_id': str,
                'data_collected': Dict,
                'quality_metrics': Dict,
                'completion_status': Dict,
                'issues_detected': List[Dict],
                'recommendations': List[str]
            }
        """
        study_id = params.get('study_id')
        collection_methods = params.get('collection_methods', ['survey'])
        participants = params.get('participants', {})
        options = params.get('options', {})

        self.logger.info(
            f"Collecting data for study {study_id} using methods: {', '.join(collection_methods)}"
        )

        # Mock data collection results
        data_collected = {
            'quantitative_data': {
                'total_responses': 245,
                'complete_responses': 232,
                'partial_responses': 13,
                'variables_collected': 47,
                'sample': [
                    {
                        'participant_id': 'P001',
                        'timepoint': 'baseline',
                        'age': 24,
                        'primary_outcome': 78.5,
                        'secondary_outcomes': {'engagement': 4.2, 'satisfaction': 4.5},
                        'collected_at': '2025-11-01T10:30:00Z',
                        'collector_id': 'DC001',
                        'data_quality': 'complete'
                    },
                    {
                        'participant_id': 'P002',
                        'timepoint': 'baseline',
                        'age': 22,
                        'primary_outcome': 82.3,
                        'secondary_outcomes': {'engagement': 4.5, 'satisfaction': 4.7},
                        'collected_at': '2025-11-01T11:15:00Z',
                        'collector_id': 'DC001',
                        'data_quality': 'complete'
                    }
                ],
                'descriptive_statistics': {
                    'primary_outcome': {
                        'mean': 79.8,
                        'sd': 8.3,
                        'min': 45.2,
                        'max': 98.7,
                        'n': 232
                    },
                    'age': {
                        'mean': 23.5,
                        'sd': 4.2,
                        'range': [18, 45]
                    }
                }
            },
            'qualitative_data': {
                'interviews_conducted': 45,
                'focus_groups': 8,
                'open_ended_responses': 198,
                'transcription_status': {
                    'completed': 38,
                    'in_progress': 7,
                    'pending': 0
                },
                'coding_progress': {
                    'coded': 25,
                    'in_review': 13,
                    'not_started': 7
                },
                'sample_themes': [
                    'Increased engagement with technology',
                    'Concerns about data privacy',
                    'Desire for personalized feedback',
                    'Appreciation for flexibility'
                ]
            },
            'observational_data': {
                'observation_sessions': 120,
                'total_observation_hours': 360,
                'behaviors_coded': 15,
                'inter_rater_reliability': 0.87,
                'observation_categories': [
                    {'category': 'On-task behavior', 'frequency': 2145, 'percentage': 0.78},
                    {'category': 'Help-seeking', 'frequency': 234, 'percentage': 0.08},
                    {'category': 'Collaboration', 'frequency': 387, 'percentage': 0.14}
                ]
            },
            'sensor_data': {
                'devices': ['eye-tracker', 'heart-rate-monitor', 'accelerometer'],
                'total_data_points': 1250000,
                'sampling_rate': '100 Hz',
                'data_size_gb': 15.7,
                'quality_metrics': {
                    'signal_quality': 0.94,
                    'missing_data_rate': 0.03,
                    'artifact_rate': 0.08
                }
            }
        }

        quality_metrics = {
            'overall_quality_score': 0.92,
            'completeness': {
                'overall': 0.95,
                'by_timepoint': {
                    'baseline': 0.98,
                    'midpoint': 0.94,
                    'endpoint': 0.92
                },
                'by_instrument': {
                    'primary_outcome_measure': 0.97,
                    'engagement_scale': 0.94,
                    'demographic_survey': 0.99
                }
            },
            'consistency': {
                'internal_consistency': 0.89,
                'test_retest_reliability': 0.85,
                'inter_rater_agreement': 0.87
            },
            'accuracy': {
                'range_violations': 3,
                'logical_inconsistencies': 7,
                'duplicate_entries': 0,
                'impossible_values': 2
            },
            'timeliness': {
                'on_schedule': 0.91,
                'average_delay_days': 1.3,
                'overdue': 12
            },
            'data_validation': {
                'passed_all_checks': 232,
                'minor_issues': 13,
                'major_issues': 0,
                'validation_rate': 0.95
            }
        }

        completion_status = {
            'overall_progress': 0.68,
            'by_timepoint': {
                'baseline': {
                    'target': 250,
                    'completed': 245,
                    'percentage': 0.98,
                    'status': 'nearly complete'
                },
                'midpoint': {
                    'target': 238,
                    'completed': 162,
                    'percentage': 0.68,
                    'status': 'in progress'
                },
                'endpoint': {
                    'target': 225,
                    'completed': 0,
                    'percentage': 0.00,
                    'status': 'not started'
                }
            },
            'by_site': {
                'site_a': {'completed': 135, 'target': 125, 'percentage': 1.08},
                'site_b': {'completed': 78, 'target': 125, 'percentage': 0.62},
                'site_c': {'completed': 32, 'target': 125, 'percentage': 0.26}
            },
            'participant_status': {
                'enrolled': 375,
                'active': 238,
                'completed': 112,
                'withdrawn': 15,
                'lost_to_followup': 10
            }
        }

        issues_detected = [
            {
                'issue_id': 'DQ-001',
                'severity': 'low',
                'type': 'Missing data',
                'description': '13 participants have incomplete baseline surveys',
                'affected_records': 13,
                'recommendation': 'Contact participants for completion',
                'status': 'open'
            },
            {
                'issue_id': 'DQ-002',
                'severity': 'medium',
                'type': 'Site imbalance',
                'description': 'Site C significantly behind recruitment target',
                'affected_records': 93,
                'recommendation': 'Intensify recruitment efforts at Site C',
                'status': 'open'
            },
            {
                'issue_id': 'DQ-003',
                'severity': 'low',
                'type': 'Range violation',
                'description': '3 values outside expected range',
                'affected_records': 3,
                'recommendation': 'Verify and correct data entry',
                'status': 'in_review'
            },
            {
                'issue_id': 'DQ-004',
                'severity': 'low',
                'type': 'Logical inconsistency',
                'description': '7 responses have contradictory answers',
                'affected_records': 7,
                'recommendation': 'Flag for manual review',
                'status': 'open'
            }
        ]

        collection_metrics = {
            'efficiency': {
                'average_collection_time_minutes': 35,
                'data_entry_error_rate': 0.02,
                'protocol_deviations': 8,
                'missed_assessments': 12
            },
            'participant_experience': {
                'completion_rate': 0.95,
                'average_satisfaction': 4.3,
                'technical_issues_reported': 5,
                'complaints': 2
            },
            'resource_utilization': {
                'staff_hours': 450,
                'equipment_uptime': 0.97,
                'budget_consumed': 0.65,
                'storage_used_gb': 45.2
            }
        }

        return {
            'status': 'success',
            'collection_id': 'DC-20251116-001',
            'study_id': study_id,
            'timestamp': '2025-11-16T00:00:00Z',
            'collection_methods': collection_methods,
            'data_collected': data_collected,
            'quality_metrics': quality_metrics,
            'completion_status': completion_status,
            'collection_metrics': collection_metrics,
            'issues_detected': issues_detected,
            'data_security': {
                'encryption_status': 'AES-256 encryption enabled',
                'access_control': 'Role-based access in place',
                'audit_trail': 'All access logged',
                'backup_status': 'Daily automated backups',
                'compliance': ['HIPAA', 'GDPR', 'IRB protocols']
            },
            'data_storage': {
                'primary_location': 'Secure research database',
                'backup_locations': ['Cloud backup', 'Local backup'],
                'retention_policy': '7 years post-study',
                'de_identification': 'Automated de-identification applied',
                'total_size_gb': 45.2
            },
            'participant_tracking': {
                'active_participants': 238,
                'upcoming_assessments': 87,
                'overdue_assessments': 12,
                'retention_rate': 0.96,
                'engagement_score': 0.88
            },
            'recommendations': [
                'Follow up with 13 participants for incomplete surveys',
                'Increase recruitment efforts at Site C',
                'Review and correct 3 out-of-range values',
                'Implement additional training for data collectors',
                'Send automated reminders for upcoming assessments',
                'Conduct interim data quality audit',
                'Address technical issues reported by participants',
                'Maintain current high retention strategies'
            ],
            'quality_assurance_actions': [
                'Weekly data quality reports generated',
                'Monthly inter-rater reliability checks conducted',
                'Automated validation rules applied to all entries',
                'Random 10% manual verification of entries',
                'Regular calibration sessions for data collectors'
            ],
            'next_steps': [
                'Complete baseline data collection (5 participants remaining)',
                'Begin endpoint assessments (scheduled for next month)',
                'Conduct mid-study data quality review',
                'Update participant tracking system',
                'Resolve all open data quality issues'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate data collection parameters."""
        if 'study_id' not in params:
            self.logger.error("Missing required field: study_id")
            return False

        valid_methods = ['survey', 'observation', 'measurement', 'interview', 'sensor', 'archival']
        collection_methods = params.get('collection_methods', [])
        for method in collection_methods:
            if method not in valid_methods:
                self.logger.error(f"Invalid collection method: {method}")
                return False

        return True
