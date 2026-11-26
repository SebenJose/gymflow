'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { SelectField } from '@/components/ui/select-field';
import { TextareaField } from '@/components/ui/textarea-field';
import { TextField } from '@/components/ui/text-field';
import { useWorkoutForm, type WorkoutFormMode } from '../hooks/use-workout-form';
import type { Student } from '../schemas/student-schema';
import type { WorkoutFormInput } from '../schemas/workout-form-schema';
import { ExerciseFields } from './exercise-fields';

type WorkoutFormProps = {
  mode: WorkoutFormMode;
  defaultValues: WorkoutFormInput;
  /** Alunos para escolher na criação; na edição o aluno não muda. */
  students: readonly Student[];
};

export function WorkoutForm({ mode, defaultValues, students }: WorkoutFormProps) {
  const { form, exercises, addExercise, removeExercise, onSubmit } = useWorkoutForm(
    defaultValues,
    mode,
  );
  const { register, formState } = form;
  const { errors, isSubmitting } = formState;
  const options = students.map(({ id, name, email }) => ({
    value: id,
    label: `${name} (${email})`,
  }));
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {mode.kind === 'create' ? (
        <SelectField
          label="Aluno"
          placeholder="Selecione o aluno"
          options={options}
          error={errors.studentId?.message}
          {...register('studentId')}
        />
      ) : (
        <p className="text-sm text-muted">Aluno: {mode.studentName}</p>
      )}
      <TextField
        label="Nome da ficha"
        placeholder="Ex.: Treino A — Superiores"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextareaField label="Observações" error={errors.notes?.message} {...register('notes')} />
      <section className="flex flex-col gap-3" aria-label="Exercícios">
        <h2 className="font-medium">Exercícios</h2>
        {exercises.map((exercise, index) => (
          <ExerciseFields
            key={exercise.id}
            index={index}
            register={register}
            errors={errors}
            onRemove={exercises.length > 1 ? () => removeExercise(index) : null}
          />
        ))}
        <FormAlert message={errors.exercises?.message ?? errors.exercises?.root?.message} />
        <Button variant="secondary" onClick={addExercise} className="self-start">
          <Plus className="size-4" aria-hidden />
          Adicionar exercício
        </Button>
      </section>
      <FormAlert message={errors.root?.message} />
      <Button type="submit" pending={isSubmitting} className="self-start">
        {mode.kind === 'create' ? 'Criar ficha' : 'Salvar alterações'}
      </Button>
    </form>
  );
}
