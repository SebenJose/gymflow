'use client';

import { Button } from '@/components/ui/button';
import { useAdminAction } from '../hooks/use-admin-action';
import { payInvoiceAction } from '../services/admin-actions';

type PayInvoiceButtonProps = { invoiceId: string };

export function PayInvoiceButton({ invoiceId }: PayInvoiceButtonProps) {
  const { run, pending, error } = useAdminAction();
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button
        variant="secondary"
        pending={pending}
        onClick={() => run(() => payInvoiceAction(invoiceId))}
        className="h-8 px-3"
      >
        Registrar pagamento
      </Button>
      {error !== undefined && (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      )}
    </span>
  );
}
