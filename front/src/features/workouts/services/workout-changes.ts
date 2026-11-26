import type { ExerciseFormValues, WorkoutFormValues } from '../schemas/workout-form-schema';
import type { Workout } from '../schemas/workout-schema';

export type ExerciseData = Omit<ExerciseFormValues, 'exerciseId'>;

export type WorkoutChanges = {
  details: { name: string; notes: string | null };
  removedIds: string[];
  updated: { id: string; data: ExerciseData }[];
  added: ExerciseData[];
};

/** Tira o identificador do formulário, que a API não aceita no corpo. */
export const toExerciseData = (exercise: ExerciseFormValues): ExerciseData => ({
  name: exercise.name,
  sets: exercise.sets,
  reps: exercise.reps,
  loadKg: exercise.loadKg,
  restSeconds: exercise.restSeconds,
  notes: exercise.notes,
});

/**
 * A API edita a ficha e cada exercício por rotas separadas; aqui o formulário é comparado
 * com a ficha atual para saber o que remover, alterar e adicionar.
 */
export function diffWorkout(current: Workout, values: WorkoutFormValues): WorkoutChanges {
  const keptIds = new Set(
    values.exercises.flatMap(({ exerciseId }) => (exerciseId === undefined ? [] : [exerciseId])),
  );
  const currentIds = new Set(current.exercises.map(({ id }) => id));
  return {
    details: { name: values.name, notes: values.notes },
    removedIds: current.exercises.filter(({ id }) => !keptIds.has(id)).map(({ id }) => id),
    updated: values.exercises.flatMap((exercise) =>
      exercise.exerciseId !== undefined && currentIds.has(exercise.exerciseId)
        ? [{ id: exercise.exerciseId, data: toExerciseData(exercise) }]
        : [],
    ),
    added: values.exercises
      .filter(({ exerciseId }) => exerciseId === undefined || !currentIds.has(exerciseId))
      .map(toExerciseData),
  };
}
