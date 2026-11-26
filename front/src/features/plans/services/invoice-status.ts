import type { Invoice } from '../schemas/subscription-schema';

/** Como a mensalidade aparece para o aluno; "atrasada" é derivada, não vem da API. */
export type InvoiceDisplayStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

export function invoiceDisplayStatus(invoice: Invoice, today: string): InvoiceDisplayStatus {
  if (invoice.status === 'pending' && invoice.dueDate < today) {
    return 'overdue';
  }
  return invoice.status;
}
