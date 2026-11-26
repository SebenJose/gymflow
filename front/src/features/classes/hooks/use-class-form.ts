'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';
import {
  type ClassFormInput,
  classFormSchema,
  type ClassFormValues,
} from '../schemas/class-form-schema';
import { createClassAction, updateClassAction } from '../services/classes-staff-actions';

/** `classId` nulo: criação. */
type UseClassForm = {
  form: UseFormReturn<ClassFormInput, unknown, ClassFormValues>;
  onSubmit: () => Promise<void>;
};

export function useClassForm(defaultValues: ClassFormInput, classId: string | null): UseClassForm {
  const form = useForm<ClassFormInput, unknown, ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues,
  });
  // A action revalida no servidor com o mesmo schema, então recebe os valores crus (texto).
  const onSubmit = form.handleSubmit(async () => {
    const values = form.getValues();
    const result =
      classId === null ? await createClassAction(values) : await updateClassAction(classId, values);
    if (!result.ok) {
      form.setError('root', { message: result.message });
    }
  });
  return { form, onSubmit };
}
