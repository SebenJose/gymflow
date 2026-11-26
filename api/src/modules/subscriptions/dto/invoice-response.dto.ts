import type { Invoice } from '../entities/invoice.entity.js';
import type { InvoiceStatus } from '../subscription-status.js';

export class InvoiceResponseDto {
  readonly id: string;
  readonly subscriptionId: string;
  readonly dueDate: string;
  readonly amountCents: number;
  readonly status: InvoiceStatus;
  readonly paidAt: Date | null;

  constructor(invoice: Invoice) {
    this.id = invoice.id;
    this.subscriptionId = invoice.subscriptionId;
    this.dueDate = invoice.dueDate;
    this.amountCents = invoice.amountCents;
    this.status = invoice.status;
    this.paidAt = invoice.paidAt;
  }
}
