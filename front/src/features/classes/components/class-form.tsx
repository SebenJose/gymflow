'use client';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { SelectField } from '@/components/ui/select-field';
import { TextareaField } from '@/components/ui/textarea-field';
import { TextField } from '@/components/ui/text-field';
import { useClassForm } from '../hooks/use-class-form';
import type { ClassFormInput } from '../schemas/class-form-schema';
import type { Instructor } from '../schemas/instructor-schema';

type ClassFormProps = {
  defaultValues: ClassFormInput;
  /** Nulo na criação. */
  classId: string | null;
  /** `null` quando quem edita não pode escolher (instrutor): a aula fica com ele. */
  instructors: readonly Instructor[] | null;
};

export function ClassForm({ defaultValues, classId, instructors }: ClassFormProps) {
  const { form, onSubmit } = useClassForm(defaultValues, classId);
  const { register, formState } = form;
  const { errors, isSubmitting } = formState;
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <TextField label="Nome da aula" error={errors.name?.message} {...register('name')} />
      <TextareaField
        label="Descrição"
        error={errors.description?.message}
        {...register('description')}
      />
      {instructors !== null && (
        <SelectField
          label="Instrutor"
          placeholder="Sem instrutor definido"
          options={instructors.map(({ id, name }) => ({ value: id, label: name }))}
          error={errors.instructorId?.message}
          {...register('instructorId')}
        />
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <TextField label="Data" type="date" error={errors.date?.message} {...register('date')} />
        <TextField label="Início" type="time" error={errors.time?.message} {...register('time')} />
        <TextField
          label="Duração (min)"
          type="number"
          inputMode="numeric"
          error={errors.durationMinutes?.message}
          {...register('durationMinutes')}
        />
        <TextField
          label="Vagas"
          type="number"
          inputMode="numeric"
          error={errors.capacity?.message}
          {...register('capacity')}
        />
      </div>
      <FormAlert message={errors.root?.message} />
      <Button type="submit" pending={isSubmitting} className="self-start">
        {classId === null ? 'Criar aula' : 'Salvar alterações'}
      </Button>
    </form>
  );
}
