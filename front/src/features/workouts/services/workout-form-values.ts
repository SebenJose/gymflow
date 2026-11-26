import type { WorkoutFormInput } from '../schemas/workout-form-schema';
import type { Workout } from '../schemas/workout-schema';

const toText = (value: number | string | null): string => (value === null ? '' : String(value));

/** Ficha da API → valores do formulário de edição. */
export function toWorkoutFormInput(workout: Workout): WorkoutFormInput {
  return {
    studentId: workout.student.id,
    name: workout.name,
    notes: toText(workout.notes),
    exercises: workout.exercises.map((exercise) => ({
      exerciseId: exercise.id,
      name: exercise.name,
      sets: toText(exercise.sets),
      reps: toText(exercise.reps),
      loadKg: toText(exercise.loadKg),
      restSeconds: toText(exercise.restSeconds),
      notes: toText(exercise.notes),
    })),
  };
}
