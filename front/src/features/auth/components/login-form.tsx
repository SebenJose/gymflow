'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { TextField } from '@/components/ui/text-field';
import { ROUTES } from '@/lib/routes';
import { useLoginForm } from '../hooks/use-login-form';

export function LoginForm() {
  const { form, onSubmit } = useLoginForm();
  const { errors, isSubmitting } = form.formState;
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        label="E-mail"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...form.register('email')}
      />
      <TextField
        label="Senha"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...form.register('password')}
      />
      <FormAlert message={errors.root?.message} />
      <Button type="submit" pending={isSubmitting}>
        Entrar
      </Button>
      <p className="text-center text-sm text-muted">
        Ainda não tem conta?{' '}
        <Link href={ROUTES.register} className="text-foreground underline underline-offset-4">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
