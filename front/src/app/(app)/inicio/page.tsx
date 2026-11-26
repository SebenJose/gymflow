import type { Metadata } from 'next';
import { FadeIn } from '@/components/ui/fade-in';
import { requireUser, type UserRole } from '@/features/auth';

export const metadata: Metadata = { title: 'Início · gymflow' };

const INTRO: Record<UserRole, string> = {
  student: 'Acompanhe suas fichas de treino, agende aulas e veja sua frequência.',
  instructor: 'Monte as fichas dos alunos e conduza as aulas coletivas.',
  admin: 'Gerencie planos, matrículas, mensalidades e aulas da academia.',
};

export default async function HomePage() {
  const user = await requireUser();
  const firstName = user.name.split(' ')[0] ?? user.name;
  return (
    <FadeIn className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Olá, {firstName}</h1>
      <p className="text-muted">{INTRO[user.role]}</p>
    </FadeIn>
  );
}
