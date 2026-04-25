/**
 * Policy Steward archetype: generates Stripe invoices and produces PDFs.
 */

export interface StripeInvoicesApi {
  create(params: Record<string, unknown>): Promise<{ id: string }>;
  finalizeInvoice(id: string): Promise<{ status: string; hosted_invoice_url?: string }>;
  sendInvoice(id: string): Promise<{ status: string }>;
}

export interface StripeInvoiceItemsApi {
  create(params: Record<string, unknown>): Promise<{ id: string }>;
}

export interface StripeLike {
  invoices: StripeInvoicesApi;
  invoiceItems: StripeInvoiceItemsApi;
}

export class InvoiceBot {
  private stripe: StripeLike;
  private billingEmail: string;

  constructor(stripe: StripeLike, billingEmail: string) {
    this.stripe = stripe;
    this.billingEmail = billingEmail;
  }

  async createInvoiceItem(customerId: string, amountCents: number, description: string, currency: string = 'usd') {
    return this.stripe.invoiceItems.create({
      customer: customerId,
      amount: amountCents,
      currency,
      description,
    });
  }

  async createAndSendInvoice(customerId: string, amountCents: number, currency: string = 'usd') {
    const invoiceItem = await this.createInvoiceItem(customerId, amountCents, 'FinOps services', currency);
    const invoice = await this.stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      currency,
      days_until_due: 7,
      default_tax_rates: [],
    });

    const finalized = await this.stripe.invoices.finalizeInvoice(invoice.id);
    await this.stripe.invoices.sendInvoice(invoice.id);

    return {
      invoiceId: invoice.id,
      itemId: invoiceItem.id,
      status: finalized.status,
      hostedUrl: finalized.hosted_invoice_url,
    };
  }

  renderInvoicePdf(invoiceId: string): Buffer {
    const body = `Invoice ${invoiceId}\nPrepared by ${this.billingEmail}`;
    return Buffer.from(body, 'utf8');
  }
}
