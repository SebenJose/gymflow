'use client';

import { useState, useTransition } from 'react';
import { changeBookingAction } from '../services/classes-actions';

type UseBooking = {
  change: () => void;
  pending: boolean;
  error: string | undefined;
};

/** Sem otimismo: a vaga só é confirmada pela API (a aula pode lotar no meio do caminho). */
export function useBooking(classId: string, booked: boolean): UseBooking {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const change = (): void => {
    startTransition(async () => {
      const result = await changeBookingAction({ classId, book: !booked });
      setError(result.ok ? undefined : result.message);
    });
  };
  return { change, pending, error };
}
