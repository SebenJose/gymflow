import { formatCurrency, formatIsoDate } from '@/lib/format';
import type { Invoice } from '../schemas/subscription-schema';
import { invoiceDisplayStatus } from '../services/invoice-status';
import { InvoiceStatusBadge } from './invoice-status-badge';

type InvoiceListProps = { invoices: readonly Invoice[]; today: string };

export function InvoiceList({ invoices, today }: InvoiceListProps) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Mensalidades</caption>
      <thead className="text-left text-muted">
        <tr>
          <th scope="col" className="py-2 font-normal">
            Vencimento
          </th>
          <th scope="col" className="py-2 font-normal">
            Valor
          </th>
          <th scope="col" className="py-2 text-right font-normal">
            Situação
          </th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {invoices.map((invoice) => (
          <tr key={invoice.id}>
            <td className="py-2">{formatIsoDate(invoice.dueDate)}</td>
            <td className="py-2">{formatCurrency(invoice.amountCents)}</td>
            <td className="py-2 text-right">
              <InvoiceStatusBadge status={invoiceDisplayStatus(invoice, today)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
