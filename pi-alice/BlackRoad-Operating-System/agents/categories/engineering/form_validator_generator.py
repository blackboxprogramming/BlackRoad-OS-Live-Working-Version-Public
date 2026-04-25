"""
Form Validator Generator Agent

Generates form validation logic and schemas for various validation
libraries and frameworks.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class FormValidatorGeneratorAgent(BaseAgent):
    """
    Generates form validation code.

    Supports:
    - Yup
    - Joi
    - Zod
    - Ajv (JSON Schema)
    - Vuelidate
    - Custom validators
    """

    def __init__(self):
        super().__init__(
            name='form-validator-generator',
            description='Generate form validation logic and schemas',
            category='engineering',
            version='1.0.0',
            tags=['validation', 'forms', 'frontend', 'backend']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate form validators.

        Args:
            params: {
                'library': 'yup|joi|zod|ajv|vuelidate|custom',
                'language': 'javascript|typescript|python',
                'forms': List[Dict],     # Form definitions
                'options': {
                    'async_validation': bool,
                    'custom_messages': bool,
                    'conditional_validation': bool,
                    'sanitization': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'validators_generated': List[Dict],
                'schemas_generated': List[str],
                'files_generated': List[str],
                'validation_rules': List[str]
            }
        """
        library = params.get('library', 'yup')
        language = params.get('language', 'typescript')
        forms = params.get('forms', [])
        options = params.get('options', {})

        self.logger.info(
            f"Generating {library} validators for {language}"
        )

        # Mock validator generation
        form_definitions = forms or [
            {
                'name': 'LoginForm',
                'fields': [
                    {'name': 'email', 'type': 'email'},
                    {'name': 'password', 'type': 'password'}
                ]
            },
            {
                'name': 'RegisterForm',
                'fields': [
                    {'name': 'username', 'type': 'string'},
                    {'name': 'email', 'type': 'email'},
                    {'name': 'password', 'type': 'password'},
                    {'name': 'confirmPassword', 'type': 'password'}
                ]
            }
        ]

        validators_generated = []
        validation_rules = []

        for form in form_definitions:
            validator_info = {
                'form_name': form['name'],
                'schema_name': f"{form['name']}Schema",
                'fields': [],
                'validation_rules': []
            }

            for field in form.get('fields', []):
                field_rules = self._get_validation_rules(field)
                validator_info['fields'].append({
                    'name': field['name'],
                    'type': field['type'],
                    'rules': field_rules
                })
                validator_info['validation_rules'].extend(field_rules)
                validation_rules.extend(field_rules)

            validators_generated.append(validator_info)

        ext = '.ts' if language == 'typescript' else '.js'
        if language == 'python':
            ext = '.py'

        files_generated = [
            f'validators/index{ext}',
            f'validators/common{ext}',
            f'validators/messages{ext}'
        ]

        for validator in validators_generated:
            form_name = validator['form_name']
            files_generated.append(
                f"validators/{form_name.lower()}{ext}"
            )

        return {
            'status': 'success',
            'library': library,
            'language': language,
            'validators_generated': validators_generated,
            'total_validators': len(validators_generated),
            'schemas_generated': [v['schema_name'] for v in validators_generated],
            'files_generated': files_generated,
            'validation_rules': list(set(validation_rules)),
            'total_fields': sum(len(v['fields']) for v in validators_generated),
            'features': {
                'async_validation': options.get('async_validation', True),
                'custom_messages': options.get('custom_messages', True),
                'conditional_validation': options.get('conditional_validation', True),
                'sanitization': options.get('sanitization', True),
                'cross_field_validation': True,
                'real_time_validation': True
            },
            'validation_types': [
                'Required fields',
                'Email format',
                'Password strength',
                'String length',
                'Number ranges',
                'Pattern matching',
                'Custom validators',
                'Async validators'
            ],
            'example_usage': {
                'LoginForm': {
                    'email': 'user@example.com',
                    'password': 'SecurePass123!'
                }
            },
            'error_messages': {
                'email': {
                    'required': 'Email is required',
                    'format': 'Invalid email format'
                },
                'password': {
                    'required': 'Password is required',
                    'min': 'Password must be at least 8 characters',
                    'strength': 'Password must contain uppercase, lowercase, and numbers'
                }
            } if options.get('custom_messages') else {},
            'next_steps': [
                'Integrate validators with forms',
                'Add custom validation rules',
                'Configure error messages',
                'Add async validators (API checks)',
                'Test validation logic',
                'Add sanitization'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate form validator generation parameters."""
        valid_libraries = ['yup', 'joi', 'zod', 'ajv', 'vuelidate', 'custom']
        library = params.get('library', 'yup')

        if library not in valid_libraries:
            self.logger.error(f"Unsupported library: {library}")
            return False

        return True

    def _get_validation_rules(self, field: Dict) -> List[str]:
        """Get validation rules for field type."""
        field_type = field.get('type', 'string')

        rules_map = {
            'email': ['required', 'email', 'max:255'],
            'password': ['required', 'min:8', 'max:128', 'strong'],
            'string': ['required', 'string', 'max:255'],
            'number': ['required', 'number', 'positive'],
            'url': ['required', 'url'],
            'phone': ['required', 'phone'],
            'date': ['required', 'date'],
            'boolean': ['boolean']
        }

        return rules_map.get(field_type, ['required', 'string'])
