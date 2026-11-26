'use client';

import { useState, useTransition } from 'react';
import { deleteClassAction } from '../services/classes-staff-actions';

type UseDeleteClass = {
  confirming: boolean;
  pending: boolean;
  error: string | undefined;
  /** Primeiro clique pede confirmação; o segundo remove. */
  request: () => void;
  cancel: () => void;
};

export function useDeleteClass(classId: string): UseDeleteClass {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const request = (): void => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      const result = await deleteClassAction(classId);
      if (!result.ok) {
        setError(result.message);
      }
    });
  };
  return { confirming, pending, error, request, cancel: () => setConfirming(false) };
}
