"""
Password Policy Enforcer Agent

Enforces password policies including complexity, length, expiration,
and history requirements across systems and applications.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class PasswordPolicyEnforcerAgent(BaseAgent):
    """
    Password policy enforcement agent.

    Enforces:
    - Password complexity requirements
    - Minimum/maximum length
    - Password expiration
    - Password history
    - Account lockout policies
    - Breach detection
    """

    def __init__(self):
        super().__init__(
            name='password-policy-enforcer',
            description='Enforce password policies',
            category='security',
            version='1.0.0',
            tags=['password', 'policy', 'authentication', 'compliance', 'security']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enforce password policies.

        Args:
            params: {
                'action': 'audit|enforce|report|set-policy',
                'scope': {
                    'systems': List[str],
                    'applications': List[str],
                    'user_groups': List[str]
                },
                'policy': {
                    'min_length': int,
                    'max_length': int,
                    'require_uppercase': bool,
                    'require_lowercase': bool,
                    'require_numbers': bool,
                    'require_special_chars': bool,
                    'min_complexity_score': int,
                    'expiration_days': int,
                    'history_count': int,
                    'min_age_days': int,
                    'prevent_common_passwords': bool,
                    'prevent_breached_passwords': bool,
                    'prevent_user_info': bool
                },
                'lockout_policy': {
                    'failed_attempts_threshold': int,
                    'lockout_duration_minutes': int,
                    'reset_attempts_after_minutes': int
                },
                'enforcement_mode': 'advisory|strict|gradual'
            }

        Returns:
            {
                'status': 'success|failed',
                'policy_id': str,
                'enforcement_results': Dict,
                'violations': List[Dict],
                'compliance_rate': float
            }
        """
        action = params.get('action', 'audit')
        scope = params.get('scope', {})
        policy = params.get('policy', {})
        lockout_policy = params.get('lockout_policy', {})
        enforcement_mode = params.get('enforcement_mode', 'strict')

        self.logger.info(
            f"Password policy enforcement - action: {action}, mode: {enforcement_mode}"
        )

        # Mock password policy audit/enforcement results
        violations = [
            {
                'id': 'PWD-001',
                'severity': 'high',
                'category': 'Weak Password',
                'user': 'john.doe',
                'system': 'Active Directory',
                'issue': 'Password does not meet complexity requirements',
                'details': {
                    'length': 8,
                    'has_uppercase': False,
                    'has_lowercase': True,
                    'has_numbers': True,
                    'has_special': False,
                    'complexity_score': 2,
                    'required_score': 4
                },
                'recommendation': 'Change password to meet complexity requirements',
                'action_taken': 'password_reset_required' if enforcement_mode == 'strict' else 'notified'
            },
            {
                'id': 'PWD-002',
                'severity': 'critical',
                'category': 'Breached Password',
                'user': 'jane.smith',
                'system': 'Web Application',
                'issue': 'Password found in breach database',
                'breach_sources': ['HaveIBeenPwned', 'Troy Hunt DB'],
                'times_seen_in_breaches': 15234,
                'recommendation': 'Force immediate password change',
                'action_taken': 'password_reset_required'
            },
            {
                'id': 'PWD-003',
                'severity': 'high',
                'category': 'Expired Password',
                'user': 'bob.wilson',
                'system': 'Unix/Linux',
                'issue': 'Password expired 45 days ago',
                'last_changed': '2025-10-02',
                'days_since_change': 135,
                'policy_max_days': 90,
                'recommendation': 'Enforce password change',
                'action_taken': 'password_reset_required' if enforcement_mode == 'strict' else 'notified'
            },
            {
                'id': 'PWD-004',
                'severity': 'medium',
                'category': 'Password Reuse',
                'user': 'alice.johnson',
                'system': 'Database',
                'issue': 'Password reused from history',
                'password_used_before': True,
                'last_used': '2024-08-15',
                'history_depth': 10,
                'recommendation': 'Use a password not in history',
                'action_taken': 'password_reset_required' if enforcement_mode == 'strict' else 'notified'
            },
            {
                'id': 'PWD-005',
                'severity': 'high',
                'category': 'Common Password',
                'user': 'charlie.brown',
                'system': 'Web Portal',
                'issue': 'Password is on common passwords list',
                'password_pattern': 'Password123!',
                'rank_in_common_passwords': 47,
                'recommendation': 'Use a unique, uncommon password',
                'action_taken': 'password_reset_required'
            },
            {
                'id': 'PWD-006',
                'severity': 'medium',
                'category': 'Personal Info in Password',
                'user': 'david.miller',
                'system': 'Email',
                'issue': 'Password contains user information',
                'contains': ['username', 'birth_year'],
                'recommendation': 'Avoid using personal information in passwords',
                'action_taken': 'warning_issued'
            },
            {
                'id': 'PWD-007',
                'severity': 'low',
                'category': 'Password Age',
                'user': 'emma.davis',
                'system': 'VPN',
                'issue': 'Password unchanged for 85 days',
                'days_since_change': 85,
                'policy_max_days': 90,
                'days_until_expiration': 5,
                'recommendation': 'Password expires soon, consider changing',
                'action_taken': 'notification_sent'
            }
        ]

        severity_counts = {
            'critical': sum(1 for v in violations if v['severity'] == 'critical'),
            'high': sum(1 for v in violations if v['severity'] == 'high'),
            'medium': sum(1 for v in violations if v['severity'] == 'medium'),
            'low': sum(1 for v in violations if v['severity'] == 'low')
        }

        violation_categories = {
            'Weak Password': 1,
            'Breached Password': 1,
            'Expired Password': 1,
            'Password Reuse': 1,
            'Common Password': 1,
            'Personal Info in Password': 1,
            'Password Age': 1
        }

        user_statistics = {
            'total_users_audited': 1234,
            'compliant_users': 1124,
            'non_compliant_users': 110,
            'compliance_rate': 91.1,
            'users_with_weak_passwords': 45,
            'users_with_expired_passwords': 23,
            'users_with_breached_passwords': 5,
            'users_requiring_password_reset': 73
        }

        lockout_statistics = {
            'accounts_locked': 12,
            'lockouts_today': 8,
            'lockouts_this_week': 34,
            'lockouts_this_month': 156,
            'top_lockout_reasons': {
                'Failed login attempts': 127,
                'Brute force protection': 23,
                'Admin action': 6
            }
        }

        policy_effectiveness = {
            'current_policy': {
                'min_length': policy.get('min_length', 12),
                'complexity_required': True,
                'expiration_days': policy.get('expiration_days', 90),
                'history_count': policy.get('history_count', 10),
                'breach_detection': policy.get('prevent_breached_passwords', True)
            },
            'recommended_improvements': [
                'Increase minimum length to 14 characters',
                'Enable passphrase support',
                'Implement risk-based authentication',
                'Add adaptive MFA',
                'Monitor for credential stuffing'
            ]
        }

        enforcement_results = {
            'policies_enforced': 15,
            'users_notified': 110 if enforcement_mode != 'strict' else 0,
            'passwords_reset_required': 73 if enforcement_mode == 'strict' else 0,
            'accounts_locked': 0,
            'warnings_issued': 37,
            'enforcement_mode': enforcement_mode,
            'enforcement_start': '2025-11-16T00:00:00Z'
        }

        return {
            'status': 'success',
            'policy_id': f'password-policy-{action}-20251116-001',
            'action': action,
            'enforcement_mode': enforcement_mode,
            'timestamp': '2025-11-16T00:00:00Z',
            'violations': violations,
            'total_violations': len(violations),
            'severity_counts': severity_counts,
            'violation_categories': violation_categories,
            'user_statistics': user_statistics,
            'lockout_statistics': lockout_statistics,
            'policy_effectiveness': policy_effectiveness,
            'enforcement_results': enforcement_results,
            'systems_covered': len(scope.get('systems', [])) or 8,
            'applications_covered': len(scope.get('applications', [])) or 15,
            'password_strength_distribution': {
                'very_strong': 456,
                'strong': 568,
                'medium': 156,
                'weak': 45,
                'very_weak': 9
            },
            'compliance_status': {
                'overall_compliance_rate': user_statistics['compliance_rate'],
                'trend': 'improving',
                'previous_month_rate': 88.3,
                'improvement': 2.8
            },
            'recommendations': [
                'IMMEDIATE: Force password reset for 5 users with breached passwords',
                'HIGH: Require password change for 45 users with weak passwords',
                'HIGH: Reset expired passwords for 23 users',
                'MEDIUM: Implement passphrase support',
                'MEDIUM: Enable adaptive MFA for sensitive accounts',
                'Integrate with HaveIBeenPwned API',
                'Implement password strength meter in UI',
                'Provide password manager recommendations',
                'Conduct user security awareness training',
                'Monitor for credential stuffing attacks'
            ],
            'best_practices': [
                'Use minimum 12-14 character passwords',
                'Require complexity (upper, lower, numbers, special)',
                'Prevent breached passwords',
                'Implement password history (10-24 passwords)',
                'Use 90-day expiration with risk-based exceptions',
                'Enable account lockout (5-10 attempts)',
                'Implement MFA for privileged accounts',
                'Support passphrases',
                'Provide password strength feedback',
                'Educate users on password security'
            ],
            'reports_generated': [
                f'password_policy_{action}_20251116.pdf',
                f'password_violations_20251116.csv',
                f'password_compliance_report_20251116.json',
                f'password_policy_dashboard_20251116.html'
            ],
            'next_steps': [
                'Review and address critical violations',
                'Enforce password resets for non-compliant users',
                'Update password policy if needed',
                'Implement recommended improvements',
                'Schedule monthly policy audits',
                'Provide user training and resources'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate password policy parameters."""
        valid_actions = ['audit', 'enforce', 'report', 'set-policy']
        action = params.get('action', 'audit')
        if action not in valid_actions:
            self.logger.error(f"Invalid action: {action}")
            return False

        valid_enforcement_modes = ['advisory', 'strict', 'gradual']
        enforcement_mode = params.get('enforcement_mode', 'strict')
        if enforcement_mode not in valid_enforcement_modes:
            self.logger.error(f"Invalid enforcement_mode: {enforcement_mode}")
            return False

        # Validate policy parameters if provided
        policy = params.get('policy', {})
        if 'min_length' in policy and policy['min_length'] < 8:
            self.logger.warning("Minimum password length should be at least 8 characters")

        return True
