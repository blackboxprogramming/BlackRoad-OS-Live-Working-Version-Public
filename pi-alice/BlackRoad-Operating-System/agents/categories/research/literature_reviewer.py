"""
Literature Reviewer Agent

Reviews academic literature and scholarly papers, providing systematic
analysis, synthesis, and critical evaluation of research publications.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class LiteratureReviewerAgent(BaseAgent):
    """
    Academic literature review and analysis agent.

    Capabilities:
    - Systematic literature reviews
    - Meta-analysis and synthesis
    - Citation network analysis
    - Research gap identification
    - Thematic analysis
    - Quality assessment (GRADE, PRISMA)
    - Literature mapping and visualization
    """

    def __init__(self):
        super().__init__(
            name='literature-reviewer',
            description='Review academic literature and research papers',
            category='research',
            version='1.0.0',
            tags=['literature', 'review', 'academic', 'papers', 'research', 'meta-analysis']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Conduct systematic literature review.

        Args:
            params: {
                'research_question': str,
                'search_query': str,
                'databases': List[str],  # e.g., ['PubMed', 'IEEE', 'ACM', 'Scopus']
                'date_range': {
                    'start_year': int,
                    'end_year': int
                },
                'inclusion_criteria': List[str],
                'exclusion_criteria': List[str],
                'review_type': 'systematic|narrative|scoping|meta-analysis',
                'quality_assessment': {
                    'framework': 'GRADE|PRISMA|CASP|Cochrane',
                    'minimum_quality_score': float
                },
                'options': {
                    'extract_data': bool,
                    'analyze_citations': bool,
                    'identify_gaps': bool,
                    'generate_synthesis': bool,
                    'create_visualizations': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'review_id': str,
                'research_question': str,
                'total_papers_found': int,
                'papers_included': int,
                'papers_excluded': int,
                'papers_reviewed': List[Dict],
                'quality_scores': Dict,
                'themes_identified': List[Dict],
                'research_gaps': List[str],
                'synthesis': Dict,
                'citation_network': Dict,
                'recommendations': List[str]
            }
        """
        research_question = params.get('research_question')
        search_query = params.get('search_query')
        databases = params.get('databases', ['PubMed', 'Google Scholar'])
        review_type = params.get('review_type', 'systematic')
        options = params.get('options', {})

        self.logger.info(
            f"Conducting {review_type} literature review: {research_question}"
        )

        # Mock literature review results
        papers_reviewed = [
            {
                'paper_id': 'PMC8234567',
                'title': 'Machine Learning Applications in Climate Science: A Comprehensive Review',
                'authors': ['Smith, J.', 'Johnson, A.', 'Williams, B.'],
                'year': 2024,
                'journal': 'Nature Climate Change',
                'doi': '10.1038/nclimate.2024.001',
                'citation_count': 145,
                'quality_score': 9.2,
                'study_type': 'Review Article',
                'methodology': 'Systematic Review',
                'sample_size': 'N=250 papers',
                'key_findings': [
                    'Deep learning models outperform traditional methods in climate prediction',
                    'Transfer learning shows promise for limited data scenarios',
                    'Interpretability remains a major challenge'
                ],
                'limitations': [
                    'Limited geographic diversity in training data',
                    'Computational costs remain high'
                ],
                'relevance_score': 0.95,
                'bias_assessment': 'Low risk',
                'themes': ['machine-learning', 'climate-modeling', 'deep-learning']
            },
            {
                'paper_id': 'ARX2023.12345',
                'title': 'Quantum Computing for Weather Forecasting: Current State and Future Directions',
                'authors': ['Chen, L.', 'Patel, R.', 'O\'Brien, K.'],
                'year': 2023,
                'journal': 'Journal of Computational Physics',
                'doi': '10.1016/jcp.2023.456',
                'citation_count': 78,
                'quality_score': 8.7,
                'study_type': 'Original Research',
                'methodology': 'Experimental',
                'sample_size': 'N=1000 simulations',
                'key_findings': [
                    'Quantum annealing reduces computation time by 60%',
                    'Hybrid quantum-classical approaches show best results',
                    'Error correction critical for practical deployment'
                ],
                'limitations': [
                    'Limited to small-scale problems currently',
                    'Hardware availability constraints'
                ],
                'relevance_score': 0.88,
                'bias_assessment': 'Low risk',
                'themes': ['quantum-computing', 'weather-forecasting', 'optimization']
            },
            {
                'paper_id': 'IEEE2024.7890',
                'title': 'Ensemble Methods for Long-term Climate Prediction',
                'authors': ['Garcia, M.', 'Thompson, D.', 'Lee, S.'],
                'year': 2024,
                'journal': 'IEEE Transactions on Geoscience',
                'doi': '10.1109/TGRS.2024.789',
                'citation_count': 92,
                'quality_score': 8.9,
                'study_type': 'Original Research',
                'methodology': 'Comparative Analysis',
                'sample_size': 'N=50 years historical data',
                'key_findings': [
                    'Ensemble averaging improves prediction accuracy by 23%',
                    'Diversity in model architectures essential',
                    'Uncertainty quantification significantly improved'
                ],
                'limitations': [
                    'Increased computational complexity',
                    'Diminishing returns beyond 10 models'
                ],
                'relevance_score': 0.92,
                'bias_assessment': 'Low risk',
                'themes': ['ensemble-methods', 'climate-prediction', 'uncertainty-quantification']
            }
        ]

        themes_identified = [
            {
                'theme': 'Machine Learning in Climate Science',
                'paper_count': 87,
                'prevalence': 0.35,
                'trend': 'increasing',
                'key_concepts': ['deep learning', 'neural networks', 'transfer learning'],
                'representative_papers': 3
            },
            {
                'theme': 'Quantum Computing Applications',
                'paper_count': 34,
                'prevalence': 0.14,
                'trend': 'emerging',
                'key_concepts': ['quantum annealing', 'quantum algorithms', 'hybrid approaches'],
                'representative_papers': 1
            },
            {
                'theme': 'Ensemble and Hybrid Methods',
                'paper_count': 56,
                'prevalence': 0.22,
                'trend': 'stable',
                'key_concepts': ['model averaging', 'uncertainty quantification', 'diversity'],
                'representative_papers': 2
            },
            {
                'theme': 'Data Challenges and Limitations',
                'paper_count': 72,
                'prevalence': 0.29,
                'trend': 'stable',
                'key_concepts': ['data quality', 'geographic bias', 'temporal coverage'],
                'representative_papers': 3
            }
        ]

        research_gaps = [
            'Limited research on interpretability of climate ML models',
            'Insufficient studies on quantum computing scalability',
            'Need for standardized evaluation frameworks',
            'Geographic bias in training datasets under-addressed',
            'Limited cross-disciplinary collaboration studies',
            'Lack of real-world deployment case studies',
            'Insufficient focus on computational sustainability'
        ]

        synthesis = {
            'main_findings': [
                'Machine learning has become dominant methodology in climate prediction',
                'Quantum computing shows promise but faces scalability challenges',
                'Ensemble methods consistently improve prediction accuracy',
                'Interpretability and explainability remain critical gaps',
                'Data quality and geographic representation are ongoing concerns'
            ],
            'consensus_areas': [
                'Deep learning outperforms traditional statistical methods',
                'Hybrid approaches (quantum-classical, ensemble) are most effective',
                'Computational costs are significant barrier to adoption'
            ],
            'controversial_areas': [
                'Optimal model complexity vs. interpretability trade-off',
                'Value of quantum computing vs. development investment',
                'Best practices for uncertainty quantification'
            ],
            'methodological_trends': {
                'dominant_methods': ['Deep Learning', 'Ensemble Methods', 'Transfer Learning'],
                'emerging_methods': ['Quantum Algorithms', 'Federated Learning', 'Causal Inference'],
                'declining_methods': ['Simple Linear Models', 'Single-Model Approaches']
            },
            'temporal_evolution': {
                '2020-2021': 'Foundation building with traditional ML',
                '2022-2023': 'Rise of deep learning and neural networks',
                '2024-2025': 'Exploration of quantum and hybrid approaches'
            }
        }

        citation_network = {
            'highly_cited_papers': [
                {'title': 'Deep Learning for Climate', 'citations': 456, 'year': 2022},
                {'title': 'Climate Modeling Fundamentals', 'citations': 389, 'year': 2020},
                {'title': 'Machine Learning in Earth Sciences', 'citations': 334, 'year': 2021}
            ],
            'influential_authors': [
                {'name': 'Smith, J.', 'h_index': 45, 'papers_in_review': 8},
                {'name': 'Chen, L.', 'h_index': 38, 'papers_in_review': 5},
                {'name': 'Garcia, M.', 'h_index': 42, 'papers_in_review': 6}
            ],
            'citation_patterns': {
                'self_citation_rate': 0.12,
                'interdisciplinary_citation_rate': 0.34,
                'average_citations_per_paper': 67.3,
                'median_paper_age_years': 2.5
            },
            'research_communities': [
                {'name': 'ML for Climate', 'size': 45, 'cohesion': 0.78},
                {'name': 'Quantum Computing', 'size': 23, 'cohesion': 0.82},
                {'name': 'Statistical Methods', 'size': 38, 'cohesion': 0.65}
            ]
        }

        quality_assessment = {
            'framework_used': params.get('quality_assessment', {}).get('framework', 'PRISMA'),
            'average_quality_score': 8.8,
            'quality_distribution': {
                'high_quality (8-10)': 187,
                'medium_quality (6-8)': 58,
                'low_quality (<6)': 5
            },
            'risk_of_bias': {
                'low': 198,
                'moderate': 42,
                'high': 10
            },
            'methodological_rigor': {
                'strong': 165,
                'adequate': 72,
                'weak': 13
            }
        }

        return {
            'status': 'success',
            'review_id': 'LIT-REVIEW-20251116-001',
            'research_question': research_question,
            'search_query': search_query,
            'databases_searched': databases,
            'date_range': params.get('date_range', {'start_year': 2020, 'end_year': 2025}),
            'review_type': review_type,
            'timestamp': '2025-11-16T00:00:00Z',
            'total_papers_found': 1247,
            'papers_screened': 856,
            'papers_included': 250,
            'papers_excluded': 606,
            'exclusion_reasons': {
                'not_peer_reviewed': 234,
                'out_of_scope': 189,
                'insufficient_quality': 98,
                'duplicate': 85
            },
            'papers_reviewed': papers_reviewed[:3],  # Sample of papers
            'total_papers_in_full_review': len(papers_reviewed),
            'quality_assessment': quality_assessment,
            'themes_identified': themes_identified,
            'research_gaps': research_gaps,
            'synthesis': synthesis,
            'citation_network': citation_network,
            'evidence_strength': {
                'strong_evidence': 145,
                'moderate_evidence': 78,
                'weak_evidence': 27
            },
            'geographic_distribution': {
                'North America': 0.38,
                'Europe': 0.32,
                'Asia': 0.22,
                'Other': 0.08
            },
            'funding_sources': {
                'government': 0.54,
                'private': 0.28,
                'mixed': 0.18
            },
            'visualizations': [
                'prisma_flow_diagram.png',
                'citation_network_graph.png',
                'theme_evolution_timeline.png',
                'quality_assessment_distribution.png',
                'geographic_heatmap.png'
            ],
            'recommendations': [
                'Focus future research on interpretability and explainability',
                'Invest in standardized evaluation frameworks',
                'Address geographic bias in datasets',
                'Encourage cross-disciplinary collaboration',
                'Develop computational sustainability guidelines',
                'Create open-access benchmark datasets',
                'Establish best practices for uncertainty quantification'
            ],
            'report_sections': [
                'executive_summary.md',
                'methodology.md',
                'results.md',
                'synthesis.md',
                'discussion.md',
                'conclusions.md',
                'references.bib'
            ],
            'next_steps': [
                'Update review quarterly with new publications',
                'Conduct meta-analysis on quantitative findings',
                'Publish systematic review in peer-reviewed journal',
                'Share findings with research community',
                'Develop research agenda based on identified gaps'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate literature review parameters."""
        if 'research_question' not in params:
            self.logger.error("Missing required field: research_question")
            return False

        valid_review_types = ['systematic', 'narrative', 'scoping', 'meta-analysis']
        review_type = params.get('review_type', 'systematic')
        if review_type not in valid_review_types:
            self.logger.error(f"Invalid review_type: {review_type}")
            return False

        return True
