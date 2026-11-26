'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { TextField } from '@/components/ui/text-field';
import { ROUTES } from '@/lib/routes';
import { useRegisterForm } from '../hooks/use-register-form';

export function RegisterForm() {
  const { form, onSubmit } = useRegisterForm();
  const { errors, isSubmitting } = form.formState;
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        label="Nome"
        autoComplete="name"
        error={errors.name?.message}
        {...form.register('name')}
      />
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
        autoComplete="new-password"
        error={errors.password?.message}
        {...form.register('password')}
      />
      <TextField
        label="Confirme a senha"
        type="password"
        autoComplete="new-password"
        error={errors.passwordConfirmation?.message}
        {...form.register('passwordConfirmation')}
      />
      <FormAlert message={errors.root?.message} />
      <Button type="submit" pending={isSubmitting}>
        Criar conta
      </Button>
      <p className="text-center text-sm text-muted">
        Já tem conta?{' '}
        <Link href={ROUTES.login} className="text-foreground underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </form>
  );
}
