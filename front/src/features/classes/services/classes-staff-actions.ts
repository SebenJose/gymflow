'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { type ActionResult, invalidInput, toActionFailure } from '@/lib/actions/action-result';
import { ROUTES } from '@/lib/routes';
import { attendanceChangeSchema, classFormSchema } from '../schemas/class-form-schema';
import {
  createClass,
  deleteClass,
  fetchClass,
  markAttendance,
  updateClass,
} from './classes-staff-api';

/** Ações da equipe (instrutor ou admin); a API recusa qualquer outro papel. */

export async function createClassAction(input: unknown): Promise<ActionResult> {
  const parsed = classFormSchema.safeParse(input);
  if (!parsed.success) {
    return invalidInput;
  }
  try {
    await createClass(parsed.data);
  } catch (error) {
    return toActionFailure(error);
  }
  revalidatePath(ROUTES.classes);
  redirect(ROUTES.classes);
}

/** O horário só é enviado se mudou: a API exige horário futuro, e a aula pode já ter passado. */
export async function updateClassAction(id: unknown, input: unknown): Promise<ActionResult> {
  const classId = z.uuid().safeParse(id);
  const parsed = classFormSchema.safeParse(input);
  if (!classId.success || !parsed.success) {
    return invalidInput;
  }
  try {
    const current = await fetchClass(classId.data);
    const { startsAt, ...rest } = parsed.data;
    const moved = new Date(startsAt).getTime() !== new Date(current.startsAt).getTime();
    await updateClass(classId.data, moved ? parsed.data : rest);
  } catch (error) {
    return toActionFailure(error);
  }
  revalidatePath(ROUTES.classes);
  redirect(ROUTES.classes);
}

export async function deleteClassAction(id: unknown): Promise<ActionResult> {
  const classId = z.uuid().safeParse(id);
  if (!classId.success) {
    return invalidInput;
  }
  try {
    await deleteClass(classId.data);
  } catch (error) {
    return toActionFailure(error);
  }
  revalidatePath(ROUTES.classes);
  redirect(ROUTES.classes);
}

export async function markAttendanceAction(input: unknown): Promise<ActionResult> {
  const parsed = attendanceChangeSchema.safeParse(input);
  if (!parsed.success) {
    return invalidInput;
  }
  const { classId, bookingId, attended } = parsed.data;
  try {
    await markAttendance(classId, bookingId, attended);
  } catch (error) {
    return toActionFailure(error);
  }
  revalidatePath(`${ROUTES.classes}/${classId}`);
  return { ok: true };
}
