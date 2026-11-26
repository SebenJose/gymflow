import { z } from 'zod';

export const subscriptionStatusSchema = z.enum(['active', 'suspended', 'cancelled']);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const invoiceStatusSchema = z.enum(['pending', 'paid', 'cancelled']);

export const invoiceSchema = z.object({
  id: z.string(),
  dueDate: z.string(),
  amountCents: z.number().int(),
  status: invoiceStatusSchema,
  paidAt: z.string().nullable(),
});

export type Invoice = z.infer<typeof invoiceSchema>;

export const subscriptionSchema = z.object({
  id: z.string(),
  status: subscriptionStatusSchema,
  startDate: z.string(),
  endDate: z.string(),
  monthlyPriceCents: z.number().int(),
  plan: z.object({ id: z.string(), name: z.string(), durationMonths: z.number().int() }),
  invoices: z.array(invoiceSchema),
});

export type Subscription = z.infer<typeof subscriptionSchema>;

/** Ativa ou suspensa: a API não deixa contratar outro plano enquanto houver uma assim. */
export function isOpenSubscription(subscription: Subscription): boolean {
  return subscription.status !== 'cancelled';
}
