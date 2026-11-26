'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { markAttendanceAction } from '../services/classes-staff-actions';

type UseAttendance = {
  attended: boolean | null;
  pending: boolean;
  error: string | undefined;
  mark: (attended: boolean) => void;
};

/** Presença muda na hora; se a API recusar, volta ao estado do servidor e mostra o erro. */
export function useAttendance(
  classId: string,
  bookingId: string,
  onServer: boolean | null,
): UseAttendance {
  const [attended, setOptimistic] = useOptimistic(onServer);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const mark = (value: boolean): void => {
    startTransition(async () => {
      setOptimistic(value);
      const result = await markAttendanceAction({ classId, bookingId, attended: value });
      setError(result.ok ? undefined : result.message);
    });
  };
  return { attended, pending, error, mark };
}
