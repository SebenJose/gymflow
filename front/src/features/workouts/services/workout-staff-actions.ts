'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { type ActionResult, invalidInput, toActionFailure } from '@/lib/actions/action-result';
import { ROUTES } from '@/lib/routes';
import { workoutFormSchema } from '../schemas/workout-form-schema';
import { diffWorkout } from './workout-changes';
import { applyWorkoutChanges, createWorkout, deleteWorkout, fetchWorkout } from './workouts-api';

/** Ações da equipe (instrutor ou admin); a API recusa qualquer outro papel. */

export async function createWorkoutAction(input: unknown): Promise<ActionResult> {
  const parsed = workoutFormSchema.safeParse(input);
  if (!parsed.success) {
    return invalidInput;
  }
  try {
    await createWorkout(parsed.data);
  } catch (error) {
    return toActionFailure(error);
  }
  revalidatePath(ROUTES.workouts);
  redirect(ROUTES.workouts);
}

export async function updateWorkoutAction(id: unknown, input: unknown): Promise<ActionResult> {
  const workoutId = z.uuid().safeParse(id);
  const parsed = workoutFormSchema.safeParse(input);
  if (!workoutId.success || !parsed.success) {
    return invalidInput;
  }
  try {
    const current = await fetchWorkout(workoutId.data);
    await applyWorkoutChanges(workoutId.data, diffWorkout(current, parsed.data));
  } catch (error) {
    return toActionFailure(error);
  }
  revalidatePath(ROUTES.workouts);
  redirect(ROUTES.workouts);
}

export async function deleteWorkoutAction(id: unknown): Promise<ActionResult> {
  const workoutId = z.uuid().safeParse(id);
  if (!workoutId.success) {
    return invalidInput;
  }
  try {
    await deleteWorkout(workoutId.data);
  } catch (error) {
    return toActionFailure(error);
  }
  revalidatePath(ROUTES.workouts);
  redirect(ROUTES.workouts);
}
