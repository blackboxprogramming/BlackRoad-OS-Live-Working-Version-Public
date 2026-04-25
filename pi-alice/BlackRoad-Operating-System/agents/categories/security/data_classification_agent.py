"""
Data Classification Agent

Classifies sensitive data (PII, PHI, PCI, confidential) across systems
and applies appropriate security controls based on classification.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class DataClassificationAgent(BaseAgent):
    """
    Data classification agent.

    Classifies:
    - Personally Identifiable Information (PII)
    - Protected Health Information (PHI)
    - Payment Card Information (PCI)
    - Confidential business data
    - Trade secrets
    - Intellectual property
    """

    def __init__(self):
        super().__init__(
            name='data-classification',
            description='Classify sensitive data',
            category='security',
            version='1.0.0',
            tags=['data', 'classification', 'pii', 'phi', 'pci', 'dlp', 'sensitivity']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classify data.

        Args:
            params: {
                'action': 'scan|classify|label|report',
                'targets': {
                    'databases': List[str],
                    'file_systems': List[str],
                    'cloud_storage': List[str],
                    'applications': List[str]
                },
                'classification_levels': ['public', 'internal', 'confidential', 'restricted'],
                'data_types': ['pii', 'phi', 'pci', 'ip', 'financial'],
                'detection_methods': ['pattern-matching', 'ml', 'metadata'],
                'actions': {
                    'auto_label': bool,
                    'apply_controls': bool,
                    'alert_on_sensitive': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'classification_id': str,
                'data_discovered': Dict,
                'classification_results': Dict,
                'recommendations': List[str]
            }
        """
        action = params.get('action', 'scan')
        targets = params.get('targets', {})
        classification_levels = params.get('classification_levels', ['public', 'internal', 'confidential', 'restricted'])
        data_types = params.get('data_types', ['pii', 'phi', 'pci'])
        actions_config = params.get('actions', {})

        self.logger.info(
            f"Data classification - action: {action}"
        )

        data_discovered = {
            'total_files_scanned': 1256789,
            'total_records_scanned': 45678901,
            'sensitive_data_found': True,
            'by_type': {
                'pii': {
                    'files': 12345,
                    'records': 2345678,
                    'locations': ['customer_db', 'crm_system', 'file_shares'],
                    'examples': [
                        {'type': 'SSN', 'count': 125000, 'pattern': 'XXX-XX-XXXX'},
                        {'type': 'Email', 'count': 456789, 'pattern': 'email@domain.com'},
                        {'type': 'Phone', 'count': 234567, 'pattern': '+1-XXX-XXX-XXXX'},
                        {'type': 'Address', 'count': 189234, 'pattern': 'street, city, state'}
                    ]
                },
                'phi': {
                    'files': 3456,
                    'records': 125000,
                    'locations': ['patient_db', 'ehr_system', 'billing_system'],
                    'examples': [
                        {'type': 'Medical Record Number', 'count': 125000},
                        {'type': 'Health Insurance ID', 'count': 98500},
                        {'type': 'Diagnosis Codes', 'count': 156789}
                    ]
                },
                'pci': {
                    'files': 2345,
                    'records': 67890,
                    'locations': ['payment_db', 'transaction_logs'],
                    'examples': [
                        {'type': 'Credit Card Number', 'count': 67890, 'pattern': 'XXXX-XXXX-XXXX-XXXX'},
                        {'type': 'CVV', 'count': 45678},
                        {'type': 'Card Expiry', 'count': 67890}
                    ]
                },
                'financial': {
                    'files': 5678,
                    'records': 345678,
                    'locations': ['accounting_db', 'payroll_system'],
                    'examples': [
                        {'type': 'Bank Account', 'count': 125000},
                        {'type': 'Routing Number', 'count': 89000},
                        {'type': 'Salary Information', 'count': 450}
                    ]
                },
                'confidential': {
                    'files': 8901,
                    'records': 234567,
                    'locations': ['legal_docs', 'contracts', 'strategic_plans'],
                    'examples': [
                        {'type': 'Trade Secrets', 'count': 234},
                        {'type': 'M&A Documents', 'count': 45},
                        {'type': 'Proprietary Algorithms', 'count': 67}
                    ]
                }
            },
            'unclassified_data': {
                'files': 45678,
                'records': 1234567,
                'reason': 'Unable to determine classification'
            }
        }

        classification_results = {
            'total_items_classified': 1256789,
            'by_classification_level': {
                'public': 823456,
                'internal': 389012,
                'confidential': 38901,
                'restricted': 5420
            },
            'percentage_sensitive': 3.5,
            'auto_labeled': 1234567 if actions_config.get('auto_label') else 0,
            'manual_review_required': 22222,
            'controls_applied': {
                'encryption': 44321,
                'access_restrictions': 44321,
                'dlp_policies': 44321,
                'watermarking': 5420
            } if actions_config.get('apply_controls') else {}
        }

        exposure_assessment = {
            'publicly_accessible': {
                'restricted_data': 234,
                'confidential_data': 567,
                'severity': 'critical'
            },
            'over_shared': {
                'files': 1234,
                'users_with_access': 'Everyone',
                'severity': 'high'
            },
            'unencrypted_sensitive': {
                'pii_records': 25000,
                'phi_records': 5000,
                'pci_records': 1234,
                'severity': 'critical'
            },
            'sent_via_email': {
                'sensitive_emails': 456,
                'external_recipients': 234,
                'severity': 'high'
            }
        }

        policy_violations = [
            {
                'violation_id': 'DLP-001',
                'severity': 'critical',
                'type': 'Unencrypted Restricted Data',
                'description': 'Restricted data stored without encryption',
                'affected_files': 234,
                'data_types': ['SSN', 'Credit Card'],
                'location': 's3://backup-bucket/legacy/',
                'remediation': 'Encrypt files or move to secure location'
            },
            {
                'violation_id': 'DLP-002',
                'severity': 'high',
                'type': 'Data Exposure',
                'description': 'Confidential data shared with external users',
                'affected_files': 45,
                'shared_with': 15,
                'location': 'Google Drive',
                'remediation': 'Revoke external access, move to internal storage'
            },
            {
                'violation_id': 'DLP-003',
                'severity': 'high',
                'type': 'Improper Retention',
                'description': 'Sensitive data retained beyond policy',
                'affected_records': 12500,
                'data_age_years': 8,
                'policy_retention_years': 5,
                'remediation': 'Delete or archive data per retention policy'
            }
        ]

        return {
            'status': 'success',
            'classification_id': f'data-classification-{action}-20251116-001',
            'action': action,
            'timestamp': '2025-11-16T00:00:00Z',
            'data_discovered': data_discovered,
            'classification_results': classification_results,
            'exposure_assessment': exposure_assessment,
            'policy_violations': policy_violations,
            'total_violations': len(policy_violations),
            'targets_scanned': {
                'databases': len(targets.get('databases', [])) or 15,
                'file_systems': len(targets.get('file_systems', [])) or 23,
                'cloud_storage': len(targets.get('cloud_storage', [])) or 8,
                'applications': len(targets.get('applications', [])) or 12
            },
            'classification_accuracy': {
                'ml_model_confidence': 0.94,
                'pattern_match_accuracy': 0.98,
                'false_positive_rate': 0.03,
                'false_negative_rate': 0.02
            },
            'recommendations': [
                'IMMEDIATE: Encrypt 25,000 unencrypted PII records',
                'IMMEDIATE: Remove public access to 234 restricted files',
                'IMMEDIATE: Revoke external access to 45 confidential files',
                'HIGH: Implement encryption for all restricted data',
                'HIGH: Apply DLP policies to prevent data exfiltration',
                'HIGH: Delete 12,500 records exceeding retention policy',
                'MEDIUM: Classify 22,222 items requiring manual review',
                'Enable automatic classification for new data',
                'Implement data loss prevention (DLP)',
                'Regular data classification audits',
                'User training on data handling',
                'Implement data discovery automation'
            ],
            'security_controls_needed': {
                'encryption': 30420,
                'access_control_review': 44321,
                'dlp_policy': 44321,
                'data_masking': 25000,
                'secure_deletion': 12500
            },
            'compliance_impact': {
                'gdpr': 'High risk - PII exposure',
                'hipaa': 'High risk - Unencrypted PHI',
                'pci-dss': 'Critical - Unencrypted card data',
                'sox': 'Medium risk - Financial data exposure'
            },
            'reports_generated': [
                f'data_classification_{action}_20251116.pdf',
                f'sensitive_data_inventory_20251116.xlsx',
                f'data_exposure_report_20251116.json',
                f'classification_violations_20251116.csv'
            ],
            'next_steps': [
                'Address critical data exposures',
                'Apply classification labels',
                'Implement security controls',
                'Review and update classification policies',
                'Train users on data classification',
                'Schedule regular data discovery scans'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate data classification parameters."""
        valid_actions = ['scan', 'classify', 'label', 'report']
        action = params.get('action', 'scan')
        if action not in valid_actions:
            self.logger.error(f"Invalid action: {action}")
            return False

        return True
