import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/features/auth';
import {
  DeleteWorkoutButton,
  fetchWorkout,
  toWorkoutFormInput,
  WorkoutForm,
} from '@/features/workouts';
import { orNotFound } from '@/lib/api/or-not-found';

export const metadata: Metadata = { title: 'Editar ficha · gymflow' };

export default async function EditWorkoutPage({ params }: PageProps<'/treinos/[id]'>) {
  await requireUser(['instructor', 'admin']);
  const { id } = await params;
  const workout = await orNotFound(fetchWorkout(id));
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title={workout.name} description="Edite a ficha e os exercícios." />
      <WorkoutForm
        mode={{ kind: 'edit', workoutId: workout.id, studentName: workout.student.name }}
        students={[]}
        defaultValues={toWorkoutFormInput(workout)}
      />
      <DeleteWorkoutButton workoutId={workout.id} />
    </div>
  );
}
