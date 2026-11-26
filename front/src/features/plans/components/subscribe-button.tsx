'use client';

import { Button } from '@/components/ui/button';
import { useSubscribe } from '../hooks/use-subscribe';

type SubscribeButtonProps = { planId: string; disabled: boolean };

export function SubscribeButton({ planId, disabled }: SubscribeButtonProps) {
  const { subscribe, pending, error } = useSubscribe(planId);
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={subscribe} pending={pending} disabled={disabled}>
        Contratar
      </Button>
      {error !== undefined && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
