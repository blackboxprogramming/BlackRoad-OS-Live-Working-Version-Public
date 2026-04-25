"""
Translation Agent

Translates content to multiple languages while preserving context,
tone, and cultural nuances for global content distribution.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class TranslationAgent(BaseAgent):
    """
    Translates content to multiple languages.

    Features:
    - Multi-language support
    - Context-aware translation
    - Tone preservation
    - Cultural localization
    - Format retention
    - Quality assurance
    """

    def __init__(self):
        super().__init__(
            name='translation-agent',
            description='Translate content to multiple languages',
            category='creative',
            version='1.0.0',
            tags=['translation', 'localization', 'i18n', 'multilingual']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Translate content.

        Args:
            params: {
                'text': str,
                'source_language': str,
                'target_languages': List[str],
                'content_type': 'marketing|technical|casual|formal|legal',
                'options': {
                    'preserve_formatting': bool,
                    'cultural_adaptation': bool,
                    'glossary': Dict[str, str],
                    'tone': 'formal|casual|neutral'
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'translations': Dict[str, str],
                'confidence_scores': Dict[str, float],
                'cultural_notes': List[Dict],
                'quality_metrics': Dict
            }
        """
        text = params.get('text')
        source_language = params.get('source_language', 'en')
        target_languages = params.get('target_languages', [])
        content_type = params.get('content_type', 'marketing')
        options = params.get('options', {})

        self.logger.info(
            f"Translating from {source_language} to {len(target_languages)} languages"
        )

        # Mock translation
        translations = {}
        confidence_scores = {}

        original_text = text or "Welcome to our platform! Discover amazing features that will transform your workflow."

        if 'es' in target_languages:
            translations['es'] = "¡Bienvenido a nuestra plataforma! Descubre características increíbles que transformarán tu flujo de trabajo."
            confidence_scores['es'] = 0.96

        if 'fr' in target_languages:
            translations['fr'] = "Bienvenue sur notre plateforme ! Découvrez des fonctionnalités incroyables qui transformeront votre flux de travail."
            confidence_scores['fr'] = 0.95

        if 'de' in target_languages:
            translations['de'] = "Willkommen auf unserer Plattform! Entdecken Sie erstaunliche Funktionen, die Ihren Workflow transformieren werden."
            confidence_scores['de'] = 0.94

        if 'ja' in target_languages:
            translations['ja'] = "プラットフォームへようこそ！ワークフローを変革する素晴らしい機能を発見してください。"
            confidence_scores['ja'] = 0.93

        if 'zh' in target_languages:
            translations['zh'] = "欢迎来到我们的平台！发现能够改变您工作流程的惊人功能。"
            confidence_scores['zh'] = 0.94

        if 'pt' in target_languages:
            translations['pt'] = "Bem-vindo à nossa plataforma! Descubra recursos incríveis que transformarão seu fluxo de trabalho."
            confidence_scores['pt'] = 0.95

        if 'it' in target_languages:
            translations['it'] = "Benvenuto sulla nostra piattaforma! Scopri funzionalità straordinarie che trasformeranno il tuo flusso di lavoro."
            confidence_scores['it'] = 0.95

        if 'ru' in target_languages:
            translations['ru'] = "Добро пожаловать на нашу платформу! Откройте для себя удивительные функции, которые преобразят ваш рабочий процесс."
            confidence_scores['ru'] = 0.93

        cultural_notes = [
            {
                'language': 'es',
                'note': 'Spanish audiences prefer more enthusiastic tone',
                'suggestion': 'Consider using more exclamation marks',
                'region_variations': {
                    'es-ES': 'Spain Spanish',
                    'es-MX': 'Mexican Spanish',
                    'es-AR': 'Argentine Spanish'
                }
            },
            {
                'language': 'ja',
                'note': 'Japanese prefers more formal and polite language',
                'suggestion': 'Use honorific forms for business content',
                'cultural_tip': 'Avoid direct translations of idioms'
            },
            {
                'language': 'de',
                'note': 'German audiences appreciate precision and detail',
                'suggestion': 'Be specific and avoid vague statements',
                'cultural_tip': 'Formal "Sie" vs informal "du" - choose carefully'
            }
        ]

        supported_languages = {
            'European': [
                {'code': 'en', 'name': 'English'},
                {'code': 'es', 'name': 'Spanish'},
                {'code': 'fr', 'name': 'French'},
                {'code': 'de', 'name': 'German'},
                {'code': 'it', 'name': 'Italian'},
                {'code': 'pt', 'name': 'Portuguese'},
                {'code': 'nl', 'name': 'Dutch'},
                {'code': 'pl', 'name': 'Polish'},
                {'code': 'ru', 'name': 'Russian'}
            ],
            'Asian': [
                {'code': 'zh', 'name': 'Chinese (Simplified)'},
                {'code': 'zh-TW', 'name': 'Chinese (Traditional)'},
                {'code': 'ja', 'name': 'Japanese'},
                {'code': 'ko', 'name': 'Korean'},
                {'code': 'hi', 'name': 'Hindi'},
                {'code': 'th', 'name': 'Thai'},
                {'code': 'vi', 'name': 'Vietnamese'}
            ],
            'Middle Eastern': [
                {'code': 'ar', 'name': 'Arabic'},
                {'code': 'he', 'name': 'Hebrew'},
                {'code': 'fa', 'name': 'Persian'}
            ]
        }

        return {
            'status': 'success',
            'source_text': original_text,
            'source_language': source_language,
            'translations': translations,
            'confidence_scores': confidence_scores,
            'average_confidence': sum(confidence_scores.values()) / len(confidence_scores) if confidence_scores else 0,
            'cultural_notes': cultural_notes,
            'supported_languages': supported_languages,
            'quality_metrics': {
                'fluency': 0.95,
                'accuracy': 0.94,
                'consistency': 0.96,
                'terminology': 0.93,
                'cultural_appropriateness': 0.92
            },
            'localization_tips': {
                'dates_times': 'Format according to local conventions',
                'currency': 'Convert to local currency with symbol',
                'measurements': 'Use metric/imperial based on region',
                'names': 'Consider local naming conventions',
                'colors': 'Be aware of cultural color meanings',
                'idioms': 'Replace with culturally equivalent expressions',
                'images': 'May need region-specific alternatives'
            },
            'best_practices': [
                'Use professional translators for legal/medical content',
                'Maintain glossary of key terms',
                'Consider regional language variations',
                'Test with native speakers',
                'Preserve brand voice across languages',
                'Account for text expansion (German ~30% longer)',
                'Use Unicode UTF-8 encoding',
                'Implement proper date/time localization',
                'Consider right-to-left languages (Arabic, Hebrew)',
                'Plan for ongoing translation updates'
            ],
            'common_challenges': {
                'idioms': 'Direct translation often nonsensical',
                'humor': 'Rarely translates well across cultures',
                'wordplay': 'Usually impossible to preserve',
                'technical_terms': 'May lack equivalents in target language',
                'text_length': 'Translations can be 30-50% longer/shorter',
                'formality': 'Different languages have different formality levels',
                'context': 'Same word may have different meanings'
            },
            'post_translation_checklist': [
                'Proofread by native speaker',
                'Verify technical terminology',
                'Check formatting and special characters',
                'Test in actual application/website',
                'Validate cultural appropriateness',
                'Ensure brand consistency',
                'Review call-to-action translations',
                'Check length fits in UI elements',
                'Verify SEO keyword translations',
                'Test on multiple devices/browsers'
            ],
            'estimated_costs': {
                'professional_translation': '$0.10-0.30 per word',
                'machine_translation': '$0.01-0.05 per word',
                'localization_review': '$50-150 per hour',
                'cultural_consultation': '$100-300 per hour'
            }
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate translation parameters."""
        if 'text' not in params:
            self.logger.error("Missing required field: text")
            return False
        if 'target_languages' not in params or not params['target_languages']:
            self.logger.error("Missing required field: target_languages")
            return False

        return True
