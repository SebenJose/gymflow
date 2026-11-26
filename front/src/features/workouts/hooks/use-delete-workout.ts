'use client';

import { useState, useTransition } from 'react';
import { deleteWorkoutAction } from '../services/workout-staff-actions';

type UseDeleteWorkout = {
  confirming: boolean;
  pending: boolean;
  error: string | undefined;
  /** Primeiro clique pede confirmação; o segundo remove. */
  request: () => void;
  cancel: () => void;
};

export function useDeleteWorkout(workoutId: string): UseDeleteWorkout {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const request = (): void => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      const result = await deleteWorkoutAction(workoutId);
      if (!result.ok) {
        setError(result.message);
      }
    });
  };
  return { confirming, pending, error, request, cancel: () => setConfirming(false) };
}
