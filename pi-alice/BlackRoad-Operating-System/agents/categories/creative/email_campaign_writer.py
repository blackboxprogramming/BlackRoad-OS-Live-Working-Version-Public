"""
Email Campaign Writer Agent

Generates effective email campaigns including subject lines, preview text,
body content, and CTAs optimized for conversions and engagement.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class EmailCampaignWriterAgent(BaseAgent):
    """
    Generates email marketing campaigns.

    Features:
    - Subject line optimization
    - Preview text generation
    - Personalization tokens
    - A/B testing variations
    - Mobile optimization
    - Conversion-focused CTAs
    """

    def __init__(self):
        super().__init__(
            name='email-campaign-writer',
            description='Write effective email marketing campaigns',
            category='creative',
            version='1.0.0',
            tags=['email', 'marketing', 'campaigns', 'conversion']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate an email campaign.

        Args:
            params: {
                'campaign_type': 'promotional|newsletter|welcome|abandoned_cart|re_engagement',
                'product_service': str,
                'target_audience': str,
                'goal': 'sales|engagement|awareness|retention',
                'tone': 'professional|friendly|urgent|casual',
                'options': {
                    'personalization': bool,
                    'ab_test_variants': int,
                    'include_preview_text': bool,
                    'mobile_optimized': bool,
                    'include_images': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'subject_lines': List[str],
                'preview_texts': List[str],
                'email_body': str,
                'cta_buttons': List[Dict],
                'performance_predictions': Dict
            }
        """
        campaign_type = params.get('campaign_type', 'promotional')
        product_service = params.get('product_service')
        target_audience = params.get('target_audience', 'customers')
        goal = params.get('goal', 'sales')
        tone = params.get('tone', 'professional')
        options = params.get('options', {})

        self.logger.info(
            f"Generating {campaign_type} email campaign for {product_service}"
        )

        # Mock email campaign generation
        subject_lines = [
            f"🎁 Exclusive Offer: {product_service} Now 40% Off!",
            f"{{FirstName}}, Your Perfect {product_service} Is Waiting",
            f"Last Chance: {product_service} Sale Ends Tonight!",
            f"Don't Miss Out on {product_service} - Limited Time Only",
            f"The {product_service} You've Been Waiting For Is Here"
        ]

        preview_texts = [
            f"Save big on {product_service} today. Hurry, offer expires soon!",
            f"Discover why thousands love {product_service}. See what's new inside.",
            f"Your exclusive discount is ready. Click to claim your savings.",
            f"We thought you'd love this special offer on {product_service}.",
            f"Premium {product_service} at an unbeatable price. Shop now!"
        ]

        email_body = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{product_service} - Special Offer</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

    <!-- Header -->
    <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #007bff;">
        <h1 style="color: #007bff; margin: 0;">Your Brand</h1>
    </div>

    <!-- Hero Section -->
    <div style="text-align: center; padding: 30px 0;">
        <h2 style="color: #333; font-size: 28px; margin-bottom: 10px;">
            Hi {{{{FirstName}}}},
        </h2>
        <p style="font-size: 18px; color: #666;">
            We have something special just for you!
        </p>
    </div>

    <!-- Main Content -->
    <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0;">
        <h3 style="color: #007bff; margin-top: 0;">
            Introducing {product_service}
        </h3>
        <p>
            We're excited to share our latest {product_service} with you.
            As one of our valued {target_audience}, you get exclusive
            early access to this amazing offer.
        </p>

        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h4 style="color: #28a745; margin-top: 0;">Why You'll Love It:</h4>
            <ul style="padding-left: 20px;">
                <li>Premium quality at an affordable price</li>
                <li>Backed by our satisfaction guarantee</li>
                <li>Free shipping on orders over $50</li>
                <li>24/7 customer support</li>
            </ul>
        </div>

        <p>
            <strong>Special Offer:</strong> Use code <span style="background: #ffc107; padding: 5px 10px; border-radius: 4px; font-weight: bold;">SAVE40</span>
            at checkout for 40% off your purchase!
        </p>
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{{{ShopURL}}}}" style="display: inline-block; background: #007bff; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 18px; font-weight: bold;">
            Shop Now
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 10px;">
            Offer expires in 48 hours
        </p>
    </div>

    <!-- Social Proof -->
    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-style: italic; color: #856404;">
            "Best {product_service} I've ever purchased! Highly recommend."
        </p>
        <p style="margin: 10px 0 0 0; color: #856404; font-size: 14px;">
            - Sarah M., Verified Customer ⭐⭐⭐⭐⭐
        </p>
    </div>

    <!-- Secondary CTA -->
    <div style="text-align: center; margin: 30px 0;">
        <p style="color: #666;">
            Not ready to buy? <a href="{{{{LearnMoreURL}}}}" style="color: #007bff; text-decoration: none;">Learn more</a> about our {product_service}.
        </p>
    </div>

    <!-- Footer -->
    <div style="border-top: 2px solid #dee2e6; margin-top: 40px; padding-top: 20px; text-align: center; color: #6c757d; font-size: 12px;">
        <p>
            You're receiving this email because you're a valued member of our community.
        </p>
        <p>
            <a href="{{{{UnsubscribeURL}}}}" style="color: #6c757d;">Unsubscribe</a> |
            <a href="{{{{PreferencesURL}}}}" style="color: #6c757d;">Update Preferences</a>
        </p>
        <p style="margin-top: 20px;">
            Your Brand Inc. | 123 Main St, City, State 12345
        </p>
    </div>

