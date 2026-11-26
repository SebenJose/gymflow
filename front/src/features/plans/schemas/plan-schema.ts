import { z } from 'zod';

export const planSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  monthlyPriceCents: z.number().int(),
  durationMonths: z.number().int(),
  isActive: z.boolean(),
});

export type Plan = z.infer<typeof planSchema>;
