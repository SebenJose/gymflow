import 'server-only';
import { z } from 'zod';
import {
  type Invoice,
  invoiceSchema,
  type Plan,
  planSchema,
  type SubscriptionStatus,
} from '@/features/plans';
import { apiRequest } from '@/lib/api/api-client';
import {
  type AdminSubscription,
  adminSubscriptionSchema,
} from '../schemas/admin-subscription-schema';
import type { PlanFormValues } from '../schemas/plan-form-schema';

/** O formulário trabalha em reais; a API, em centavos. */
const toPlanBody = ({ monthlyPrice, ...rest }: PlanFormValues) => ({
  ...rest,
  monthlyPriceCents: monthlyPrice,
});

export function fetchAllPlans(): Promise<Plan[]> {
  return apiRequest('/plans?includeInactive=true', { schema: z.array(planSchema) });
}

export function fetchPlan(id: string): Promise<Plan> {
  return apiRequest(`/plans/${id}`, { schema: planSchema });
}

export function createPlan(values: PlanFormValues): Promise<Plan> {
  return apiRequest('/plans', { method: 'POST', body: toPlanBody(values), schema: planSchema });
}

export function updatePlan(id: string, values: PlanFormValues): Promise<Plan> {
  return apiRequest(`/plans/${id}`, {
    method: 'PATCH',
    body: toPlanBody(values),
    schema: planSchema,
  });
}

export function deletePlan(id: string): Promise<null> {
  return apiRequest(`/plans/${id}`, { method: 'DELETE', schema: z.null() });
}

export function fetchSubscriptions(status?: SubscriptionStatus): Promise<AdminSubscription[]> {
  const query = status === undefined ? '' : `?status=${status}`;
  return apiRequest(`/subscriptions${query}`, { schema: z.array(adminSubscriptionSchema) });
}

export function changeSubscriptionStatus(
  id: string,
  status: SubscriptionStatus,
): Promise<AdminSubscription> {
  return apiRequest(`/subscriptions/${id}/status`, {
    method: 'PATCH',
    body: { status },
    schema: adminSubscriptionSchema,
  });
}

export function payInvoice(id: string): Promise<Invoice> {
  return apiRequest(`/invoices/${id}/pay`, { method: 'PATCH', schema: invoiceSchema });
}
