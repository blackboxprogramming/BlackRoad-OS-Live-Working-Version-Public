"""
Expense Tracker Agent

Tracks business expenses, categorizes spending, manages receipts,
and generates expense reports.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class ExpenseTrackerAgent(BaseAgent):
    """
    Tracks and manages business expenses.

    Features:
    - Expense logging
    - Receipt scanning
    - Automatic categorization
    - Budget monitoring
    - Expense reports
    - Reimbursement workflows
    """

    def __init__(self):
        super().__init__(
            name='expense-tracker',
            description='Track and manage business expenses',
            category='business',
            version='1.0.0',
            tags=['expenses', 'finance', 'accounting', 'budgets', 'reporting']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Track and analyze expenses.

        Args:
            params: {
                'operation': 'log|categorize|report|approve|reimburse',
                'expense_data': Dict,
                'date_range': Dict,
                'category_filter': str,
                'options': {
                    'auto_categorize': bool,
                    'scan_receipts': bool,
                    'check_budget': bool,
                    'require_approval': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'expenses': List[Dict],
                'analytics': Dict,
                'budget_status': Dict,
                'recommendations': List[str]
            }
        """
        operation = params.get('operation', 'log')
        date_range = params.get('date_range', {})
        category_filter = params.get('category_filter')
        options = params.get('options', {})

        self.logger.info(f"Expense tracking operation: {operation}")

        # Mock expenses
        expenses = [
            {
                'id': 'EXP-001',
                'date': '2025-11-15',
                'employee': 'John Smith',
                'employee_id': 'EMP-123',
                'merchant': 'Delta Airlines',
                'description': 'Flight to client meeting - NYC',
                'category': 'Travel',
                'subcategory': 'Airfare',
                'amount': 450.00,
                'currency': 'USD',
                'payment_method': 'Corporate Card',
                'billable': True,
                'client': 'Acme Corp',
                'project': 'PRJ-456',
                'receipt_attached': True,
                'status': 'approved',
                'approved_by': 'Manager A',
                'approved_date': '2025-11-16',
                'reimbursement_status': 'not_required'
            },
            {
                'id': 'EXP-002',
                'date': '2025-11-14',
                'employee': 'Sarah Johnson',
                'employee_id': 'EMP-456',
                'merchant': 'Hilton Hotels',
                'description': 'Hotel accommodation - Conference',
                'category': 'Travel',
                'subcategory': 'Lodging',
                'amount': 320.00,
                'currency': 'USD',
                'payment_method': 'Personal Card',
                'billable': False,
                'receipt_attached': True,
                'status': 'pending_approval',
                'reimbursement_status': 'pending'
            },
            {
                'id': 'EXP-003',
                'date': '2025-11-13',
                'employee': 'Mike Chen',
                'employee_id': 'EMP-789',
                'merchant': 'Office Depot',
                'description': 'Office supplies - printer paper, pens',
                'category': 'Office Supplies',
                'subcategory': 'Stationery',
                'amount': 67.50,
                'currency': 'USD',
                'payment_method': 'Corporate Card',
                'billable': False,
                'receipt_attached': True,
                'status': 'approved',
                'approved_by': 'Manager B',
                'approved_date': '2025-11-14',
                'reimbursement_status': 'not_required'
            },
            {
                'id': 'EXP-004',
                'date': '2025-11-12',
                'employee': 'Emily Davis',
                'employee_id': 'EMP-234',
                'merchant': 'AWS',
                'description': 'Cloud hosting - monthly subscription',
                'category': 'Software & Subscriptions',
                'subcategory': 'Cloud Services',
                'amount': 1245.00,
                'currency': 'USD',
                'payment_method': 'Company Account',
                'billable': True,
                'client': 'Multiple',
                'receipt_attached': True,
                'status': 'approved',
                'approved_by': 'Manager C',
                'approved_date': '2025-11-13',
                'reimbursement_status': 'not_required',
                'recurring': True,
                'recurring_frequency': 'monthly'
            },
            {
                'id': 'EXP-005',
                'date': '2025-11-11',
                'employee': 'John Smith',
                'employee_id': 'EMP-123',
                'merchant': 'The Palm Restaurant',
                'description': 'Client dinner - Acme Corp executives',
                'category': 'Meals & Entertainment',
                'subcategory': 'Client Entertainment',
                'amount': 285.00,
                'currency': 'USD',
                'payment_method': 'Personal Card',
                'billable': True,
                'client': 'Acme Corp',
                'attendees': 4,
                'receipt_attached': True,
                'status': 'flagged',
                'flag_reason': 'Amount exceeds policy limit ($250 per meal)',
                'reimbursement_status': 'on_hold'
            }
        ]

        # Mock category breakdown
        category_breakdown = {
            'Travel': {
                'total': 8450.00,
                'count': 23,
                'percentage': 35.2,
                'budget': 10000.00,
                'budget_used': 0.845,
                'subcategories': {
                    'Airfare': 4200.00,
                    'Lodging': 3100.00,
                    'Ground Transportation': 850.00,
                    'Meals': 300.00
                }
            },
            'Software & Subscriptions': {
                'total': 5670.00,
                'count': 15,
                'percentage': 23.6,
                'budget': 6000.00,
                'budget_used': 0.945,
                'subcategories': {
                    'Cloud Services': 3245.00,
                    'SaaS Tools': 1890.00,
                    'Licenses': 535.00
                }
            },
            'Office Supplies': {
                'total': 1234.00,
                'count': 34,
                'percentage': 5.1,
                'budget': 1500.00,
                'budget_used': 0.823
            },
            'Meals & Entertainment': {
                'total': 2890.00,
                'count': 18,
                'percentage': 12.0,
                'budget': 3000.00,
                'budget_used': 0.963
            },
            'Marketing': {
                'total': 4200.00,
                'count': 12,
                'percentage': 17.5,
                'budget': 5000.00,
                'budget_used': 0.840
            },
            'Other': {
                'total': 1556.00,
                'count': 28,
                'percentage': 6.6,
                'budget': 2000.00,
                'budget_used': 0.778
            }
        }

        # Mock budget status
        budget_status = {
            'total_budget_monthly': 27500.00,
            'total_spent_current_month': 24000.00,
            'budget_remaining': 3500.00,
            'budget_used_percentage': 87.3,
            'projected_monthly_spend': 26850.00,
            'on_track': False,
            'over_budget_categories': ['Software & Subscriptions', 'Meals & Entertainment'],
            'under_budget_categories': ['Office Supplies', 'Marketing'],
            'days_remaining_in_month': 14,
            'daily_budget_remaining': 250.00
        }

        # Mock expense analytics
        analytics = {
            'total_expenses_ytd': '$234,567.00',
            'total_expenses_current_month': '$24,000.00',
            'total_expenses_last_month': '$22,450.00',
            'month_over_month_change': 0.069,
            'average_expense_amount': '$127.50',
            'median_expense_amount': '$85.00',
            'largest_expense': {
                'amount': '$5,600.00',
                'description': 'Annual software license renewal',
                'category': 'Software & Subscriptions'
            },
            'expenses_by_employee': {
                'EMP-123': {'name': 'John Smith', 'total': 5670.00, 'count': 42},
                'EMP-456': {'name': 'Sarah Johnson', 'total': 3890.00, 'count': 28},
                'EMP-789': {'name': 'Mike Chen', 'total': 2340.00, 'count': 35},
                'EMP-234': {'name': 'Emily Davis', 'total': 7890.00, 'count': 15}
            },
            'billable_vs_nonbillable': {
                'billable': 14560.00,
                'non_billable': 9440.00,
                'billable_percentage': 0.607
            },
            'pending_approvals': {
                'count': 8,
                'total_amount': 3245.00
            },
            'pending_reimbursements': {
                'count': 12,
                'total_amount': 4567.00
            },
            'flagged_expenses': {
                'count': 3,
                'total_amount': 1890.00,
                'reasons': {
                    'exceeds_policy': 2,
                    'missing_receipt': 1
                }
            }
        }

        # Mock policy violations
        policy_violations = [
            {
                'expense_id': 'EXP-005',
                'violation_type': 'amount_exceeded',
                'policy': 'Meal expense limit: $250 per meal',
                'actual_amount': 285.00,
                'limit': 250.00,
                'severity': 'medium'
            },
            {
                'expense_id': 'EXP-078',
                'violation_type': 'missing_receipt',
                'policy': 'Receipt required for expenses over $50',
                'actual_amount': 125.00,
                'severity': 'high'
            }
        ]

        return {
            'status': 'success',
            'operation': operation,
            'expenses': expenses,
            'total_expenses_count': len(expenses),
            'category_breakdown': category_breakdown,
            'budget_status': budget_status,
            'analytics': analytics,
            'policy_violations': policy_violations,
            'approval_workflow': {
                'pending_approval': 8,
                'auto_approved': 15,  # Under $100
                'requires_manager_approval': 5,  # $100-$1000
                'requires_executive_approval': 2,  # Over $1000
                'average_approval_time_hours': 18.5
            },
            'reimbursement_queue': {
                'pending': 12,
                'processing': 5,
                'completed_this_month': 45,
                'total_pending_amount': '$4,567.00',
                'next_reimbursement_date': '2025-11-20'
            },
            'tax_implications': {
                'deductible_expenses': 21340.00,
                'non_deductible_expenses': 2660.00,
                'tax_savings_estimate': 4268.00  # Assuming 20% tax rate
            },
            'recommendations': [
                'Software & Subscriptions at 94.5% of budget - monitor closely',
                'Meals & Entertainment approaching limit - review upcoming events',
                'Review and approve 8 pending expense reports',
                'Process 12 pending reimbursements ($4,567 total)',
                'Follow up on EXP-005 - exceeds meal policy limit',
                'Request missing receipt for EXP-078',
                'Consider increasing software budget by 10% for next quarter',
                'Enable receipt auto-scanning to reduce processing time'
            ],
            'next_steps': [
                'Review and approve pending expenses',
                'Process reimbursements for approved expenses',
                'Update budget allocations for next month',
                'Generate monthly expense report',
                'Address policy violations',
                'Set up automated expense categorization',
                'Schedule budget review meeting'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate expense tracking parameters."""
        valid_operations = ['log', 'categorize', 'report', 'approve', 'reimburse']

        operation = params.get('operation')
        if operation and operation not in valid_operations:
            self.logger.error(f"Invalid operation: {operation}")
            return False

        return True
