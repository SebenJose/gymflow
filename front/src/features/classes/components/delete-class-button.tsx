'use client';

import { ConfirmButton } from '@/components/ui/confirm-button';
import { errorMessageOf } from '@/lib/actions/action-message';
import { deleteClassAction } from '../services/classes-staff-actions';

type DeleteClassButtonProps = { classId: string };

export function DeleteClassButton({ classId }: DeleteClassButtonProps) {
  return (
    <ConfirmButton
      label="Remover aula"
      warning="As inscrições desta aula também serão removidas."
      onConfirm={() => errorMessageOf(deleteClassAction(classId))}
    />
  );
}
