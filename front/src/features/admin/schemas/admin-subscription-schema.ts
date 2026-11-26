import { z } from 'zod';
import { subscriptionSchema, subscriptionStatusSchema } from '@/features/plans';

export const adminSubscriptionSchema = subscriptionSchema.extend({
  student: z.object({ id: z.string(), name: z.string(), email: z.string() }),
});

export type AdminSubscription = z.infer<typeof adminSubscriptionSchema>;

export const statusChangeSchema = z.object({
  subscriptionId: z.uuid(),
  status: subscriptionStatusSchema,
});
