import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/features/auth';
import { fetchMyCompletions, fetchMyWorkouts, WorkoutList } from '@/features/workouts';
import { businessToday } from '@/lib/dates';

export const metadata: Metadata = { title: 'Treinos · gymflow' };

export default async function WorkoutsPage() {
  await requireUser(['student']);
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
