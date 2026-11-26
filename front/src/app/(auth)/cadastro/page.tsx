import type { Metadata } from 'next';
import { RegisterForm } from '@/features/auth';

export const metadata: Metadata = { title: 'Cadastro · gymflow' };

export default function RegisterPage() {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
        <p className="text-sm text-muted">
          O cadastro é para alunos; a equipe recebe acesso da academia.
        </p>
      </header>
      <RegisterForm />
    </section>
  );
}
