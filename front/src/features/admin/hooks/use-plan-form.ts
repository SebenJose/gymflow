'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';
import {
  type PlanFormInput,
  planFormSchema,
  type PlanFormValues,
} from '../schemas/plan-form-schema';
import { savePlanAction } from '../services/admin-actions';

type UsePlanForm = {
  form: UseFormReturn<PlanFormInput, unknown, PlanFormValues>;
  onSubmit: () => Promise<void>;
};

/** `planId` nulo: criação. */
export function usePlanForm(defaultValues: PlanFormInput, planId: string | null): UsePlanForm {
  const form = useForm<PlanFormInput, unknown, PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues,
  });
  // A action revalida no servidor com o mesmo schema, então recebe os valores crus.
  const onSubmit = form.handleSubmit(async () => {
    const result = await savePlanAction(planId, form.getValues());
    if (!result.ok) {
      form.setError('root', { message: result.message });
    }
  });
  return { form, onSubmit };
}
