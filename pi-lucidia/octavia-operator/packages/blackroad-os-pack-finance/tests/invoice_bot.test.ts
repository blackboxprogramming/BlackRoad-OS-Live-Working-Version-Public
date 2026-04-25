import { InvoiceBot } from '../agents/invoice_bot';

describe('InvoiceBot', () => {
  const stripeMock = {
    invoiceItems: {
      create: jest.fn(async () => ({ id: 'ii_123' })),
    },
    invoices: {
      create: jest.fn(async () => ({ id: 'in_123' })),
      finalizeInvoice: jest.fn(async () => ({ status: 'finalized', hosted_invoice_url: 'https://pay.test' })),
      sendInvoice: jest.fn(async () => ({ status: 'sent' })),
    },
  };

  beforeEach(() => jest.clearAllMocks());

  it('creates, finalizes, and sends an invoice', async () => {
    const bot = new InvoiceBot(stripeMock as any, 'billing@blackroad.test');
    const result = await bot.createAndSendInvoice('cus_123', 2000, 'usd');

    expect(stripeMock.invoiceItems.create).toHaveBeenCalledWith({
      customer: 'cus_123',
      amount: 2000,
      currency: 'usd',
      description: 'FinOps services',
    });
    expect(stripeMock.invoices.create).toHaveBeenCalled();
    expect(stripeMock.invoices.finalizeInvoice).toHaveBeenCalledWith('in_123');
    expect(stripeMock.invoices.sendInvoice).toHaveBeenCalledWith('in_123');
    expect(result.status).toBe('finalized');
    expect(result.hostedUrl).toBe('https://pay.test');
  });

  it('renders a PDF buffer', () => {
    const bot = new InvoiceBot(stripeMock as any, 'billing@blackroad.test');
    const pdf = bot.renderInvoicePdf('in_123');
    expect(pdf.toString('utf8')).toContain('Invoice in_123');
  });
});
