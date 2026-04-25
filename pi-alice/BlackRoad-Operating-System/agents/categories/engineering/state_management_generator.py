"""
State Management Generator Agent

Generates state management code for Redux, Vuex, MobX, Zustand,
and other state management libraries.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class StateManagementGeneratorAgent(BaseAgent):
    """
    Generates state management boilerplate.

    Supports:
    - Redux (with Redux Toolkit)
    - Vuex
    - MobX
    - Zustand
    - Recoil
    - Context API
    """

    def __init__(self):
        super().__init__(
            name='state-management-generator',
            description='Generate state management code',
            category='engineering',
            version='1.0.0',
            tags=['state-management', 'redux', 'vuex', 'frontend']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate state management code.

        Args:
            params: {
                'library': 'redux|vuex|mobx|zustand|recoil|context',
                'framework': 'react|vue|angular',
                'stores': List[str],     # Store names (e.g., ['user', 'cart'])
                'options': {
                    'typescript': bool,
                    'add_middleware': bool,
                    'add_persistence': bool,
                    'add_devtools': bool,
                    'async_actions': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'stores_generated': List[Dict],
                'actions_generated': List[str],
                'reducers_generated': List[str],
                'selectors_generated': List[str],
                'files_generated': List[str]
            }
        """
        library = params.get('library', 'redux')
        framework = params.get('framework', 'react')
        stores = params.get('stores', [])
        options = params.get('options', {})

        self.logger.info(
            f"Generating {library} state management for {framework}"
        )

        # Mock state management generation
        store_names = stores or ['user', 'products', 'cart']

        stores_generated = []
        actions_generated = []
        reducers_generated = []
        selectors_generated = []

        for store_name in store_names:
            store_info = {
                'name': store_name,
                'state_shape': self._get_mock_state(store_name),
                'actions': self._get_mock_actions(store_name),
                'mutations': self._get_mock_mutations(store_name) if library == 'vuex' else None,
                'getters': self._get_mock_getters(store_name)
            }
            stores_generated.append(store_info)

            actions_generated.extend([
                f'{store_name}/fetch{store_name.capitalize()}',
                f'{store_name}/update{store_name.capitalize()}',
                f'{store_name}/delete{store_name.capitalize()}'
            ])

            reducers_generated.append(f'{store_name}Reducer')
            selectors_generated.extend([
                f'select{store_name.capitalize()}',
                f'select{store_name.capitalize()}Loading',
                f'select{store_name.capitalize()}Error'
            ])

        ext = '.ts' if options.get('typescript') else '.js'

        files_generated = [
            f'store/index{ext}',
            f'store/rootReducer{ext}' if library == 'redux' else None,
        ]

        for store_name in store_names:
            if library == 'redux':
                files_generated.extend([
                    f'store/{store_name}/slice{ext}',
                    f'store/{store_name}/actions{ext}',
                    f'store/{store_name}/selectors{ext}',
                    f'store/{store_name}/types{ext}'
                ])
            elif library == 'vuex':
                files_generated.append(f'store/modules/{store_name}{ext}')
            elif library in ['zustand', 'recoil']:
                files_generated.append(f'store/{store_name}Store{ext}')

        files_generated = [f for f in files_generated if f]  # Remove None values

        if options.get('add_middleware'):
            files_generated.append(f'store/middleware{ext}')

        if options.get('add_persistence'):
            files_generated.append(f'store/persistence{ext}')

        return {
            'status': 'success',
            'library': library,
            'framework': framework,
            'stores_generated': stores_generated,
            'total_stores': len(stores_generated),
            'actions_generated': actions_generated,
            'reducers_generated': reducers_generated,
            'selectors_generated': selectors_generated,
            'files_generated': files_generated,
            'features': {
                'typescript': options.get('typescript', False),
                'middleware': options.get('add_middleware', True),
                'persistence': options.get('add_persistence', False),
                'devtools': options.get('add_devtools', True),
                'async_actions': options.get('async_actions', True),
                'hot_reload': True,
                'time_travel': library in ['redux', 'vuex']
            },
            'middleware': [
                'Logger middleware',
                'Thunk middleware',
                'Error handling middleware'
            ] if options.get('add_middleware') else [],
            'total_actions': len(actions_generated),
            'total_selectors': len(selectors_generated),
            'next_steps': [
                'Integrate store with application',
                'Connect components to store',
                'Add API integration',
                'Configure persistence',
                'Add error handling',
                'Write state tests'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate state management generation parameters."""
        valid_libraries = ['redux', 'vuex', 'mobx', 'zustand', 'recoil', 'context']
        library = params.get('library', 'redux')

        if library not in valid_libraries:
            self.logger.error(f"Unsupported library: {library}")
            return False

        return True

    def _get_mock_state(self, store_name: str) -> Dict:
        """Get mock state shape."""
        state_shapes = {
            'user': {
                'currentUser': 'User | null',
                'isAuthenticated': 'boolean',
                'loading': 'boolean',
                'error': 'string | null'
            },
            'products': {
                'items': 'Product[]',
                'selectedProduct': 'Product | null',
                'loading': 'boolean',
                'error': 'string | null'
            },
            'cart': {
                'items': 'CartItem[]',
                'total': 'number',
                'loading': 'boolean'
            }
        }
        return state_shapes.get(store_name, {'data': 'any', 'loading': 'boolean'})

    def _get_mock_actions(self, store_name: str) -> List[str]:
        """Get mock actions."""
        return [
            f'fetch{store_name.capitalize()}',
            f'update{store_name.capitalize()}',
            f'delete{store_name.capitalize()}',
            f'reset{store_name.capitalize()}'
        ]

    def _get_mock_mutations(self, store_name: str) -> List[str]:
        """Get mock mutations for Vuex."""
        return [
            f'SET_{store_name.upper()}',
            f'UPDATE_{store_name.upper()}',
            f'DELETE_{store_name.upper()}',
            f'SET_LOADING',
            f'SET_ERROR'
        ]

    def _get_mock_getters(self, store_name: str) -> List[str]:
        """Get mock getters/selectors."""
        return [
            f'get{store_name.capitalize()}',
            f'is{store_name.capitalize()}Loading',
            f'get{store_name.capitalize()}Error'
        ]
