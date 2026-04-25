"""
Frontend Component Generator Agent

Generates reusable UI components for frontend frameworks including
React, Vue, Angular, and Svelte.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class FrontendComponentGeneratorAgent(BaseAgent):
    """
    Generates frontend UI components.

    Supports:
    - React (JSX/TSX)
    - Vue (SFC)
    - Angular (Component)
    - Svelte
    - Web Components
    """

    def __init__(self):
        super().__init__(
            name='frontend-component-generator',
            description='Generate reusable UI components',
            category='engineering',
            version='1.0.0',
            tags=['frontend', 'ui', 'components', 'react', 'vue']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate frontend components.

        Args:
            params: {
                'framework': 'react|vue|angular|svelte',
                'component_type': 'functional|class|sfc',
                'components': List[str],  # Component names
                'styling': 'css|scss|styled-components|tailwind|css-modules',
                'options': {
                    'typescript': bool,
                    'add_tests': bool,
                    'add_storybook': bool,
                    'add_props_validation': bool,
                    'add_accessibility': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'components_generated': List[Dict],
                'files_generated': List[str],
                'tests_generated': List[str],
                'stories_generated': List[str]
            }
        """
        framework = params.get('framework', 'react')
        component_type = params.get('component_type', 'functional')
        components = params.get('components', [])
        styling = params.get('styling', 'css')
        options = params.get('options', {})

        self.logger.info(
            f"Generating {framework} components with {styling}"
        )

        # Mock component generation
        component_list = components or ['Button', 'Card', 'Modal']

        components_generated = []
        files_generated = []
        tests_generated = []
        stories_generated = []

        for comp_name in component_list:
            ext = '.tsx' if options.get('typescript') else '.jsx'
            if framework == 'vue':
                ext = '.vue'
            elif framework == 'angular':
                ext = '.component.ts'
            elif framework == 'svelte':
                ext = '.svelte'

            component_info = {
                'name': comp_name,
                'file': f'components/{comp_name}/{comp_name}{ext}',
                'props': self._get_mock_props(comp_name),
                'events': self._get_mock_events(comp_name),
                'slots': self._get_mock_slots(comp_name) if framework == 'vue' else None,
                'has_state': True,
                'has_effects': True
            }
            components_generated.append(component_info)

            # Component files
            files_generated.extend([
                f'components/{comp_name}/{comp_name}{ext}',
                f'components/{comp_name}/{comp_name}.{styling}',
                f'components/{comp_name}/index.{ext}'
            ])

            # Test files
            if options.get('add_tests'):
                test_ext = '.test.tsx' if options.get('typescript') else '.test.jsx'
                tests_generated.append(
                    f'components/{comp_name}/{comp_name}{test_ext}'
                )

            # Storybook files
            if options.get('add_storybook'):
                stories_generated.append(
                    f'components/{comp_name}/{comp_name}.stories.{ext}'
                )

        return {
            'status': 'success',
            'framework': framework,
            'component_type': component_type,
            'styling': styling,
            'components_generated': components_generated,
            'total_components': len(components_generated),
            'files_generated': files_generated,
            'tests_generated': tests_generated if options.get('add_tests') else [],
            'stories_generated': stories_generated if options.get('add_storybook') else [],
            'features': {
                'typescript': options.get('typescript', False),
                'props_validation': options.get('add_props_validation', True),
                'accessibility': options.get('add_accessibility', True),
                'responsive': True,
                'themeable': True,
                'documented': True
            },
            'accessibility_features': [
                'ARIA labels',
                'Keyboard navigation',
                'Focus management',
                'Screen reader support',
                'Color contrast compliance'
            ] if options.get('add_accessibility') else [],
            'total_props': sum(len(c['props']) for c in components_generated),
            'total_events': sum(len(c['events']) for c in components_generated),
            'next_steps': [
                'Review component props and API',
                'Customize styling',
                'Add additional variants',
                'Test accessibility',
                'Add to component library',
                'Document usage examples'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate component generation parameters."""
        valid_frameworks = ['react', 'vue', 'angular', 'svelte']
        framework = params.get('framework', 'react')

        if framework not in valid_frameworks:
            self.logger.error(f"Unsupported framework: {framework}")
            return False

        valid_styling = [
            'css', 'scss', 'styled-components',
            'tailwind', 'css-modules'
        ]
        styling = params.get('styling', 'css')

        if styling not in valid_styling:
            self.logger.error(f"Unsupported styling: {styling}")
            return False

        return True

    def _get_mock_props(self, component_name: str) -> List[Dict]:
        """Get mock props for component."""
        common_props = [
            {'name': 'className', 'type': 'string', 'required': False},
            {'name': 'style', 'type': 'CSSProperties', 'required': False}
        ]

        specific_props = {
            'Button': [
                {'name': 'variant', 'type': 'primary|secondary|danger', 'required': False},
                {'name': 'size', 'type': 'small|medium|large', 'required': False},
                {'name': 'disabled', 'type': 'boolean', 'required': False},
                {'name': 'onClick', 'type': 'function', 'required': False}
            ],
            'Card': [
                {'name': 'title', 'type': 'string', 'required': False},
                {'name': 'footer', 'type': 'ReactNode', 'required': False},
                {'name': 'bordered', 'type': 'boolean', 'required': False}
            ],
            'Modal': [
                {'name': 'visible', 'type': 'boolean', 'required': True},
                {'name': 'title', 'type': 'string', 'required': False},
                {'name': 'onClose', 'type': 'function', 'required': True},
                {'name': 'footer', 'type': 'ReactNode', 'required': False}
            ]
        }

        return common_props + specific_props.get(component_name, [])

    def _get_mock_events(self, component_name: str) -> List[str]:
        """Get mock events for component."""
        events_map = {
            'Button': ['onClick', 'onHover', 'onFocus', 'onBlur'],
            'Card': ['onClick', 'onHover'],
            'Modal': ['onClose', 'onOpen', 'onConfirm', 'onCancel']
        }
        return events_map.get(component_name, ['onClick'])

    def _get_mock_slots(self, component_name: str) -> List[str]:
        """Get mock slots for Vue component."""
        slots_map = {
            'Button': ['default', 'icon'],
            'Card': ['default', 'header', 'footer'],
            'Modal': ['default', 'header', 'footer']
        }
        return slots_map.get(component_name, ['default'])
