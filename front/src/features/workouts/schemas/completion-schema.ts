import { z } from 'zod';

/** Registro de exercício concluído; guarda uma cópia do que estava prescrito. */
export const completionSchema = z.object({
  id: z.string(),
  workoutId: z.string().nullable(),
  exerciseId: z.string().nullable(),
  workoutName: z.string(),
  exerciseName: z.string(),
  sets: z.number().int(),
  reps: z.number().int(),
  loadKg: z.number().nullable(),
  completedOn: z.string(),
  completedAt: z.string(),
});

export type Completion = z.infer<typeof completionSchema>;

export const toggleExerciseSchema = z.object({
  workoutId: z.uuid(),
  exerciseId: z.uuid(),
  done: z.boolean(),
});

export type ToggleExerciseInput = z.infer<typeof toggleExerciseSchema>;
