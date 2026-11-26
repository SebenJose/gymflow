import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth';

export const metadata: Metadata = { title: 'Entrar · gymflow' };

export default function LoginPage() {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
        <p className="text-sm text-muted">Acesse sua conta para ver treinos, aulas e planos.</p>
      </header>
      <LoginForm />
    </section>
  );
}
