'use client';

import { Trash2 } from 'lucide-react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import type { WorkoutFormInput } from '../schemas/workout-form-schema';

type ExerciseFieldsProps = {
  index: number;
  register: UseFormRegister<WorkoutFormInput>;
  errors: FieldErrors<WorkoutFormInput>;
  onRemove: (() => void) | null;
};

/** Campos de um exercício da ficha; `onRemove` nulo quando ele é o único. */
export function ExerciseFields({ index, register, errors, onRemove }: ExerciseFieldsProps) {
  const fieldErrors = errors.exercises?.[index];
  const field = (name: keyof WorkoutFormInput['exercises'][number]) =>
    register(`exercises.${index}.${name}`);
  return (
    <fieldset className="flex flex-col gap-3 rounded-md border p-4">
      <div className="flex items-center justify-between gap-2">
        <legend className="text-sm font-medium">Exercício {index + 1}</legend>
        {onRemove !== null && (
          <Button variant="ghost" onClick={onRemove} aria-label={`Remover exercício ${index + 1}`}>
            <Trash2 className="size-4" aria-hidden />
          </Button>
        )}
      </div>
      <TextField label="Nome" error={fieldErrors?.name?.message} {...field('name')} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <TextField
          label="Séries"
          type="number"
          inputMode="numeric"
          error={fieldErrors?.sets?.message}
          {...field('sets')}
        />
        <TextField
          label="Repetições"
          type="number"
          inputMode="numeric"
          error={fieldErrors?.reps?.message}
          {...field('reps')}
        />
        <TextField
          label="Carga (kg)"
          type="number"
          inputMode="decimal"
          step="0.5"
          error={fieldErrors?.loadKg?.message}
          {...field('loadKg')}
        />
        <TextField
          label="Descanso (s)"
          type="number"
          inputMode="numeric"
          error={fieldErrors?.restSeconds?.message}
          {...field('restSeconds')}
        />
      </div>
      <TextField label="Observação" error={fieldErrors?.notes?.message} {...field('notes')} />
    </fieldset>
  );
}
