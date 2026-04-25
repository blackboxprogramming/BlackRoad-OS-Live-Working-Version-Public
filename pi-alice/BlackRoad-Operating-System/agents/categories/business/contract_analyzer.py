"""
Contract Analyzer Agent

Analyzes contracts using AI to extract key terms, identify risks,
flag non-standard clauses, and ensure compliance.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class ContractAnalyzerAgent(BaseAgent):
    """
    Analyzes contracts and legal documents.

    Features:
    - Term extraction
    - Risk identification
    - Compliance checking
    - Clause comparison
    - Deadline tracking
    - Obligation management
    """

    def __init__(self):
        super().__init__(
            name='contract-analyzer',
            description='Analyze contracts for terms, risks, and compliance',
            category='business',
            version='1.0.0',
            tags=['contracts', 'legal', 'compliance', 'analysis', 'risk']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze contract documents.

        Args:
            params: {
                'contract_id': str,
                'contract_text': str,
                'contract_type': 'nda|msa|sow|employment|vendor|lease',
                'analysis_type': 'full|risk|compliance|terms|obligations',
                'options': {
                    'compare_to_standard': bool,
                    'identify_missing_clauses': bool,
                    'extract_deadlines': bool,
                    'flag_unusual_terms': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'analysis': Dict,
                'risks': List[Dict],
                'key_terms': Dict,
                'recommendations': List[str]
            }
        """
        contract_id = params.get('contract_id')
        contract_type = params.get('contract_type', 'msa')
        analysis_type = params.get('analysis_type', 'full')
        options = params.get('options', {})

        self.logger.info(f"Analyzing {contract_type} contract: {analysis_type} analysis")

        # Mock contract metadata
        contract = {
            'id': contract_id or 'CTR-2025-001',
            'title': 'Master Service Agreement - Acme Corp',
            'type': contract_type,
            'parties': [
                {
                    'role': 'provider',
                    'name': 'Your Company Inc',
                    'type': 'corporation',
                    'jurisdiction': 'Delaware'
                },
                {
                    'role': 'client',
                    'name': 'Acme Corporation',
                    'type': 'corporation',
                    'jurisdiction': 'California'
                }
            ],
            'effective_date': '2025-12-01',
            'expiration_date': '2026-11-30',
            'duration': '12 months',
            'auto_renewal': True,
            'notice_period_days': 60,
            'value': '$500,000',
            'status': 'pending_signature',
            'pages': 15,
            'sections': 23,
            'last_modified': '2025-11-15'
        }

        # Mock key terms extracted
        key_terms = {
            'payment_terms': {
                'total_value': '$500,000',
                'payment_schedule': 'Monthly',
                'payment_method': 'Wire transfer',
                'payment_due_days': 30,
                'late_payment_interest': '1.5% per month',
                'currency': 'USD'
            },
            'scope_of_work': {
                'services': [
                    'Software development',
                    'Consulting services',
                    'Maintenance and support'
                ],
                'deliverables': [
                    'Custom software application',
                    'Documentation',
                    'Training materials'
                ],
                'acceptance_criteria': 'Defined in Schedule A'
            },
            'intellectual_property': {
                'ownership': 'Work product owned by Client',
                'license_grant': 'Provider retains IP in pre-existing tools',
                'exceptions': 'Background IP listed in Schedule B'
            },
            'liability': {
                'limitation_amount': '$500,000',
                'limitation_type': 'Annual aggregate',
                'excluded_liabilities': [
                    'Gross negligence',
                    'Willful misconduct',
                    'IP infringement',
                    'Data breach'
                ],
                'insurance_required': '$2,000,000 general liability'
            },
            'confidentiality': {
                'duration': '3 years after termination',
                'exceptions': 'Standard NDA exceptions apply',
                'return_obligation': True
            },
            'termination': {
                'termination_for_convenience': 'Either party with 60 days notice',
                'termination_for_cause': '30 days to cure',
                'effects_of_termination': 'Sections 7, 9, 11, 15 survive',
                'payment_upon_termination': 'Pro-rata for work completed'
            },
            'dispute_resolution': {
                'governing_law': 'California',
                'venue': 'San Francisco County',
                'arbitration': 'Mandatory for disputes over $50,000',
                'arbitration_rules': 'AAA Commercial Rules'
            }
        }

        # Mock risk analysis
        risks = [
            {
                'id': 'RISK-001',
                'category': 'liability',
                'severity': 'high',
                'title': 'Unlimited Liability for Data Breach',
                'description': 'Data breach is excluded from liability cap',
                'location': 'Section 8.2',
                'impact': 'Potentially unlimited financial exposure',
                'probability': 'medium',
                'mitigation': 'Negotiate sub-cap for data breach or obtain cyber insurance',
                'priority': 1
            },
            {
                'id': 'RISK-002',
                'category': 'termination',
                'severity': 'medium',
                'title': 'Auto-Renewal without Notice Cap',
                'description': 'Contract auto-renews indefinitely if not terminated',
                'location': 'Section 12.1',
                'impact': 'Unintended long-term commitment',
                'probability': 'high',
                'mitigation': 'Add maximum renewal period or require affirmative renewal',
                'priority': 2
            },
            {
                'id': 'RISK-003',
                'category': 'ip',
                'severity': 'medium',
                'title': 'Broad IP Assignment',
                'description': 'All work product ownership transfers to client including improvements to tools',
                'location': 'Section 9.1',
                'impact': 'Loss of IP in reusable components',
                'probability': 'high',
                'mitigation': 'Clarify that background IP and general know-how are retained',
                'priority': 3
            },
            {
                'id': 'RISK-004',
                'category': 'compliance',
                'severity': 'low',
                'title': 'Missing Force Majeure Clause',
                'description': 'No provision for performance during unforeseen events',
                'location': 'N/A',
                'impact': 'Potential breach during events beyond control',
                'probability': 'low',
                'mitigation': 'Add standard force majeure clause',
                'priority': 4
            }
        ]

        # Mock obligations extracted
        obligations = [
            {
                'id': 'OBL-001',
                'party': 'Your Company',
                'type': 'deliverable',
                'description': 'Deliver Phase 1 software',
                'deadline': '2026-03-01',
                'status': 'upcoming',
                'dependencies': ['Signed SOW', 'Requirements approved']
            },
            {
                'id': 'OBL-002',
                'party': 'Your Company',
                'type': 'insurance',
                'description': 'Maintain general liability insurance',
                'deadline': 'Ongoing',
                'status': 'compliant',
                'verification': 'Annual certificate of insurance'
            },
            {
                'id': 'OBL-003',
                'party': 'Acme Corporation',
                'type': 'payment',
                'description': 'Monthly payment within 30 days',
                'deadline': 'Monthly',
                'status': 'pending_start',
                'amount': '$41,667'
            },
            {
                'id': 'OBL-004',
                'party': 'Both Parties',
                'type': 'confidentiality',
                'description': 'Maintain confidentiality of disclosed information',
                'deadline': '3 years after termination',
                'status': 'ongoing'
            }
        ]

        # Mock compliance check
        compliance = {
            'standard_clauses_present': {
                'confidentiality': 'present',
                'liability_limitation': 'present',
                'indemnification': 'present',
                'intellectual_property': 'present',
                'termination': 'present',
                'dispute_resolution': 'present',
                'force_majeure': 'missing',
                'assignment': 'present',
                'entire_agreement': 'present',
                'amendments': 'present'
            },
            'regulatory_compliance': {
                'gdpr': 'not_applicable',
                'hipaa': 'not_applicable',
                'sox': 'not_applicable',
                'data_privacy_laws': 'addressed'
            },
            'company_policy_compliance': {
                'signature_authority': 'requires_cfo_approval',
                'liability_cap_policy': 'within_limits',
                'payment_terms_policy': 'standard',
                'insurance_requirements': 'met'
            },
            'missing_clauses': [
                'Force majeure',
                'Publicity/PR approval'
            ],
            'non_standard_clauses': [
                {
                    'clause': 'Unlimited data breach liability',
                    'location': 'Section 8.2',
                    'deviation': 'Normally capped at 2x contract value'
                }
            ]
        }

        # Mock comparison to standard template
        template_comparison = {
            'template_used': 'Standard MSA v3.2',
            'similarity_score': 0.78,
            'deviations': [
                {
                    'section': 'Liability',
                    'standard': 'Cap at 1x annual fees',
                    'actual': 'Cap at total contract value',
                    'significance': 'favorable'
                },
                {
                    'section': 'IP Rights',
                    'standard': 'Client owns deliverables, Provider owns tools',
                    'actual': 'Client owns all work product',
                    'significance': 'unfavorable'
                },
                {
                    'section': 'Term',
                    'standard': 'Fixed term with optional renewal',
                    'actual': 'Auto-renewal',
                    'significance': 'neutral'
                }
            ],
            'favorable_terms': 5,
            'unfavorable_terms': 3,
            'neutral_changes': 8
        }

        # Mock analytics
        analytics = {
            'total_contracts_analyzed': 234,
            'contracts_this_month': 18,
            'average_risk_score': 6.2,  # 1-10 scale
            'this_contract_risk_score': 7.1,
            'average_analysis_time_minutes': 8,
            'common_risks_identified': {
                'liability_concerns': 145,
                'ip_issues': 89,
                'termination_issues': 67,
                'payment_terms': 45
            },
            'approval_rate': 0.87,
            'average_negotiation_cycles': 2.3
        }

        return {
            'status': 'success',
            'contract': contract,
            'analysis_type': analysis_type,
            'key_terms': key_terms,
            'risks': risks,
            'total_risks': len(risks),
            'risk_breakdown': {
                'high': len([r for r in risks if r['severity'] == 'high']),
                'medium': len([r for r in risks if r['severity'] == 'medium']),
                'low': len([r for r in risks if r['severity'] == 'low'])
            },
            'overall_risk_score': 7.1,
            'risk_level': 'medium-high',
            'obligations': obligations,
            'upcoming_obligations': [o for o in obligations if o['status'] == 'upcoming'],
            'compliance': compliance,
            'template_comparison': template_comparison if options.get('compare_to_standard') else None,
            'analytics': analytics,
            'deadlines': [
                {
                    'date': '2025-11-30',
                    'type': 'signature_deadline',
                    'description': 'Contract must be signed',
                    'days_remaining': 14
                },
                {
                    'date': '2025-12-01',
                    'type': 'effective_date',
                    'description': 'Contract becomes effective',
                    'days_remaining': 15
                },
                {
                    'date': '2026-03-01',
                    'type': 'deliverable',
                    'description': 'Phase 1 software delivery',
                    'days_remaining': 105
                },
                {
                    'date': '2026-10-02',
                    'type': 'renewal_notice',
                    'description': 'Deadline to provide non-renewal notice',
                    'days_remaining': 320
                }
            ],
            'recommendations': [
                'CRITICAL: Negotiate data breach liability cap before signing',
                'Add force majeure clause for unforeseen events',
                'Clarify IP ownership to retain background IP and tools',
                'Consider limiting auto-renewal to maximum 2 cycles',
                'Request CEO approval due to high-severity risks',
                'Ensure cyber insurance covers data breach exposure',
                'Document all deviations from standard template',
                'Set calendar reminders for renewal notice deadline'
            ],
            'approval_workflow': {
                'required_approvers': [
                    {'role': 'Legal', 'status': 'pending'},
                    {'role': 'CFO', 'status': 'not_started'},
                    {'role': 'CEO', 'status': 'not_started'}
                ],
                'estimated_approval_time_days': 7
            },
            'next_steps': [
                'Schedule legal review meeting',
                'Prepare negotiation points for client',
                'Draft redline version with proposed changes',
                'Route to CFO for financial approval',
                'Set up obligations tracking in calendar',
                'Obtain required insurance certificates',
                'Prepare contract execution checklist'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate contract analysis parameters."""
        valid_contract_types = [
            'nda', 'msa', 'sow', 'employment', 'vendor', 'lease'
        ]
        valid_analysis_types = [
            'full', 'risk', 'compliance', 'terms', 'obligations'
        ]

        contract_type = params.get('contract_type')
        if contract_type and contract_type not in valid_contract_types:
            self.logger.error(f"Invalid contract type: {contract_type}")
            return False

        analysis_type = params.get('analysis_type')
        if analysis_type and analysis_type not in valid_analysis_types:
            self.logger.error(f"Invalid analysis type: {analysis_type}")
            return False

        return True
