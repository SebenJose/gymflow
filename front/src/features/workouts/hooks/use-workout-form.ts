'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type FieldArrayWithId, useFieldArray, useForm, type UseFormReturn } from 'react-hook-form';
import {
  EMPTY_EXERCISE,
  type WorkoutFormInput,
  workoutFormSchema,
  type WorkoutFormValues,
} from '../schemas/workout-form-schema';
import { createWorkoutAction, updateWorkoutAction } from '../services/workout-staff-actions';

/** Criação, ou edição de uma ficha existente. */
export type WorkoutFormMode =
  { kind: 'create' } | { kind: 'edit'; workoutId: string; studentName: string };

type UseWorkoutForm = {
  form: UseFormReturn<WorkoutFormInput, unknown, WorkoutFormValues>;
  exercises: FieldArrayWithId<WorkoutFormInput, 'exercises'>[];
  addExercise: () => void;
  removeExercise: (index: number) => void;
  onSubmit: () => Promise<void>;
};

export function useWorkoutForm(
  defaultValues: WorkoutFormInput,
  mode: WorkoutFormMode,
): UseWorkoutForm {
  const form = useForm<WorkoutFormInput, unknown, WorkoutFormValues>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues,
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'exercises' });

  // A action revalida no servidor com o mesmo schema, então recebe os valores crus (texto).
  const onSubmit = form.handleSubmit(async () => {
    const values = form.getValues();
    const result =
      mode.kind === 'create'
        ? await createWorkoutAction(values)
        : await updateWorkoutAction(mode.workoutId, values);
    if (!result.ok) {
      form.setError('root', { message: result.message });
    }
  });

  return {
    form,
    exercises: fields,
    addExercise: () => append(EMPTY_EXERCISE),
    removeExercise: remove,
    onSubmit,
  };
}
