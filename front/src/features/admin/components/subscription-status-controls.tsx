'use client';

import { Button } from '@/components/ui/button';
import { ConfirmButton } from '@/components/ui/confirm-button';
import type { SubscriptionStatus } from '@/features/plans';
import { errorMessageOf } from '@/lib/actions/action-message';
import { useAdminAction } from '../hooks/use-admin-action';
import { changeStatusAction } from '../services/admin-actions';

type SubscriptionStatusControlsProps = { subscriptionId: string; status: SubscriptionStatus };

/** Cancelada é final (a API recusa mudar); as demais podem suspender, reativar ou cancelar. */
export function SubscriptionStatusControls({
  subscriptionId,
  status,
}: SubscriptionStatusControlsProps) {
  const { run, pending, error } = useAdminAction();
  if (status === 'cancelled') {
    return null;
  }
  const next: SubscriptionStatus = status === 'active' ? 'suspended' : 'active';
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-start gap-2">
        <Button
          variant="secondary"
          pending={pending}
          onClick={() => run(() => changeStatusAction({ subscriptionId, status: next }))}
        >
          {next === 'suspended' ? 'Suspender' : 'Reativar'}
        </Button>
        <ConfirmButton
          label="Cancelar matrícula"
          confirmLabel="Confirmar cancelamento"
          warning="O cancelamento é definitivo e cancela as mensalidades pendentes."
          onConfirm={() =>
            errorMessageOf(changeStatusAction({ subscriptionId, status: 'cancelled' }))
          }
        />
      </div>
      {error !== undefined && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
