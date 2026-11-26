import { type Invoice, invoiceDisplayStatus, InvoiceStatusBadge } from '@/features/plans';
import { formatCurrency, formatIsoDate } from '@/lib/format';
import { PayInvoiceButton } from './pay-invoice-button';

type AdminInvoiceTableProps = { invoices: readonly Invoice[]; today: string };

export function AdminInvoiceTable({ invoices, today }: AdminInvoiceTableProps) {
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
          <th scope="col" className="py-2 font-normal">
            Situação
          </th>
          <th scope="col" className="py-2 text-right font-normal">
            <span className="sr-only">Ações</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {invoices.map((invoice) => (
          <tr key={invoice.id}>
            <td className="py-2">{formatIsoDate(invoice.dueDate)}</td>
            <td className="py-2">{formatCurrency(invoice.amountCents)}</td>
            <td className="py-2">
              <InvoiceStatusBadge status={invoiceDisplayStatus(invoice, today)} />
            </td>
            <td className="py-2 text-right">
              {invoice.status === 'pending' && <PayInvoiceButton invoiceId={invoice.id} />}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
