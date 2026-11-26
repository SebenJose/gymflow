'use client';

import { cn } from '@/lib/cn';
import { useExerciseToggle } from '../hooks/use-exercise-toggle';
import type { Exercise } from '../schemas/workout-schema';
import { describePrescription } from '../services/prescription';

type ExerciseItemProps = { workoutId: string; exercise: Exercise; doneToday: boolean };

export function ExerciseItem({ workoutId, exercise, doneToday }: ExerciseItemProps) {
  const { done, pending, error, toggle } = useExerciseToggle(workoutId, exercise.id, doneToday);
  const inputId = `exercise-${exercise.id}`;
  return (
    <li className="flex flex-col gap-1 py-3">
      <div className="flex items-start gap-3">
        <input
          id={inputId}
          type="checkbox"
          checked={done}
          disabled={pending}
          onChange={toggle}
          className="mt-1 size-4 accent-primary"
        />
        <label htmlFor={inputId} className="flex flex-1 cursor-pointer flex-col gap-0.5">
          <span className={cn('text-sm font-medium', done && 'text-muted line-through')}>
            {exercise.name}
          </span>
          <span className="text-sm text-muted">{describePrescription(exercise)}</span>
          {exercise.notes !== null && <span className="text-xs text-muted">{exercise.notes}</span>}
        </label>
      </div>
      {error !== undefined && (
        <p role="alert" className="pl-7 text-sm text-danger">
          {error}
        </p>
      )}
    </li>
  );
}
