import 'server-only';
import { z } from 'zod';
import { apiRequest } from '@/lib/api/api-client';
import { type Completion, completionSchema } from '../schemas/completion-schema';
import { type Workout, workoutSchema } from '../schemas/workout-schema';

type Period = { from?: string; to?: string };

export function fetchMyWorkouts(): Promise<Workout[]> {
  return apiRequest('/workouts/me', { schema: z.array(workoutSchema) });
}

export function fetchMyCompletions({ from, to }: Period): Promise<Completion[]> {
  const query = new URLSearchParams({ ...(from && { from }), ...(to && { to }) });
  return apiRequest(`/completions/me?${query.toString()}`, { schema: z.array(completionSchema) });
}

const completionsPath = (workoutId: string, exerciseId: string): string =>
  `/workouts/${workoutId}/exercises/${exerciseId}/completions`;

export function completeExercise(workoutId: string, exerciseId: string): Promise<Completion> {
  return apiRequest(completionsPath(workoutId, exerciseId), {
    method: 'POST',
    schema: completionSchema,
  });
}

export function undoExerciseToday(workoutId: string, exerciseId: string): Promise<null> {
  return apiRequest(`${completionsPath(workoutId, exerciseId)}/today`, {
    method: 'DELETE',
    schema: z.null(),
  });
}
