"""
Headline Generator Agent

Generates catchy, engaging headlines for various content types using
proven formulas and psychological triggers to maximize clicks and engagement.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class HeadlineGeneratorAgent(BaseAgent):
    """
    Generates attention-grabbing headlines.

    Features:
    - Multiple headline formulas
    - A/B test variations
    - Emotional trigger integration
    - Power word suggestions
    - Click-worthiness scoring
    - Platform-specific optimization
    """

    def __init__(self):
        super().__init__(
            name='headline-generator',
            description='Generate catchy, engaging headlines',
            category='creative',
            version='1.0.0',
            tags=['headlines', 'copywriting', 'engagement', 'marketing']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate headlines.

        Args:
            params: {
                'topic': str,
                'content_type': 'blog|article|video|ad|email|social',
                'target_audience': str,
                'emotion': 'curiosity|urgency|excitement|fear|trust',
                'tone': 'professional|casual|sensational|educational',
                'options': {
                    'count': int,
                    'max_length': int,
                    'include_numbers': bool,
                    'include_power_words': bool,
                    'format': 'list|how_to|question|statement'
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'headlines': List[Dict],
                'top_pick': str,
                'formulas_used': List[str],
                'performance_predictions': Dict
            }
        """
        topic = params.get('topic')
        content_type = params.get('content_type', 'blog')
        target_audience = params.get('target_audience', 'general')
        emotion = params.get('emotion', 'curiosity')
        tone = params.get('tone', 'professional')
        options = params.get('options', {})
        count = options.get('count', 10)

        self.logger.info(
            f"Generating {count} headlines for: {topic}"
        )

        # Mock headline generation
        headlines = [
            {
                'text': f"The Ultimate Guide to {topic}: Everything You Need to Know in 2025",
                'formula': 'Ultimate Guide',
                'score': 92,
                'character_count': 65,
                'power_words': ['Ultimate', 'Everything'],
                'emotional_trigger': 'curiosity',
                'estimated_ctr': '4.2%'
            },
            {
                'text': f"7 Proven {topic} Strategies That Actually Work (With Examples)",
                'formula': 'Number + Benefit + Proof',
                'score': 89,
                'character_count': 58,
                'power_words': ['Proven', 'Actually'],
                'emotional_trigger': 'trust',
                'estimated_ctr': '3.8%'
            },
            {
                'text': f"How to Master {topic} in 30 Days (Even If You're a Complete Beginner)",
                'formula': 'How To + Timeframe + Objection Handler',
                'score': 87,
                'character_count': 72,
                'power_words': ['Master'],
                'emotional_trigger': 'desire',
                'estimated_ctr': '3.9%'
            },
            {
                'text': f"This {topic} Mistake Could Cost You Everything - Here's How to Avoid It",
                'formula': 'Negative + Solution',
                'score': 85,
                'character_count': 68,
                'power_words': ['Everything', 'Avoid'],
                'emotional_trigger': 'fear',
                'estimated_ctr': '4.0%'
            },
            {
                'text': f"Why {topic} is Completely Changing {target_audience.title()} Lives",
                'formula': 'Why + Transformation',
                'score': 84,
                'character_count': 55,
                'power_words': ['Completely', 'Changing'],
                'emotional_trigger': 'curiosity',
                'estimated_ctr': '3.5%'
            },
            {
                'text': f"The Secret to {topic} That Nobody Tells You About",
                'formula': 'Secret + Exclusivity',
                'score': 86,
                'character_count': 52,
                'power_words': ['Secret', 'Nobody'],
                'emotional_trigger': 'curiosity',
                'estimated_ctr': '3.7%'
            },
            {
                'text': f"10 Game-Changing {topic} Tips That Will Transform Your Results",
                'formula': 'Number + Transformation',
                'score': 88,
                'character_count': 63,
                'power_words': ['Game-Changing', 'Transform'],
                'emotional_trigger': 'desire',
                'estimated_ctr': '3.9%'
            },
            {
                'text': f"Stop Wasting Time: The Fastest Way to {topic} (Step-by-Step)",
                'formula': 'Command + Benefit + Proof',
                'score': 83,
                'character_count': 64,
                'power_words': ['Stop', 'Fastest'],
                'emotional_trigger': 'urgency',
                'estimated_ctr': '3.6%'
            },
            {
                'text': f"What Every {target_audience.title()} Should Know About {topic}",
                'formula': 'What + Audience + Topic',
                'score': 81,
                'character_count': 54,
                'power_words': ['Every', 'Should'],
                'emotional_trigger': 'curiosity',
                'estimated_ctr': '3.4%'
            },
            {
                'text': f"Revealed: The {topic} Formula That Experts Don't Want You to Know",
                'formula': 'Reveal + Conspiracy',
                'score': 85,
                'character_count': 68,
                'power_words': ['Revealed', 'Experts'],
                'emotional_trigger': 'curiosity',
                'estimated_ctr': '3.8%'
            }
        ]

        # Sort by score
        headlines.sort(key=lambda x: x['score'], reverse=True)
        top_pick = headlines[0]['text']

        formulas = [
            {
                'name': 'Number + Benefit',
                'template': '[Number] [Adjective] Ways to [Benefit]',
                'example': f"5 Proven Ways to {topic}",
                'best_for': 'Blog posts, listicles'
            },
            {
                'name': 'How To + Benefit',
                'template': 'How to [Achieve Benefit] [Timeframe/Condition]',
                'example': f"How to Master {topic} in 30 Days",
                'best_for': 'Tutorials, guides'
            },
            {
                'name': 'Question',
                'template': '[Question] + [Benefit/Solution]',
                'example': f"Struggling with {topic}? Here's Your Solution",
                'best_for': 'Engagement posts'
            },
            {
                'name': 'Ultimate Guide',
                'template': 'The Ultimate Guide to [Topic]',
                'example': f"The Ultimate Guide to {topic}",
                'best_for': 'Comprehensive content'
            },
            {
                'name': 'Mistake/Warning',
                'template': '[Number] [Topic] Mistakes That [Negative Outcome]',
                'example': f"5 {topic} Mistakes That Cost You Money",
                'best_for': 'Educational content'
            }
        ]

        power_words = {
            'urgency': ['Now', 'Today', 'Hurry', 'Limited', 'Last Chance', 'Urgent'],
            'curiosity': ['Secret', 'Hidden', 'Revealed', 'Discover', 'Unknown', 'Shocking'],
            'value': ['Free', 'Bonus', 'Exclusive', 'Premium', 'Ultimate', 'Complete'],
            'transformation': ['Transform', 'Change', 'Improve', 'Boost', 'Master', 'Achieve'],
            'proof': ['Proven', 'Guaranteed', 'Tested', 'Verified', 'Research', 'Science']
        }

        return {
            'status': 'success',
            'headlines': headlines[:count],
            'top_pick': top_pick,
            'top_3': [h['text'] for h in headlines[:3]],
            'formulas_used': list(set([h['formula'] for h in headlines])),
            'formula_library': formulas,
            'power_words': power_words,
            'optimization_tips': [
                'Keep headlines between 55-65 characters for SEO',
                'Include numbers when possible (odd numbers perform better)',
                'Use power words to trigger emotions',
                'Create curiosity gaps',
                'Be specific and clear',
                'Test multiple variations',
                'Front-load important keywords',
                'Use brackets or parentheses for context'
            ],
            'a_b_test_pairs': [
                {
                    'variant_a': headlines[0]['text'],
                    'variant_b': headlines[1]['text'],
                    'test_factor': 'Formula type'
                },
                {
                    'variant_a': headlines[2]['text'],
                    'variant_b': headlines[3]['text'],
                    'test_factor': 'Emotional trigger'
                }
            ],
            'platform_specific': {
                'google_search': {
                    'optimal_length': '50-60 characters',
                    'recommendation': headlines[5]['text'][:60]
                },
                'facebook': {
                    'optimal_length': '40 characters',
                    'recommendation': f"The {topic} Guide"
                },
                'twitter': {
                    'optimal_length': '70-100 characters',
                    'recommendation': headlines[1]['text']
                },
                'email': {
                    'optimal_length': '30-50 characters',
                    'recommendation': f"{topic}: Your Complete Guide"
                }
            },
            'performance_predictions': {
                'estimated_avg_ctr': '3.8%',
                'top_performer': headlines[0]['text'],
                'predicted_ctr': headlines[0]['estimated_ctr']
            },
            'emotional_analysis': {
                'primary_emotion': emotion,
                'trigger_strength': 'high',
                'engagement_potential': 'very high'
            }
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate headline generation parameters."""
        if 'topic' not in params:
            self.logger.error("Missing required field: topic")
            return False

        return True
