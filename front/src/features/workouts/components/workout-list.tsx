import type { Completion } from '../schemas/completion-schema';
import type { Workout } from '../schemas/workout-schema';
import { WorkoutCard } from './workout-card';

type WorkoutListProps = { workouts: readonly Workout[]; completionsToday: readonly Completion[] };

export function WorkoutList({ workouts, completionsToday }: WorkoutListProps) {
  if (workouts.length === 0) {
    return (
      <p className="text-sm text-muted">
        Você ainda não tem fichas de treino. Fale com um instrutor para montar a sua.
      </p>
    );
  }
  const completedToday = new Set(
    completionsToday.flatMap(({ exerciseId }) => (exerciseId === null ? [] : [exerciseId])),
  );
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {workouts.map((workout) => (
        <WorkoutCard key={workout.id} workout={workout} completedToday={completedToday} />
      ))}
    </div>
  );
}
