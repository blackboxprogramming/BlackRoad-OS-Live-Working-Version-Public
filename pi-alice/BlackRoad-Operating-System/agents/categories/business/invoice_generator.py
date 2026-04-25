"""
Invoice Generator Agent

Automatically generates invoices, tracks payments, sends reminders,
and manages billing workflows.
"""

from typing import Any, Dict, List
from agents.base import BaseAgent


class InvoiceGeneratorAgent(BaseAgent):
    """
    Generates and manages invoices and billing.

    Features:
    - Invoice generation
    - Payment tracking
    - Automated reminders
    - Tax calculations
    - Multi-currency support
    - Payment reconciliation
    """

    def __init__(self):
        super().__init__(
            name='invoice-generator',
            description='Generate and manage invoices automatically',
            category='business',
            version='1.0.0',
            tags=['invoicing', 'billing', 'payments', 'accounting', 'finance']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate and manage invoices.

        Args:
            params: {
                'operation': 'generate|send|track|remind|reconcile',
                'customer_id': str,
                'items': List[Dict],
                'currency': str,
                'options': {
                    'auto_send': bool,
                    'payment_terms': int,  # days
                    'include_tax': bool,
                    'send_reminders': bool,
                    'accept_partial_payments': bool
                }
            }

        Returns:
            {
                'status': 'success|failed',
                'invoice': Dict,
                'payment_status': Dict,
                'reminders_sent': List[Dict],
                'recommendations': List[str]
            }
        """
        operation = params.get('operation', 'generate')
        customer_id = params.get('customer_id')
        items = params.get('items', [])
        currency = params.get('currency', 'USD')
        options = params.get('options', {})

        self.logger.info(f"Invoice operation: {operation} for customer {customer_id}")

        # Mock invoice data
        invoice = {
            'id': 'INV-2025-001234',
            'number': '2025-001234',
            'customer': {
                'id': 'CUST-789',
                'name': 'Acme Corporation',
                'email': 'accounts@acmecorp.com',
                'billing_address': {
                    'street': '123 Business Ave',
                    'city': 'San Francisco',
                    'state': 'CA',
                    'zip': '94105',
                    'country': 'USA'
                },
                'tax_id': '12-3456789',
                'payment_terms': 'Net 30'
            },
            'issue_date': '2025-11-16',
            'due_date': '2025-12-16',
            'currency': currency,
            'line_items': [
                {
                    'id': 1,
                    'description': 'Enterprise Plan - Monthly Subscription',
                    'quantity': 1,
                    'unit_price': 499.00,
                    'amount': 499.00,
                    'tax_rate': 0.0875,
                    'tax_amount': 43.66
                },
                {
                    'id': 2,
                    'description': 'Additional User Licenses (x15)',
                    'quantity': 15,
                    'unit_price': 29.00,
                    'amount': 435.00,
                    'tax_rate': 0.0875,
                    'tax_amount': 38.06
                },
                {
                    'id': 3,
                    'description': 'Premium Support Package',
                    'quantity': 1,
                    'unit_price': 199.00,
                    'amount': 199.00,
                    'tax_rate': 0.0875,
                    'tax_amount': 17.41
                }
            ],
            'subtotal': 1133.00,
            'tax_total': 99.13,
            'discount': {
                'type': 'percentage',
                'value': 10,
                'amount': 113.30,
                'reason': 'Annual contract discount'
            },
            'total': 1118.83,
            'amount_paid': 0.00,
            'amount_due': 1118.83,
            'status': 'sent',
            'payment_status': 'pending',
            'notes': 'Thank you for your business!',
            'terms': 'Payment due within 30 days. Late payments subject to 1.5% monthly interest.',
            'payment_methods': ['Bank Transfer', 'Credit Card', 'ACH'],
            'sent_date': '2025-11-16',
            'viewed_count': 2,
            'last_viewed': '2025-11-16 15:30:00'
        }

        # Mock payment tracking
        payment_history = [
            {
                'invoice_id': 'INV-2025-001200',
                'customer_id': 'CUST-789',
                'amount': 1050.00,
                'payment_date': '2025-10-15',
                'payment_method': 'Credit Card',
                'status': 'completed',
                'transaction_id': 'TXN-98765',
                'days_to_payment': 12
            },
            {
                'invoice_id': 'INV-2025-001150',
                'customer_id': 'CUST-789',
                'amount': 1050.00,
                'payment_date': '2025-09-18',
                'payment_method': 'Bank Transfer',
                'status': 'completed',
                'transaction_id': 'TXN-98432',
                'days_to_payment': 8
            }
        ]

        # Mock outstanding invoices
        outstanding_invoices = [
            {
                'id': 'INV-2025-001234',
                'customer': 'Acme Corporation',
                'amount_due': 1118.83,
                'due_date': '2025-12-16',
                'days_outstanding': 0,
                'status': 'current'
            },
            {
                'id': 'INV-2025-001198',
                'customer': 'TechStart Inc',
                'amount_due': 2500.00,
                'due_date': '2025-11-20',
                'days_outstanding': 4,
                'status': 'overdue',
                'reminders_sent': 1
            },
            {
                'id': 'INV-2025-001145',
                'customer': 'Global Services Ltd',
                'amount_due': 5600.00,
                'due_date': '2025-10-30',
                'days_outstanding': 17,
                'status': 'overdue',
                'reminders_sent': 3
            }
        ]

        # Mock reminders
        reminders = [
            {
                'invoice_id': 'INV-2025-001198',
                'type': 'first_reminder',
                'sent_date': '2025-11-20',
                'days_after_due': 0,
                'status': 'sent'
            },
            {
                'invoice_id': 'INV-2025-001145',
                'type': 'second_reminder',
                'sent_date': '2025-11-10',
                'days_after_due': 11,
                'status': 'sent'
            },
            {
                'invoice_id': 'INV-2025-001145',
                'type': 'final_notice',
                'scheduled_date': '2025-11-24',
                'days_after_due': 25,
                'status': 'scheduled'
            }
        ]

        # Mock analytics
        analytics = {
            'total_invoiced_ytd': '$456,789.00',
            'total_paid_ytd': '$398,234.00',
            'total_outstanding': '$58,555.00',
            'invoices_by_status': {
                'draft': 5,
                'sent': 12,
                'viewed': 8,
                'partially_paid': 3,
                'paid': 145,
                'overdue': 7,
                'cancelled': 2
            },
            'average_payment_time': 14.5,  # days
            'on_time_payment_rate': 0.82,
            'overdue_rate': 0.12,
            'aging_report': {
                '0-30_days': '$15,234.00',
                '31-60_days': '$8,900.00',
                '61-90_days': '$12,450.00',
                '90+_days': '$21,971.00'
            },
            'top_customers_by_revenue': [
                {'name': 'Acme Corporation', 'total': '$45,230.00'},
                {'name': 'Global Services Ltd', 'total': '$38,900.00'},
                {'name': 'Enterprise Inc', 'total': '$32,100.00'}
            ],
            'monthly_revenue': {
                'january': 38234,
                'february': 42100,
                'march': 39870,
                'april': 41230,
                'may': 45600,
                'june': 43200,
                'july': 44500,
                'august': 46800,
                'september': 42300,
                'october': 48900,
                'november': 24055  # partial month
            }
        }

        return {
            'status': 'success',
            'operation': operation,
            'invoice': invoice,
            'invoice_url': f'https://invoices.company.com/{invoice["id"]}',
            'pdf_generated': True,
            'payment_status': {
                'status': invoice['payment_status'],
                'amount_due': invoice['amount_due'],
                'due_date': invoice['due_date'],
                'days_until_due': 30,
                'payment_link': f'https://pay.company.com/{invoice["id"]}'
            },
            'payment_history': payment_history,
            'outstanding_invoices': outstanding_invoices,
            'total_outstanding': sum(inv['amount_due'] for inv in outstanding_invoices),
            'reminders': reminders,
            'reminders_scheduled': [r for r in reminders if r['status'] == 'scheduled'],
            'analytics': analytics,
            'tax_summary': {
                'taxable_amount': invoice['subtotal'],
                'tax_rate': 0.0875,
                'tax_collected': invoice['tax_total'],
                'tax_jurisdiction': 'California'
            },
            'automations_active': {
                'auto_send_enabled': options.get('auto_send', True),
                'payment_reminders_enabled': options.get('send_reminders', True),
                'auto_reconciliation_enabled': True,
                'late_fee_calculation': False
            },
            'recommendations': [
                'Follow up on INV-2025-001145 - 17 days overdue',
                'Review payment terms for customers with repeated late payments',
                'Enable auto-charge for customers with saved payment methods',
                'Send monthly statement to customers with multiple invoices',
                'Consider offering early payment discount (2% net 10)',
                'Update tax rates for new jurisdictions',
                'Set up partial payment acceptance for large invoices'
            ],
            'next_steps': [
                'Send invoice to customer email',
                'Schedule automatic payment reminders',
                'Track invoice views and opens',
                'Monitor payment status daily',
                'Generate monthly revenue report',
                'Reconcile payments with bank statements'
            ]
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate invoice generation parameters."""
        valid_operations = ['generate', 'send', 'track', 'remind', 'reconcile']

        operation = params.get('operation')
        if operation and operation not in valid_operations:
            self.logger.error(f"Invalid operation: {operation}")
            return False

        return True
