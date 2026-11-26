import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/features/auth';
import { EMPTY_EXERCISE, fetchStudents, WorkoutForm } from '@/features/workouts';

export const metadata: Metadata = { title: 'Nova ficha · gymflow' };

export default async function NewWorkoutPage() {
  await requireUser(['instructor', 'admin']);
  const students = await fetchStudents();
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title="Nova ficha" description="Monte a ficha de treino de um aluno." />
      <WorkoutForm
        mode={{ kind: 'create' }}
        students={students}
        defaultValues={{ studentId: '', name: '', notes: '', exercises: [EMPTY_EXERCISE] }}
      />
    </div>
  );
}
