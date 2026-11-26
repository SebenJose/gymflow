import 'server-only';
import { z } from 'zod';
import { apiRequest } from '@/lib/api/api-client';
import { type Plan, planSchema } from '../schemas/plan-schema';
import { type Subscription, subscriptionSchema } from '../schemas/subscription-schema';

/** Para quem não é admin, a API já devolve só os planos ativos. */
export function fetchPlans(): Promise<Plan[]> {
  return apiRequest('/plans', { schema: z.array(planSchema) });
}

export function fetchMySubscriptions(): Promise<Subscription[]> {
  return apiRequest('/subscriptions/me', { schema: z.array(subscriptionSchema) });
}

export function subscribe(planId: string): Promise<Subscription> {
  return apiRequest('/subscriptions', {
    method: 'POST',
    body: { planId },
    schema: subscriptionSchema,
  });
}
