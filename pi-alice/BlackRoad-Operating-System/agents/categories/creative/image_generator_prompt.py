"""
Image Generator Prompt Agent

Generates detailed, optimized prompts for AI image generation tools
like DALL-E, Midjourney, Stable Diffusion, and others.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class ImageGeneratorPromptAgent(BaseAgent):
    """
    Generates prompts for AI image generation.

    Features:
    - Platform-specific optimization
    - Style and mood specification
    - Technical parameter suggestions
    - Negative prompt generation
    - Multiple variations
    - Quality enhancement tips
    """

    def __init__(self):
        super().__init__(
            name='image-generator-prompt',
            description='Generate prompts for AI image generation',
            category='creative',
            version='1.0.0',
            tags=['ai-art', 'image-generation', 'prompts', 'dall-e', 'midjourney']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate image generation prompts.

        Args:
            params: {
                'subject': str,
                'style': 'photorealistic|artistic|cartoon|3d|abstract|minimalist',
                'mood': 'bright|dark|mysterious|cheerful|dramatic',
                'platform': 'dalle|midjourney|stable_diffusion|general',
                'aspect_ratio': '1:1|16:9|9:16|4:3',
                'options': {
                    'include_negative_prompt': bool,
                    'include_parameters': bool,
                    'variations': int,
                    'quality_level': 'standard|high|ultra'
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'prompts': List[Dict],
                'negative_prompts': List[str],
                'parameters': Dict,
                'tips': List[str]
            }
        """
        subject = params.get('subject')
        style = params.get('style', 'photorealistic')
        mood = params.get('mood', 'bright')
        platform = params.get('platform', 'general')
        aspect_ratio = params.get('aspect_ratio', '1:1')
        options = params.get('options', {})
        variations_count = options.get('variations', 3)

        self.logger.info(
            f"Generating {platform} prompts for: {subject}"
        )

        # Mock prompt generation
        prompts = [
            {
                'prompt': f"{style} image of {subject}, {mood} atmosphere, professional photography, highly detailed, 8k resolution, trending on artstation",
                'variation': 1,
                'emphasis': 'quality and detail',
                'platform_optimized': platform
            },
            {
                'prompt': f"{subject} in {style} style, {mood} lighting, cinematic composition, depth of field, award-winning photograph, masterpiece",
                'variation': 2,
                'emphasis': 'artistic composition',
                'platform_optimized': platform
            },
            {
                'prompt': f"stunning {subject}, {style} aesthetic, {mood} color palette, intricate details, ultra HD, volumetric lighting, epic scene",
                'variation': 3,
                'emphasis': 'visual impact',
                'platform_optimized': platform
            }
        ]

        # Platform-specific prompts
        if platform == 'midjourney':
            prompts.append({
                'prompt': f"{subject}, {style}, {mood}, ultra detailed, 8k, --ar {aspect_ratio} --v 6 --style raw --quality 2",
                'variation': 'midjourney_optimized',
                'emphasis': 'midjourney parameters',
                'platform_optimized': 'midjourney'
            })
        elif platform == 'dalle':
            prompts.append({
                'prompt': f"A {style} {mood} image of {subject}, highly detailed, professional quality, perfect composition",
                'variation': 'dalle_optimized',
                'emphasis': 'clarity and detail',
                'platform_optimized': 'dalle'
            })
        elif platform == 'stable_diffusion':
            prompts.append({
                'prompt': f"({subject}:1.3), {style}, {mood} lighting, masterpiece, best quality, ultra detailed, 8k uhd, (perfect composition:1.2)",
                'variation': 'stable_diffusion_optimized',
                'emphasis': 'weighted tokens',
                'platform_optimized': 'stable_diffusion'
            })

        negative_prompts = [
            "blurry, low quality, pixelated, distorted, ugly, deformed",
            "bad anatomy, poorly drawn, amateur, low resolution, watermark",
            "text, signature, username, error, duplicate, mutation",
            "out of frame, cropped, worst quality, jpeg artifacts",
            "overexposed, underexposed, bad lighting, bad colors"
        ]

        parameters = {
            'midjourney': {
                'version': '--v 6',
                'quality': '--q 2',
                'stylize': '--s 750',
                'aspect_ratio': f'--ar {aspect_ratio}',
                'chaos': '--c 0-100 (0=predictable, 100=varied)',
                'style': '--style raw/cute/scenic/expressive'
            },
            'dalle': {
                'size': '1024x1024, 1792x1024, 1024x1792',
                'quality': 'standard or hd',
                'style': 'vivid or natural'
            },
            'stable_diffusion': {
                'steps': '20-50',
                'cfg_scale': '7-12',
                'sampler': 'DPM++ 2M Karras, Euler a, DDIM',
                'seed': 'random or specific',
                'denoising_strength': '0.3-0.8 (for img2img)'
            }
        }

        style_modifiers = {
            'photography': ['bokeh', 'shallow depth of field', 'golden hour', 'professional lighting', 'DSLR'],
            'artistic': ['oil painting', 'watercolor', 'digital art', 'concept art', 'studio ghibli style'],
            'cinematic': ['volumetric lighting', 'dramatic lighting', 'wide angle', 'cinematic color grading', 'film grain'],
            'technical': ['8k resolution', 'ultra detailed', 'highly realistic', 'sharp focus', 'intricate details'],
            'aesthetic': ['aesthetically pleasing', 'beautiful', 'stunning', 'gorgeous', 'breathtaking']
        }

        return {
            'status': 'success',
            'prompts': prompts[:variations_count + 1],
            'negative_prompts': negative_prompts if options.get('include_negative_prompt') else [],
            'parameters': parameters.get(platform, parameters) if options.get('include_parameters') else {},
            'style_modifiers': style_modifiers,
            'composition_tips': [
                'Specify camera angle (bird\'s eye, worm\'s eye, eye level)',
                'Define lighting (natural light, studio lighting, dramatic)',
                'Mention composition (rule of thirds, centered, symmetrical)',
                'Include quality descriptors (8k, ultra detailed, masterpiece)',
                'Specify artistic style or reference (like Studio Ghibli, Greg Rutkowski)'
            ],
            'platform_tips': {
                'midjourney': [
                    'Use parameters after the prompt',
                    'Weight important elements with :: notation',
                    'Use --no to exclude unwanted elements',
                    'Remix mode for variations',
                    'Use /blend for combining images'
                ],
                'dalle': [
                    'Be specific and descriptive',
                    'Specify art style clearly',
                    'Use natural language',
                    'Describe lighting and mood',
                    'Keep prompts concise but detailed'
                ],
                'stable_diffusion': [
                    'Use emphasis with parentheses (important:1.3)',
                    'Negative prompts are crucial',
                    'Lower CFG scale for more creativity',
                    'Higher steps for better quality',
                    'Use embeddings and LoRAs for specific styles'
                ]
            },
            'quality_keywords': [
                '8k resolution',
                'ultra detailed',
                'masterpiece',
                'best quality',
                'highly realistic',
                'photorealistic',
                'professional',
                'award winning',
                'trending on artstation',
                'sharp focus'
            ],
            'common_mistakes': [
                'Being too vague or generic',
                'Not specifying style clearly',
                'Forgetting lighting details',
                'Overloading with too many concepts',
                'Not using negative prompts',
                'Ignoring composition',
                'Not specifying quality level'
            ],
            'example_workflows': {
                'portrait': f"{style} portrait of {subject}, {mood} lighting, bokeh background, professional photography, 50mm lens, f/1.8",
                'landscape': f"{style} landscape of {subject}, {mood} sky, golden hour, wide angle, epic vista, highly detailed",
                'product': f"{style} product photography of {subject}, {mood} studio lighting, white background, commercial photography, 8k",
                'concept_art': f"{style} concept art of {subject}, {mood} atmosphere, digital painting, trending on artstation, highly detailed"
            }
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate image prompt generation parameters."""
        if 'subject' not in params:
            self.logger.error("Missing required field: subject")
            return False

        return True
