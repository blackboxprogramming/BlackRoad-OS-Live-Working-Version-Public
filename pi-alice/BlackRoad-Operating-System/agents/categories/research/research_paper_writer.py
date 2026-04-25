"""
Research Paper Writer Agent

Assists in writing academic research papers following scholarly conventions,
journal guidelines, and academic writing best practices.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class ResearchPaperWriterAgent(BaseAgent):
    """
    Academic research paper writing and composition agent.

    Capabilities:
    - Manuscript structure and organization
    - Academic writing style guidance
    - Section drafting (IMRaD format)
    - Journal-specific formatting
    - Abstract and keyword generation
    - Figure and table integration
    - Citation integration
    - Revision and refinement
    """

    def __init__(self):
        super().__init__(
            name='research-paper-writer',
            description='Write academic research papers',
            category='research',
            version='1.0.0',
            tags=['writing', 'research', 'paper', 'manuscript', 'academic', 'publication']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate research paper content.

        Args:
            params: {
                'paper_type': 'original_research|review|meta-analysis|case_study|theoretical',
                'research_data': Dict,
                'target_journal': str,
                'sections_to_generate': List[str],
                'writing_style': {
                    'formality': str,
                    'voice': 'active|passive|mixed',
                    'person': 'first|third',
                    'tense': 'past|present|mixed'
                },
                'word_limits': {
                    'abstract': int,
                    'total': int
                },
                'options': {
                    'include_figures': bool,
                    'include_tables': bool,
                    'generate_keywords': bool,
                    'check_readability': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'paper_id': str,
                'manuscript': Dict,
                'quality_metrics': Dict,
                'recommendations': List[str]
            }
        """
        paper_type = params.get('paper_type', 'original_research')
        target_journal = params.get('target_journal', 'General Academic Journal')
        sections = params.get('sections_to_generate', ['all'])
        options = params.get('options', {})

        self.logger.info(
            f"Writing {paper_type} paper for {target_journal}"
        )

        # Mock research paper writing
        manuscript = {
            'title': 'The Impact of AI-Assisted Learning Tools on Academic Performance: A Randomized Controlled Trial',
            'running_title': 'AI-Assisted Learning and Performance',
            'word_count': 6543,
            'abstract': {
                'background': 'Artificial intelligence (AI) tools are increasingly used in education, yet rigorous evidence of their effectiveness remains limited.',
                'objective': 'To evaluate the impact of AI-assisted learning tools on academic performance among university students.',
                'methods': 'We conducted a randomized controlled trial with 245 undergraduate students. Participants were randomly assigned to use either AI-assisted learning tools (n=122) or traditional learning methods (n=123) for one semester. The primary outcome was academic performance measured by standardized test scores.',
                'results': 'Students using AI-assisted tools achieved significantly higher test scores (M=82.4, SD=7.9) compared to controls (M=77.2, SD=8.5), t(243)=3.42, p<0.001, d=0.63. Engagement mediated this relationship (indirect effect=2.1, 95% CI [0.8, 3.4]).',
                'conclusions': 'AI-assisted learning tools significantly improved academic performance, with effects mediated by student engagement. These findings support integration of AI tools in higher education curricula.',
                'word_count': 147,
                'keywords': ['artificial intelligence', 'education', 'academic performance', 'randomized controlled trial', 'engagement']
            },
            'introduction': {
                'content': 'Sample introduction discussing background, significance, literature review, research gap, and study aims...',
                'word_count': 1250,
                'citations': 28,
                'paragraphs': 8,
                'elements': [
                    'Opening context',
                    'Literature synthesis',
                    'Research gap identification',
                    'Study rationale',
                    'Research questions and hypotheses',
                    'Study significance'
                ]
            },
            'methods': {
                'content': 'Detailed methodology including study design, participants, interventions, measures, and analysis...',
                'word_count': 1580,
                'subsections': [
                    'Study Design',
                    'Participants',
                    'Randomization',
                    'Interventions',
                    'Outcome Measures',
                    'Statistical Analysis',
                    'Ethical Considerations'
                ],
                'level_of_detail': 'Sufficient for replication',
                'citations': 15
            },
            'results': {
                'content': 'Comprehensive results with statistical findings...',
                'word_count': 1450,
                'tables': 3,
                'figures': 4,
                'key_findings': [
                    'Baseline equivalence confirmed',
                    'Main effect of intervention significant',
                    'Mediation by engagement confirmed',
                    'No significant moderators identified'
                ],
                'subsections': [
                    'Participant Flow and Baseline Characteristics',
                    'Primary Outcome Analysis',
                    'Secondary Outcomes',
                    'Mediation Analysis',
                    'Sensitivity Analyses'
                ]
            },
            'discussion': {
                'content': 'Interpretation of findings, comparison with literature, implications, and limitations...',
                'word_count': 1650,
                'citations': 42,
                'structure': [
                    'Summary of main findings',
                    'Interpretation in context of literature',
                    'Theoretical implications',
                    'Practical implications',
                    'Strengths and limitations',
                    'Future research directions',
                    'Conclusions'
                ]
            },
            'references': {
                'count': 67,
                'style': 'APA 7th Edition',
                'types': {
                    'journal_articles': 52,
                    'books': 9,
                    'conference_papers': 4,
                    'reports': 2
                }
            }
        }

        quality_metrics = {
            'academic_writing_quality': {
                'clarity': 0.89,
                'coherence': 0.92,
                'conciseness': 0.86,
                'formality': 0.94,
                'overall_score': 0.90
            },
            'readability': {
                'flesch_reading_ease': 42.3,
                'flesch_kincaid_grade': 14.2,
                'gunning_fog_index': 16.5,
                'interpretation': 'College-level reading, appropriate for academic audience'
            },
            'structure': {
                'follows_imrad': True,
                'section_balance': 'Good',
                'logical_flow': 0.91,
                'transition_quality': 0.88
            },
            'citations': {
                'total_citations': 67,
                'citations_per_1000_words': 10.2,
                'citation_diversity': 0.85,
                'recent_sources': 0.78,
                'primary_sources': 0.82,
                'citation_format_compliance': 0.98
            },
            'methodology_reporting': {
                'consort_compliance': 0.94,
                'reproducibility_score': 0.91,
                'transparency': 0.93,
                'detail_sufficiency': 'Excellent'
            },
            'statistical_reporting': {
                'effect_sizes_reported': True,
                'confidence_intervals_reported': True,
                'assumption_testing_reported': True,
                'completeness': 0.96
            }
        }

        journal_compliance = {
            'journal': target_journal,
            'compliance_checks': {
                'word_limit': {'limit': 7000, 'current': 6543, 'compliant': True},
                'abstract_length': {'limit': 250, 'current': 147, 'compliant': True},
                'reference_style': {'required': 'APA', 'used': 'APA', 'compliant': True},
                'section_structure': {'required': 'IMRaD', 'used': 'IMRaD', 'compliant': True},
                'figure_limit': {'limit': 6, 'current': 4, 'compliant': True},
                'table_limit': {'limit': 6, 'current': 3, 'compliant': True}
            },
            'compliance_score': 1.0,
            'missing_requirements': []
        }

        return {
            'status': 'success',
            'paper_id': 'PAPER-20251116-001',
            'paper_type': paper_type,
            'target_journal': target_journal,
            'manuscript': manuscript,
            'quality_metrics': quality_metrics,
            'journal_compliance': journal_compliance,
            'formatting': {
                'line_spacing': 'Double',
                'font': 'Times New Roman 12pt',
                'margins': '1 inch all sides',
                'page_numbers': 'Top right',
                'heading_levels': 3
            },
            'supplementary_materials': {
                'supplementary_tables': 2,
                'supplementary_figures': 3,
                'appendices': ['Survey Instrument', 'Statistical Code', 'Raw Data Summary'],
                'data_availability_statement': 'Data available upon reasonable request to corresponding author'
            },
            'author_contributions': {
                'conceptualization': ['Author 1', 'Author 2'],
                'methodology': ['Author 1', 'Author 3'],
                'formal_analysis': ['Author 1'],
                'investigation': ['Author 2', 'Author 3'],
                'writing_original_draft': ['Author 1'],
                'writing_review_editing': ['All authors'],
                'visualization': ['Author 1'],
                'supervision': ['Author 2'],
                'funding_acquisition': ['Author 2']
            },
            'declarations': {
                'funding': 'This research was supported by Grant #12345 from Research Foundation.',
                'conflicts_of_interest': 'The authors declare no conflicts of interest.',
                'ethics_approval': 'Approved by University IRB #2024-001.',
                'consent': 'All participants provided written informed consent.',
                'data_availability': 'Data available in supplementary materials.',
                'preregistration': 'Protocol pre-registered at ClinicalTrials.gov (NCT12345678)'
            },
            'peer_review_readiness': {
                'originality': 'High - novel contribution',
                'significance': 'High - important practical implications',
                'scientific_rigor': 'High - RCT design with adequate power',
                'clarity': 'Good - well-written and structured',
                'reproducibility': 'High - detailed methods, code available',
                'overall_assessment': 'Ready for submission',
                'estimated_review_outcome': 'Accept with minor revisions'
            },
            'recommendations': [
                'Add 1-2 more recent citations from 2024',
                'Expand limitations section slightly',
                'Consider adding subgroup analyses to supplementary materials',
                'Ensure all figures have high-resolution versions',
                'Double-check all p-values are reported consistently',
                'Add trial registration number to abstract',
                'Verify ethical approval numbers are correct',
                'Proofread for minor grammatical issues',
                'Ensure consistency in abbreviations',
                'Check journal-specific formatting requirements one final time'
            ],
            'writing_tips_applied': [
                'Active voice used where appropriate',
                'Clear topic sentences for paragraphs',
                'Smooth transitions between sections',
                'Jargon minimized and defined when necessary',
                'Parallel structure in lists',
                'Precise language throughout',
                'Appropriate hedging for interpretations',
                'Strong concluding statements'
            ],
            'next_steps': [
                'Final proofread by all co-authors',
                'Format figures and tables per journal specs',
                'Prepare cover letter to editor',
                'Complete journal submission form',
                'Prepare suggested reviewers list',
                'Verify all co-authors approve final version',
                'Submit to journal portal',
                'Upload to preprint server (if applicable)'
            ],
            'estimated_timeline': {
                'final_revisions': '1 week',
                'co_author_approval': '1 week',
                'submission_preparation': '3 days',
                'journal_submission': '1 day',
                'total_to_submission': '2-3 weeks'
            },
            'files_generated': [
                'manuscript_main_text.docx',
                'abstract_standalone.txt',
                'figures_combined.pdf',
                'tables_formatted.xlsx',
                'supplementary_materials.pdf',
                'cover_letter_draft.docx',
                'author_contributions_statement.txt'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate research paper writing parameters."""
        valid_types = ['original_research', 'review', 'meta-analysis', 'case_study', 'theoretical']
        paper_type = params.get('paper_type', 'original_research')
        if paper_type not in valid_types:
            self.logger.error(f"Invalid paper_type: {paper_type}")
            return False

        return True
