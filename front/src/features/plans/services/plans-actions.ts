'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { type ActionResult, invalidInput, toActionFailure } from '@/lib/actions/action-result';
import { ROUTES } from '@/lib/routes';
import { subscribe } from './plans-api';

export async function subscribeAction(planId: unknown): Promise<ActionResult> {
  const parsed = z.uuid().safeParse(planId);
  if (!parsed.success) {
    return invalidInput;
  }
  try {
    await subscribe(parsed.data);
  } catch (error) {
    return toActionFailure(error);
  }
  revalidatePath(ROUTES.plans);
  return { ok: true };
}
