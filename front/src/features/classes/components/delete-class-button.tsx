'use client';

import { Button } from '@/components/ui/button';
import { useDeleteClass } from '../hooks/use-delete-class';

type DeleteClassButtonProps = { classId: string };

export function DeleteClassButton({ classId }: DeleteClassButtonProps) {
  const { confirming, pending, error, request, cancel } = useDeleteClass(classId);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={request} pending={pending} className="text-danger">
          {confirming ? 'Confirmar remoção' : 'Remover aula'}
        </Button>
        {confirming && !pending && (
          <Button variant="ghost" onClick={cancel}>
            Cancelar
          </Button>
        )}
      </div>
      {confirming && (
        <p className="text-sm text-muted">As inscrições desta aula também serão removidas.</p>
      )}
      {error !== undefined && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
