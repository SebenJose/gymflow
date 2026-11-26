'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { toggleExerciseAction } from '../services/workouts-actions';

type UseExerciseToggle = {
  done: boolean;
  pending: boolean;
  error: string | undefined;
  toggle: () => void;
};

/** O checkbox muda na hora; se a API recusar, volta ao estado do servidor e mostra o erro. */
export function useExerciseToggle(
  workoutId: string,
  exerciseId: string,
  doneOnServer: boolean,
): UseExerciseToggle {
  const [done, setOptimisticDone] = useOptimistic(doneOnServer);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const toggle = (): void => {
    const next = !done;
    startTransition(async () => {
      setOptimisticDone(next);
      const result = await toggleExerciseAction({ workoutId, exerciseId, done: next });
      setError(result.ok ? undefined : result.message);
    });
  };
  return { done, pending, error, toggle };
}
