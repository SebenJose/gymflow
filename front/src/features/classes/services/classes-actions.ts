'use server';

import { revalidatePath } from 'next/cache';
import { type ActionResult, invalidInput, toActionFailure } from '@/lib/actions/action-result';
import { ROUTES } from '@/lib/routes';
import { bookingChangeSchema } from '../schemas/class-schema';
import { bookClass, cancelBooking } from './classes-api';

/** Inscreve (`book: true`) ou cancela a inscrição do aluno; vagas e regras ficam na API. */
export async function changeBookingAction(input: unknown): Promise<ActionResult> {
  const parsed = bookingChangeSchema.safeParse(input);
  if (!parsed.success) {
    return invalidInput;
  }
  const { classId, book } = parsed.data;
  try {
    if (book) {
      await bookClass(classId);
    } else {
      await cancelBooking(classId);
    }
  } catch (error) {
    return toActionFailure(error);
  }
  revalidatePath(ROUTES.classes);
  return { ok: true };
}
