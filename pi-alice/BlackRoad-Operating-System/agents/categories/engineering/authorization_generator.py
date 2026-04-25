"""
Authorization Generator Agent

Generates RBAC (Role-Based Access Control), ABAC (Attribute-Based),
and permission systems for applications.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class AuthorizationGeneratorAgent(BaseAgent):
    """
    Generates authorization and permission systems.

    Supports:
    - Role-Based Access Control (RBAC)
    - Attribute-Based Access Control (ABAC)
    - Permission-based authorization
    - Resource-level permissions
    - Fine-grained access control
    """

    def __init__(self):
        super().__init__(
            name='authorization-generator',
            description='Generate RBAC/ABAC and permission systems',
            category='engineering',
            version='1.0.0',
            tags=['authorization', 'rbac', 'abac', 'permissions', 'security']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate authorization code.

        Args:
            params: {
                'auth_model': 'rbac|abac|hybrid',
                'language': 'python|javascript|typescript|go',
                'framework': 'fastapi|express|django|gin',
                'roles': List[str],          # Role names
                'resources': List[str],      # Resources to protect
                'options': {
                    'hierarchical_roles': bool,
                    'dynamic_permissions': bool,
                    'resource_ownership': bool,
                    'audit_logging': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'roles_generated': List[Dict],
                'permissions_generated': List[Dict],
                'decorators_generated': List[str],
                'middleware_generated': List[str],
                'files_generated': List[str]
            }
        """
        auth_model = params.get('auth_model', 'rbac')
        language = params.get('language', 'python')
        framework = params.get('framework', 'fastapi')
        roles = params.get('roles', [])
        resources = params.get('resources', [])
        options = params.get('options', {})

        self.logger.info(
            f"Generating {auth_model.upper()} authorization for {framework}"
        )

        # Mock authorization generation
        role_list = roles or ['admin', 'manager', 'user', 'guest']
        resource_list = resources or ['users', 'products', 'orders']

        roles_generated = []
        for role in role_list:
            role_permissions = self._get_role_permissions(role, resource_list)
            roles_generated.append({
                'name': role,
                'permissions': role_permissions,
                'inherits_from': self._get_role_parent(role) if options.get('hierarchical_roles') else None,
                'description': f'{role.capitalize()} role with {len(role_permissions)} permissions'
            })

        permissions_generated = []
        for resource in resource_list:
            for action in ['create', 'read', 'update', 'delete']:
                permissions_generated.append({
                    'name': f'{resource}:{action}',
                    'resource': resource,
                    'action': action,
                    'description': f'Permission to {action} {resource}'
                })

        decorators = [
            '@require_permission',
            '@require_role',
            '@require_ownership',
            '@require_any_permission',
            '@require_all_permissions'
        ]

        middleware_files = [
            'authorization_middleware.py',
            'permission_checker.py',
            'role_checker.py',
            'ownership_checker.py',
            'audit_logger.py' if options.get('audit_logging') else None
        ]

        middleware_files = [m for m in middleware_files if m]

        files_generated = [
            'authorization/models.py',
            'authorization/roles.py',
            'authorization/permissions.py',
            'authorization/decorators.py',
            'authorization/middleware.py',
            'authorization/utils.py',
            'authorization/config.py'
        ]

        if options.get('audit_logging'):
            files_generated.append('authorization/audit.py')

        return {
            'status': 'success',
            'auth_model': auth_model,
            'language': language,
            'framework': framework,
            'roles_generated': roles_generated,
            'total_roles': len(roles_generated),
            'permissions_generated': permissions_generated,
            'total_permissions': len(permissions_generated),
            'decorators_generated': decorators,
            'middleware_generated': middleware_files,
            'files_generated': files_generated,
            'features': {
                'rbac': auth_model in ['rbac', 'hybrid'],
                'abac': auth_model in ['abac', 'hybrid'],
                'hierarchical_roles': options.get('hierarchical_roles', True),
                'dynamic_permissions': options.get('dynamic_permissions', False),
                'resource_ownership': options.get('resource_ownership', True),
                'audit_logging': options.get('audit_logging', True),
                'permission_caching': True,
                'bulk_permission_check': True
            },
            'role_hierarchy': {
                'admin': ['manager', 'user', 'guest'],
                'manager': ['user', 'guest'],
                'user': ['guest'],
                'guest': []
            } if options.get('hierarchical_roles') else {},
            'permission_matrix': self._generate_permission_matrix(
                role_list, resource_list
            ),
            'decorator_examples': {
                '@require_permission': "@require_permission('users:read')",
                '@require_role': "@require_role('admin')",
                '@require_ownership': "@require_ownership(resource='orders', param='order_id')"
            },
            'database_models': [
                'Role',
                'Permission',
                'UserRole',
                'RolePermission',
                'AuditLog'
            ],
            'next_steps': [
                'Define custom roles and permissions',
                'Implement permission checking logic',
                'Add decorators to protected routes',
                'Set up audit logging',
                'Test authorization flows',
                'Configure role hierarchy',
                'Add permission management UI'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate authorization generation parameters."""
        valid_models = ['rbac', 'abac', 'hybrid']
        auth_model = params.get('auth_model', 'rbac')

        if auth_model not in valid_models:
            self.logger.error(f"Invalid auth model: {auth_model}")
            return False

        return True

    def _get_role_permissions(self, role: str, resources: List[str]) -> List[str]:
        """Get permissions for a role."""
        if role == 'admin':
            # Admin gets all permissions
            permissions = []
            for resource in resources:
                for action in ['create', 'read', 'update', 'delete']:
                    permissions.append(f'{resource}:{action}')
            return permissions
        elif role == 'manager':
            # Manager gets read, update, create
            permissions = []
            for resource in resources:
                for action in ['create', 'read', 'update']:
                    permissions.append(f'{resource}:{action}')
            return permissions
        elif role == 'user':
            # User gets read only
            return [f'{resource}:read' for resource in resources]
        else:
            # Guest gets minimal permissions
            return []

    def _get_role_parent(self, role: str) -> str:
        """Get parent role for hierarchy."""
        hierarchy = {
            'admin': None,
            'manager': 'admin',
            'user': 'manager',
            'guest': 'user'
        }
        return hierarchy.get(role)

    def _generate_permission_matrix(
        self,
        roles: List[str],
        resources: List[str]
    ) -> Dict[str, Dict[str, List[str]]]:
        """Generate permission matrix."""
        matrix = {}
        for role in roles:
            matrix[role] = {}
            for resource in resources:
                permissions = self._get_role_permissions(role, [resource])
                actions = [p.split(':')[1] for p in permissions if resource in p]
                matrix[role][resource] = actions
        return matrix
