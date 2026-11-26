'use client';

import { useState, useTransition } from 'react';
import { Button } from './button';

type ConfirmButtonProps = {
  label: string;
  confirmLabel?: string;
  /** Aviso mostrado enquanto se pede a confirmação. */
  warning: string;
  /** Executa a ação; devolve a mensagem de erro, ou `undefined` em caso de sucesso. */
  onConfirm: () => Promise<string | undefined>;
};

/** Ação destrutiva em dois cliques: o primeiro pede confirmação, o segundo executa. */
export function ConfirmButton({
  label,
  confirmLabel = 'Confirmar remoção',
  warning,
  onConfirm,
}: ConfirmButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const handleClick = (): void => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => setError(await onConfirm()));
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={handleClick} pending={pending} className="text-danger">
          {confirming ? confirmLabel : label}
        </Button>
        {confirming && !pending && (
          <Button variant="ghost" onClick={() => setConfirming(false)}>
            Cancelar
          </Button>
        )}
      </div>
      {confirming && <p className="text-sm text-muted">{warning}</p>}
      {error !== undefined && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
