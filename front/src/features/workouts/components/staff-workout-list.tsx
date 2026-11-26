import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { pluralize } from '@/lib/format';
import { ROUTES } from '@/lib/routes';
import type { Workout } from '../schemas/workout-schema';

type StaffWorkoutListProps = { workouts: readonly Workout[] };

export function StaffWorkoutList({ workouts }: StaffWorkoutListProps) {
  if (workouts.length === 0) {
    return <p className="text-sm text-muted">Nenhuma ficha encontrada.</p>;
  }
  return (
    <Card className="p-0">
      <ul className="divide-y">
        {workouts.map((workout) => (
          <li key={workout.id}>
            <Link
              href={`${ROUTES.workouts}/${workout.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-background"
            >
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">{workout.name}</span>
                <span className="text-sm text-muted">
                  {workout.student.name} ·{' '}
                  {pluralize(workout.exercises.length, 'exercício', 'exercícios')}
                  {workout.instructor !== null && ` · por ${workout.instructor.name}`}
                </span>
              </span>
              <ChevronRight className="size-4 text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
