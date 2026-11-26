import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { LinkButton } from '@/components/ui/link-button';
import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/features/auth';
import {
  fetchMyCompletions,
  fetchMyWorkouts,
  fetchStudents,
  fetchWorkouts,
  StaffWorkoutList,
  StudentFilter,
  WorkoutList,
} from '@/features/workouts';
import { businessToday } from '@/lib/dates';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = { title: 'Treinos · gymflow' };

/** Aluno vê e marca as próprias fichas; a equipe lista e gerencia as fichas dos alunos. */
export default async function WorkoutsPage({ searchParams }: PageProps<'/treinos'>) {
  const user = await requireUser();
  if (user.role === 'student') {
    const today = businessToday();
    const [workouts, completionsToday] = await Promise.all([
      fetchMyWorkouts(),
      fetchMyCompletions({ from: today, to: today }),
    ]);
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Treinos"
          description="Suas fichas de treino. Marque os exercícios conforme for concluindo."
        />
        <WorkoutList workouts={workouts} completionsToday={completionsToday} />
      </div>
    );
  }

  const { aluno } = await searchParams;
  const studentId = typeof aluno === 'string' && aluno !== '' ? aluno : undefined;
  const [workouts, students] = await Promise.all([fetchWorkouts(studentId), fetchStudents()]);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="Fichas de treino" description="Fichas montadas para os alunos." />
        <LinkButton href={`${ROUTES.workouts}/nova`}>
          <Plus className="size-4" aria-hidden />
          Nova ficha
        </LinkButton>
      </div>
      <StudentFilter students={students} selected={studentId} />
      <StaffWorkoutList workouts={workouts} />
    </div>
  );
}
