import { Card } from '@/components/ui/card';
import type { Workout } from '../schemas/workout-schema';
import { ExerciseItem } from './exercise-item';

type WorkoutCardProps = { workout: Workout; completedToday: ReadonlySet<string> };

export function WorkoutCard({ workout, completedToday }: WorkoutCardProps) {
  const doneCount = workout.exercises.filter(({ id }) => completedToday.has(id)).length;
  return (
    <Card className="flex flex-col gap-3">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="font-medium">{workout.name}</h2>
          {workout.instructor !== null && (
            <p className="text-sm text-muted">Montada por {workout.instructor.name}</p>
          )}
        </div>
        <p className="text-sm text-muted">
          {doneCount}/{workout.exercises.length} hoje
        </p>
      </header>
      {workout.notes !== null && <p className="text-sm text-muted">{workout.notes}</p>}
      <ul className="divide-y">
        {workout.exercises.map((exercise) => (
          <ExerciseItem
            key={exercise.id}
            workoutId={workout.id}
            exercise={exercise}
            doneToday={completedToday.has(exercise.id)}
          />
        ))}
      </ul>
    </Card>
  );
}
