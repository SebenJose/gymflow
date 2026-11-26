/** Situação da matrícula. `cancelled` é final: não volta a ficar ativa. */
export enum SubscriptionStatus {
  Active = 'active',
  Suspended = 'suspended',
  Cancelled = 'cancelled',
}

/** Situação da mensalidade. O atraso é derivado: `pending` com vencimento no passado. */
export enum InvoiceStatus {
  Pending = 'pending',
  Paid = 'paid',
  Cancelled = 'cancelled',
}
