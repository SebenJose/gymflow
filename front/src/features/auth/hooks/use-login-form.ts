'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { type LoginInput, loginSchema } from '../schemas/login-schema';
import { loginAction } from '../services/auth-actions';

type UseLoginForm = {
  form: UseFormReturn<LoginInput>;
  onSubmit: () => Promise<void>;
};

/** Em caso de sucesso a action redireciona; aqui só se trata a falha. */
export function useLoginForm(): UseLoginForm {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const onSubmit = form.handleSubmit(async (data) => {
    const result = await loginAction(data);
    if (!result.ok) {
      form.setError('root', { message: result.message });
    }
  });
  return { form, onSubmit };
}
