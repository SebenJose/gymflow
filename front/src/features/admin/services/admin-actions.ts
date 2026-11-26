'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { type ActionResult, invalidInput, toActionFailure } from '@/lib/actions/action-result';
import { ROUTES } from '@/lib/routes';
import { statusChangeSchema } from '../schemas/admin-subscription-schema';
import { planFormSchema } from '../schemas/plan-form-schema';
import {
  changeSubscriptionStatus,
  createPlan,
  deletePlan,
  payInvoice,
  updatePlan,
} from './admin-api';

/** Ações de administrador; a API recusa qualquer outro papel (403). */

export async function savePlanAction(id: unknown, input: unknown): Promise<ActionResult> {
  const planId = z.uuid().nullable().safeParse(id);
  const parsed = planFormSchema.safeParse(input);
  if (!planId.success || !parsed.success) {
    return invalidInput;
  }
  try {
    if (planId.data === null) {
      await createPlan(parsed.data);
    } else {
      await updatePlan(planId.data, parsed.data);
    }
  } catch (error) {
    return toActionFailure(error);
  }
  revalidatePath(ROUTES.plans);
  redirect(ROUTES.plans);
}

export async function deletePlanAction(id: unknown): Promise<ActionResult> {
  const planId = z.uuid().safeParse(id);
  if (!planId.success) {
    return invalidInput;
  }
  try {
    await deletePlan(planId.data);
  } catch (error) {
    return toActionFailure(error);
  }
  revalidatePath(ROUTES.plans);
  redirect(ROUTES.plans);
}

export async function changeStatusAction(input: unknown): Promise<ActionResult> {
  const parsed = statusChangeSchema.safeParse(input);
  if (!parsed.success) {
    return invalidInput;
  }
  try {
    await changeSubscriptionStatus(parsed.data.subscriptionId, parsed.data.status);
  } catch (error) {
    return toActionFailure(error);
  }
  revalidatePath(ROUTES.subscriptions);
  return { ok: true };
}

export async function payInvoiceAction(id: unknown): Promise<ActionResult> {
  const invoiceId = z.uuid().safeParse(id);
  if (!invoiceId.success) {
    return invalidInput;
  }
  try {
    await payInvoice(invoiceId.data);
  } catch (error) {
    return toActionFailure(error);
  }
  revalidatePath(ROUTES.subscriptions);
  return { ok: true };
}
