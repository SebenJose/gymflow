'use client';

import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { TextareaField } from '@/components/ui/textarea-field';
import { TextField } from '@/components/ui/text-field';
import { usePlanForm } from '../hooks/use-plan-form';
import type { PlanFormInput } from '../schemas/plan-form-schema';

type PlanFormProps = { defaultValues: PlanFormInput; planId: string | null };

export function PlanForm({ defaultValues, planId }: PlanFormProps) {
  const { form, onSubmit } = usePlanForm(defaultValues, planId);
  const { register, formState } = form;
  const { errors, isSubmitting } = formState;
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <TextField label="Nome" error={errors.name?.message} {...register('name')} />
      <TextareaField
        label="Descrição"
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Mensalidade (R$)"
          inputMode="decimal"
          placeholder="129,90"
          error={errors.monthlyPrice?.message}
          {...register('monthlyPrice')}
        />
        <TextField
          label="Duração (meses)"
          type="number"
          inputMode="numeric"
          error={errors.durationMonths?.message}
          {...register('durationMonths')}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-primary" {...register('isActive')} />
        Disponível para contratação
      </label>
      <FormAlert message={errors.root?.message} />
      <Button type="submit" pending={isSubmitting} className="self-start">
        {planId === null ? 'Criar plano' : 'Salvar alterações'}
      </Button>
    </form>
  );
}
