'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { type RegisterInput, registerSchema } from '../schemas/register-schema';
import { registerAction } from '../services/auth-actions';

type UseRegisterForm = {
  form: UseFormReturn<RegisterInput>;
  onSubmit: () => Promise<void>;
};

export function useRegisterForm(): UseRegisterForm {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', passwordConfirmation: '' },
  });
  const onSubmit = form.handleSubmit(async (data) => {
    const result = await registerAction(data);
    if (!result.ok) {
      form.setError('root', { message: result.message });
    }
  });
  return { form, onSubmit };
}
