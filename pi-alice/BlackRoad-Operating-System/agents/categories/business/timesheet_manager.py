"""
Timesheet Manager Agent

Manages employee timesheets, tracks hours, handles approvals,
and generates time reports for payroll and billing.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class TimesheetManagerAgent(BaseAgent):
    """
    Manages employee timesheets and time tracking.

    Features:
    - Time entry tracking
    - Project time allocation
    - Approval workflows
    - Overtime monitoring
    - Billable hours tracking
    - Payroll integration
    """

    def __init__(self):
        super().__init__(
            name='timesheet-manager',
            description='Manage employee timesheets and time tracking',
            category='business',
            version='1.0.0',
            tags=['timesheet', 'time-tracking', 'hr', 'payroll', 'billing']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Manage timesheets and time tracking.

        Args:
            params: {
                'operation': 'log_time|approve|report|calculate_payroll|generate_invoice',
                'employee_id': str,
                'date_range': Dict,
                'project_id': str,
                'options': {
                    'auto_submit': bool,
                    'check_overtime': bool,
                    'validate_hours': bool,
                    'send_reminders': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'timesheets': List[Dict],
                'analytics': Dict,
                'payroll_summary': Dict,
                'recommendations': List[str]
            }
        """
        operation = params.get('operation', 'log_time')
        employee_id = params.get('employee_id')
        date_range = params.get('date_range', {})
        options = params.get('options', {})

        self.logger.info(f"Timesheet operation: {operation}")

        # Mock timesheet entries
        timesheets = [
            {
                'id': 'TS-001',
                'employee_id': 'EMP-123',
                'employee_name': 'John Smith',
                'week_ending': '2025-11-15',
                'status': 'approved',
                'total_hours': 45.5,
                'regular_hours': 40.0,
                'overtime_hours': 5.5,
                'entries': [
                    {
                        'date': '2025-11-11',
                        'project': 'PRJ-456',
                        'task': 'Frontend Development',
                        'hours': 8.0,
                        'billable': True,
                        'notes': 'Implemented user dashboard'
                    },
                    {
                        'date': '2025-11-12',
                        'project': 'PRJ-456',
                        'task': 'Code Review',
                        'hours': 7.5,
                        'billable': True,
                        'notes': 'Reviewed pull requests'
                    },
                    {
                        'date': '2025-11-13',
                        'project': 'PRJ-789',
                        'task': 'API Development',
                        'hours': 9.0,
                        'billable': True,
                        'notes': 'Built REST endpoints'
                    },
                    {
                        'date': '2025-11-14',
                        'project': 'Internal',
                        'task': 'Team Meeting',
                        'hours': 2.0,
                        'billable': False,
                        'notes': 'Sprint planning'
                    },
                    {
                        'date': '2025-11-14',
                        'project': 'PRJ-456',
                        'task': 'Bug Fixes',
                        'hours': 6.0,
                        'billable': True,
                        'notes': 'Fixed critical bugs'
                    },
                    {
                        'date': '2025-11-15',
                        'project': 'PRJ-789',
                        'task': 'Testing',
                        'hours': 8.0,
                        'billable': True,
                        'notes': 'Integration testing'
                    },
                    {
                        'date': '2025-11-15',
                        'project': 'PRJ-789',
                        'task': 'Documentation',
                        'hours': 5.0,
                        'billable': True,
                        'notes': 'API documentation'
                    }
                ],
                'billable_hours': 43.5,
                'non_billable_hours': 2.0,
                'submitted_date': '2025-11-15',
                'approved_by': 'Manager A',
                'approved_date': '2025-11-16'
            },
            {
                'id': 'TS-002',
                'employee_id': 'EMP-456',
                'employee_name': 'Sarah Johnson',
                'week_ending': '2025-11-15',
                'status': 'pending_approval',
                'total_hours': 40.0,
                'regular_hours': 40.0,
                'overtime_hours': 0.0,
                'billable_hours': 35.0,
                'non_billable_hours': 5.0,
                'submitted_date': '2025-11-15'
            },
            {
                'id': 'TS-003',
                'employee_id': 'EMP-789',
                'employee_name': 'Mike Chen',
                'week_ending': '2025-11-15',
                'status': 'draft',
                'total_hours': 32.0,
                'regular_hours': 32.0,
                'overtime_hours': 0.0,
                'billable_hours': 28.0,
                'non_billable_hours': 4.0,
                'incomplete': True,
                'missing_days': ['2025-11-14', '2025-11-15']
            }
        ]

        # Mock project time allocation
        project_allocation = {
            'PRJ-456': {
                'project_name': 'Acme Corp Website',
                'total_hours': 156.5,
                'billable_hours': 156.5,
                'budget_hours': 200.0,
                'hours_remaining': 43.5,
                'budget_utilization': 0.783,
                'team_members': ['EMP-123', 'EMP-456', 'EMP-234'],
                'status': 'on_track'
            },
            'PRJ-789': {
                'project_name': 'Enterprise API',
                'total_hours': 245.0,
                'billable_hours': 245.0,
                'budget_hours': 250.0,
                'hours_remaining': 5.0,
                'budget_utilization': 0.980,
                'team_members': ['EMP-123', 'EMP-789'],
                'status': 'at_risk'
            },
            'Internal': {
                'project_name': 'Internal Time',
                'total_hours': 78.0,
                'billable_hours': 0.0,
                'budget_hours': None,
                'team_members': ['ALL'],
                'status': 'ongoing'
            }
        }

        # Mock employee analytics
        employee_analytics = {
            'total_employees': 25,
            'timesheets_submitted': 23,
            'timesheets_approved': 20,
            'timesheets_pending': 3,
            'timesheets_incomplete': 2,
            'submission_rate': 0.92,
            'on_time_submission_rate': 0.88,
            'total_hours_week': 987.5,
            'total_billable_hours': 856.0,
            'total_overtime_hours': 34.5,
            'billable_utilization': 0.867,
            'avg_hours_per_employee': 39.5,
            'employees_over_40_hours': 8,
            'employees_under_40_hours': 15
        }

        # Mock payroll summary
        payroll_summary = {
            'pay_period': '2025-11-09 to 2025-11-15',
            'total_regular_hours': 953.0,
            'total_overtime_hours': 34.5,
            'total_regular_pay': '$42,885.00',
            'total_overtime_pay': '$2,587.50',
            'total_payroll': '$45,472.50',
            'employees_with_overtime': [
                {'id': 'EMP-123', 'name': 'John Smith', 'ot_hours': 5.5, 'ot_pay': '$412.50'},
                {'id': 'EMP-234', 'name': 'Emily Davis', 'ot_hours': 8.0, 'ot_pay': '$600.00'},
                {'id': 'EMP-567', 'name': 'David Lee', 'ot_hours': 12.0, 'ot_pay': '$900.00'}
            ],
            'deductions': {
                'federal_tax': '$6,820.88',
                'state_tax': '$2,273.63',
                'social_security': '$2,819.30',
                'medicare': '$659.35',
                'health_insurance': '$1,250.00',
                'retirement_401k': '$2,728.35'
            },
            'net_payroll': '$28,920.99'
        }

        # Mock billable hours by client
        billable_by_client = {
            'Acme Corp': {
                'hours': 156.5,
                'rate': 150.00,
                'amount': 23475.00,
                'projects': ['PRJ-456']
            },
            'Enterprise Inc': {
                'hours': 245.0,
                'rate': 175.00,
                'amount': 42875.00,
                'projects': ['PRJ-789']
            },
            'TechStart': {
                'hours': 89.5,
                'rate': 125.00,
                'amount': 11187.50,
                'projects': ['PRJ-234', 'PRJ-235']
            }
        }

        # Mock compliance issues
        compliance_issues = [
            {
                'type': 'missing_timesheet',
                'employee_id': 'EMP-890',
                'employee_name': 'Robert Brown',
                'week_ending': '2025-11-15',
                'severity': 'high'
            },
            {
                'type': 'excessive_overtime',
                'employee_id': 'EMP-567',
                'employee_name': 'David Lee',
                'overtime_hours': 12.0,
                'threshold': 10.0,
                'severity': 'medium'
            },
            {
                'type': 'incomplete_entries',
                'employee_id': 'EMP-789',
                'employee_name': 'Mike Chen',
                'missing_days': 2,
                'severity': 'medium'
            }
        ]

        return {
            'status': 'success',
            'operation': operation,
            'timesheets': timesheets,
            'total_timesheets': len(timesheets),
            'project_allocation': project_allocation,
            'employee_analytics': employee_analytics,
            'payroll_summary': payroll_summary,
            'billable_summary': {
                'total_billable_hours': 856.0,
                'billable_by_client': billable_by_client,
                'total_billable_amount': '$77,537.50',
                'average_billing_rate': '$90.56'
            },
            'compliance_issues': compliance_issues,
            'approval_queue': {
                'pending_approval': 3,
                'ready_for_payroll': 20,
                'needs_correction': 2,
                'average_approval_time_hours': 8.5
            },
            'overtime_analysis': {
                'total_overtime_hours': 34.5,
                'overtime_cost': '$2,587.50',
                'employees_with_overtime': 3,
                'avg_overtime_per_employee': 11.5,
                'trend': 'increasing',
                'compared_to_last_week': '+12.5%'
            },
            'utilization_metrics': {
                'target_utilization': 0.85,
                'actual_utilization': 0.867,
                'variance': '+2.0%',
                'top_performers': [
                    {'employee': 'John Smith', 'utilization': 0.96},
                    {'employee': 'Emily Davis', 'utilization': 0.92}
                ],
                'underutilized': [
                    {'employee': 'Mike Chen', 'utilization': 0.70},
                    {'employee': 'Lisa Wang', 'utilization': 0.68}
                ]
            },
            'recommendations': [
                'Remind EMP-890 (Robert Brown) to submit timesheet',
                'Review overtime for EMP-567 - exceeds weekly threshold',
                'PRJ-789 approaching hour budget - only 5 hours remaining',
                'Follow up with EMP-789 to complete missing entries',
                'Approve 3 pending timesheets for payroll processing',
                'Investigate increasing overtime trend (+12.5%)',
                'Address underutilization for Mike Chen and Lisa Wang'
            ],
            'next_steps': [
                'Send automated reminders for missing timesheets',
                'Approve pending timesheets',
                'Generate payroll export for accounting',
                'Create client invoices from billable hours',
                'Review and address compliance issues',
                'Update project hour budgets',
                'Schedule time allocation review meeting'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate timesheet management parameters."""
        valid_operations = [
            'log_time', 'approve', 'report',
            'calculate_payroll', 'generate_invoice'
        ]

        operation = params.get('operation')
        if operation and operation not in valid_operations:
            self.logger.error(f"Invalid operation: {operation}")
            return False

        return True
