'use client';

import { useState, useTransition } from 'react';
import { subscribeAction } from '../services/plans-actions';

type UseSubscribe = {
  subscribe: () => void;
  pending: boolean;
  error: string | undefined;
};

export function useSubscribe(planId: string): UseSubscribe {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const subscribe = (): void => {
    startTransition(async () => {
      const result = await subscribeAction(planId);
      setError(result.ok ? undefined : result.message);
    });
  };
  return { subscribe, pending, error };
}
