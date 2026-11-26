import 'server-only';
import { z } from 'zod';
import { apiRequest } from '@/lib/api/api-client';
import { type Completion, completionSchema } from '../schemas/completion-schema';
import { type Student, studentSchema } from '../schemas/student-schema';
import type { WorkoutFormValues } from '../schemas/workout-form-schema';
import { exerciseSchema, type Workout, workoutSchema } from '../schemas/workout-schema';
import { toExerciseData, type WorkoutChanges } from './workout-changes';

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

/** Equipe: todas as fichas, ou só as de um aluno. */
export function fetchWorkouts(studentId?: string): Promise<Workout[]> {
  const query = studentId === undefined ? '' : `?studentId=${studentId}`;
  return apiRequest(`/workouts${query}`, { schema: z.array(workoutSchema) });
}

export function fetchWorkout(id: string): Promise<Workout> {
  return apiRequest(`/workouts/${id}`, { schema: workoutSchema });
}

export function fetchStudents(): Promise<Student[]> {
  return apiRequest('/users?role=student', { schema: z.array(studentSchema) });
}

export function createWorkout(values: WorkoutFormValues): Promise<Workout> {
  const body = { ...values, exercises: values.exercises.map(toExerciseData) };
  return apiRequest('/workouts', { method: 'POST', body, schema: workoutSchema });
}

export function deleteWorkout(id: string): Promise<null> {
  return apiRequest(`/workouts/${id}`, { method: 'DELETE', schema: z.null() });
}

/**
 * Aplica as mudanças em sequência: remoções antes das inclusões, para não estourar o limite
 * de exercícios. Não é atômico; se uma etapa falhar, as anteriores ficam gravadas.
 */
export async function applyWorkoutChanges(id: string, changes: WorkoutChanges): Promise<void> {
  const exercisesPath = `/workouts/${id}/exercises`;
  await apiRequest(`/workouts/${id}`, {
    method: 'PATCH',
    body: changes.details,
    schema: workoutSchema,
  });
  for (const exerciseId of changes.removedIds) {
    await apiRequest(`${exercisesPath}/${exerciseId}`, { method: 'DELETE', schema: z.null() });
  }
  for (const { id: exerciseId, data } of changes.updated) {
    await apiRequest(`${exercisesPath}/${exerciseId}`, {
      method: 'PATCH',
      body: data,
      schema: exerciseSchema,
    });
  }
  for (const data of changes.added) {
    await apiRequest(exercisesPath, { method: 'POST', body: data, schema: exerciseSchema });
  }
}
