"""
Protocol Generator Agent

Generates detailed research protocols and standard operating procedures
for systematic and reproducible research execution.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class ProtocolGeneratorAgent(BaseAgent):
    """
    Research protocol and SOP generation agent.

    Capabilities:
    - Detailed protocol development
    - Standard operating procedures (SOPs)
    - Step-by-step procedure documentation
    - Safety and compliance guidelines
    - Quality control procedures
    - Protocol versioning and updates
    - Training materials generation
    """

    def __init__(self):
        super().__init__(
            name='protocol-generator',
            description='Generate research protocols and SOPs',
            category='research',
            version='1.0.0',
            tags=['protocol', 'sop', 'procedures', 'research', 'documentation']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate research protocol.

        Args:
            params: {
                'protocol_type': 'experimental|data_collection|analysis|safety|clinical',
                'study_design': str,
                'procedures': List[str],
                'safety_requirements': List[str],
                'quality_controls': List[str],
                'options': {
                    'include_training': bool,
                    'include_troubleshooting': bool,
                    'version_control': bool,
                    'regulatory_compliance': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'protocol_id': str,
                'protocol_document': Dict,
                'sops': List[Dict],
                'training_materials': List[str],
                'recommendations': List[str]
            }
        """
        protocol_type = params.get('protocol_type', 'experimental')
        study_design = params.get('study_design')
        options = params.get('options', {})

        self.logger.info(
            f"Generating {protocol_type} protocol for {study_design}"
        )

        protocol_document = {
            'title': 'AI Learning Tool Intervention Protocol',
            'version': '2.1',
            'date': '2025-11-16',
            'approved_by': 'IRB #2024-001',
            'sections': {
                'overview': {
                    'purpose': 'Standardize delivery of AI learning intervention',
                    'scope': 'All research staff conducting interventions',
                    'responsibilities': 'Research coordinators and assistants'
                },
                'materials_required': [
                    'AI learning platform access',
                    'Participant ID list',
                    'Intervention checklist',
                    'Fidelity observation form',
                    'Technical support contact'
                ],
                'procedure_steps': [
                    {
                        'step': 1,
                        'action': 'Participant check-in',
                        'details': 'Verify identity, confirm consent, assign to station',
                        'duration': '5 minutes',
                        'quality_check': 'Confirm ID matches assignment list'
                    },
                    {
                        'step': 2,
                        'action': 'Platform orientation',
                        'details': 'Demonstrate AI tool features, answer questions',
                        'duration': '15 minutes',
                        'quality_check': 'Participant demonstrates basic navigation'
                    },
                    {
                        'step': 3,
                        'action': 'Baseline assessment',
                        'details': 'Administer pre-intervention survey',
                        'duration': '20 minutes',
                        'quality_check': 'All required fields completed'
                    },
                    {
                        'step': 4,
                        'action': 'Intervention delivery',
                        'details': 'Participant engages with AI learning modules',
                        'duration': '60 minutes',
                        'quality_check': 'Monitor engagement, assist with technical issues'
                    },
                    {
                        'step': 5,
                        'action': 'Post-session debrief',
                        'details': 'Collect feedback, schedule next session',
                        'duration': '10 minutes',
                        'quality_check': 'Document any concerns or deviations'
                    }
                ],
                'quality_assurance': [
                    'Complete fidelity checklist for each session',
                    'Random 20% observations by supervisor',
                    'Weekly calibration meetings',
                    'Protocol deviation tracking and reporting'
                ],
                'troubleshooting': [
                    {
                        'issue': 'Technical difficulties',
                        'solution': 'Contact IT support, document downtime, reschedule if needed'
                    },
                    {
                        'issue': 'Participant distress',
                        'solution': 'Pause session, offer support, notify PI, document incident'
                    },
                    {
                        'issue': 'Missing data',
                        'solution': 'Attempt immediate correction, flag for follow-up'
                    }
                ],
                'safety_considerations': [
                    'Ensure participant privacy and confidentiality',
                    'Monitor for signs of distress',
                    'Emergency contact information readily available',
                    'Data security protocols followed'
                ]
            }
        }

        sops = [
            {
                'sop_id': 'SOP-001',
                'title': 'Data Entry Standard Operating Procedure',
                'version': '1.5',
                'purpose': 'Ensure accurate and consistent data entry',
                'steps': 8,
                'last_updated': '2025-11-01'
            },
            {
                'sop_id': 'SOP-002',
                'title': 'Equipment Calibration Procedure',
                'version': '1.2',
                'purpose': 'Maintain measurement accuracy',
                'steps': 6,
                'last_updated': '2025-10-15'
            },
            {
                'sop_id': 'SOP-003',
                'title': 'Adverse Event Reporting',
                'version': '2.0',
                'purpose': 'Systematic reporting of adverse events',
                'steps': 10,
                'last_updated': '2025-11-10'
            }
        ]

        return {
            'status': 'success',
            'protocol_id': 'PROT-20251116-001',
            'protocol_type': protocol_type,
            'protocol_document': protocol_document,
            'sops': sops,
            'training_materials': [
                'protocol_training_presentation.pptx',
                'video_demonstration.mp4',
                'quick_reference_guide.pdf',
                'fidelity_checklist.pdf'
            ],
            'implementation_support': {
                'training_required': '4 hours initial + 2 hours ongoing',
                'competency_assessment': 'Observe 3 sessions with >90% fidelity',
                'ongoing_support': 'Weekly supervision and calibration',
                'quality_monitoring': 'Monthly fidelity audits'
            },
            'version_control': {
                'current_version': '2.1',
                'previous_versions': ['1.0', '1.5', '2.0'],
                'change_log': [
                    'v2.1: Added troubleshooting section',
                    'v2.0: Updated intervention duration',
                    'v1.5: Clarified quality checks'
                ]
            },
            'compliance': {
                'irb_approved': True,
                'regulatory_standards': ['GCP', 'HIPAA', 'Institutional policies'],
                'last_review': '2025-11-01',
                'next_review': '2026-11-01'
            },
            'recommendations': [
                'Conduct initial training for all staff',
                'Pilot protocol with 5 participants',
                'Establish fidelity monitoring schedule',
                'Create troubleshooting FAQ',
                'Schedule regular protocol review meetings',
                'Maintain protocol deviation log',
                'Update as needed based on pilot feedback'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate protocol generation parameters."""
        valid_types = ['experimental', 'data_collection', 'analysis', 'safety', 'clinical']
        protocol_type = params.get('protocol_type', 'experimental')
        if protocol_type not in valid_types:
            self.logger.error(f"Invalid protocol_type: {protocol_type}")
            return False
        return True
