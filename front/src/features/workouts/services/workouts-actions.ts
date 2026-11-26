'use server';

import { revalidatePath } from 'next/cache';
import { type ActionResult, invalidInput, toActionFailure } from '@/lib/actions/action-result';
import { ROUTES } from '@/lib/routes';
import { toggleExerciseSchema } from '../schemas/completion-schema';
import { completeExercise, undoExerciseToday } from './workouts-api';

/** Marca ou desmarca a conclusão de hoje de um exercício da própria ficha. */
export async function toggleExerciseAction(input: unknown): Promise<ActionResult> {
  const parsed = toggleExerciseSchema.safeParse(input);
  if (!parsed.success) {
    return invalidInput;
  }
  const { workoutId, exerciseId, done } = parsed.data;
  try {
    if (done) {
      await completeExercise(workoutId, exerciseId);
    } else {
      await undoExerciseToday(workoutId, exerciseId);
    }
  } catch (error) {
    return toActionFailure(error);
  }
  revalidatePath(ROUTES.workouts);
  return { ok: true };
}
