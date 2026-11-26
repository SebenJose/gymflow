'use client';

import { useState, useTransition } from 'react';
import type { ActionResult } from '@/lib/actions/action-result';

type UseAdminAction = {
  run: (action: () => Promise<ActionResult>) => void;
  pending: boolean;
  error: string | undefined;
};

/** Executa uma action de linha (pagar, mudar situação) guardando carregamento e erro. */
export function useAdminAction(): UseAdminAction {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  const run = (action: () => Promise<ActionResult>): void => {
    startTransition(async () => {
      const result = await action();
      setError(result.ok ? undefined : result.message);
    });
  };
  return { run, pending, error };
}
