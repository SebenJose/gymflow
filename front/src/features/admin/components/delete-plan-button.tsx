'use client';

import { ConfirmButton } from '@/components/ui/confirm-button';
import { errorMessageOf } from '@/lib/actions/action-message';
import { deletePlanAction } from '../services/admin-actions';

type DeletePlanButtonProps = { planId: string };

export function DeletePlanButton({ planId }: DeletePlanButtonProps) {
  return (
    <ConfirmButton
      label="Remover plano"
      warning="Planos com matrículas não podem ser removidos; nesse caso, desative-o."
      onConfirm={() => errorMessageOf(deletePlanAction(planId))}
    />
  );
}
