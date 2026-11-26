import { Card } from '@/components/ui/card';
import { SubscriptionStatusBadge } from '@/features/plans';
import { formatIsoDate } from '@/lib/format';
import type { AdminSubscription } from '../schemas/admin-subscription-schema';
import { AdminInvoiceTable } from './admin-invoice-table';
import { SubscriptionStatusControls } from './subscription-status-controls';

type AdminSubscriptionCardProps = { subscription: AdminSubscription; today: string };

export function AdminSubscriptionCard({ subscription, today }: AdminSubscriptionCardProps) {
  const { student, plan } = subscription;
  return (
    <Card className="flex flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-medium">{student.name}</h2>
          <p className="text-sm text-muted">
            {student.email} · Plano {plan.name} · {formatIsoDate(subscription.startDate)} a{' '}
            {formatIsoDate(subscription.endDate)}
          </p>
        </div>
        <SubscriptionStatusBadge status={subscription.status} />
      </header>
      <SubscriptionStatusControls subscriptionId={subscription.id} status={subscription.status} />
      <details>
        <summary className="cursor-pointer text-sm text-muted">
          Mensalidades ({subscription.invoices.length})
        </summary>
        <AdminInvoiceTable invoices={subscription.invoices} today={today} />
      </details>
    </Card>
  );
}