</body>
</html>"""

        plain_text_version = f"""Hi {{{{FirstName}}}},

We have something special just for you!

Introducing {product_service}

We're excited to share our latest {product_service} with you. As one of our
valued {target_audience}, you get exclusive early access to this amazing offer.

Why You'll Love It:
- Premium quality at an affordable price
- Backed by our satisfaction guarantee
- Free shipping on orders over $50
- 24/7 customer support

Special Offer: Use code SAVE40 at checkout for 40% off your purchase!

Shop Now: {{{{ShopURL}}}}

(Offer expires in 48 hours)

"Best {product_service} I've ever purchased! Highly recommend."
- Sarah M., Verified Customer ⭐⭐⭐⭐⭐

Not ready to buy? Learn more: {{{{LearnMoreURL}}}}

---
You're receiving this email because you're a valued member of our community.
Unsubscribe: {{{{UnsubscribeURL}}}}
Update Preferences: {{{{PreferencesURL}}}}

Your Brand Inc. | 123 Main St, City, State 12345
"""

        cta_buttons = [
            {
                'text': 'Shop Now',
                'url': '{{ShopURL}}',
                'style': 'primary',
                'color': '#007bff'
            },
            {
                'text': 'Learn More',
                'url': '{{LearnMoreURL}}',
                'style': 'secondary',
                'color': '#6c757d'
            },
            {
                'text': 'Claim Your Discount',
                'url': '{{DiscountURL}}',
                'style': 'success',
                'color': '#28a745'
            }
        ]

        personalization_tokens = [
            '{{FirstName}}',
            '{{LastName}}',
            '{{Email}}',
            '{{Company}}',
            '{{City}}',
            '{{LastPurchase}}',
            '{{MemberSince}}',
            '{{LoyaltyPoints}}'
        ]

        return {
            'status': 'success',
            'subject_lines': subject_lines,
            'preview_texts': preview_texts,
            'email_body_html': email_body,
            'email_body_plain': plain_text_version,
            'cta_buttons': cta_buttons,
            'personalization_tokens': personalization_tokens,
            'recommended_subject': subject_lines[1],  # Personalized version
            'recommended_preview': preview_texts[1],
            'email_specs': {
                'max_subject_length': 60,
                'max_preview_length': 140,
                'mobile_optimized': True,
                'responsive_design': True,
                'dark_mode_compatible': True
            },
            'ab_test_suggestions': {
                'subject_line': {
                    'variant_a': subject_lines[0],
                    'variant_b': subject_lines[1],
                    'test_metric': 'open_rate'
                },
                'cta_text': {
                    'variant_a': 'Shop Now',
                    'variant_b': 'Get My Discount',
                    'test_metric': 'click_rate'
                },
                'send_time': {
                    'variant_a': '10:00 AM',
                    'variant_b': '2:00 PM',
                    'test_metric': 'engagement'
                }
            },
            'performance_predictions': {
                'expected_open_rate': '22-28%',
                'expected_click_rate': '3-5%',
                'expected_conversion_rate': '1-2%',
                'spam_score': 'Low (2/10)',
                'deliverability_score': 'High (95%)'
            },
            'optimization_tips': [
                'Test subject lines with emojis vs. without',
                'Personalize beyond first name (location, purchase history)',
                'Keep most important content above the fold',
                'Use a clear, single call-to-action',
                'Optimize for mobile (70% of emails opened on mobile)',
                'Include alt text for all images',
                'Test send times for your specific audience',
                'Segment your list for better targeting'
            ],
            'compliance_checklist': {
                'unsubscribe_link': True,
                'physical_address': True,
                'can_spam_compliant': True,
                'gdpr_compliant': True,
                'plain_text_version': True
            },
            'next_steps': [
                'Review and customize content',
                'Set up A/B tests',
                'Configure personalization tokens',
                'Test email rendering across clients',
                'Schedule send time',
                'Set up tracking and analytics'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate email campaign parameters."""
        if 'product_service' not in params:
            self.logger.error("Missing required field: product_service")
            return False

        return True
