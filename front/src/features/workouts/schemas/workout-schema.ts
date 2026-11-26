import { z } from 'zod';

const personSchema = z.object({ id: z.string(), name: z.string() });

export const exerciseSchema = z.object({
  id: z.string(),
  position: z.number().int(),
  name: z.string(),
  sets: z.number().int(),
  reps: z.number().int(),
  loadKg: z.number().nullable(),
  restSeconds: z.number().int().nullable(),
  notes: z.string().nullable(),
});

export type Exercise = z.infer<typeof exerciseSchema>;

export const workoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  notes: z.string().nullable(),
  student: personSchema,
  instructor: personSchema.nullable(),
  exercises: z.array(exerciseSchema),
});

export type Workout = z.infer<typeof workoutSchema>;
