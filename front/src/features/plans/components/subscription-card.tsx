import { Card } from '@/components/ui/card';
import { formatCurrency, formatIsoDate } from '@/lib/format';
import type { Subscription } from '../schemas/subscription-schema';
import { InvoiceList } from './invoice-list';
import { SubscriptionStatusBadge } from './subscription-status-badge';

type SubscriptionCardProps = { subscription: Subscription | undefined; today: string };

export function SubscriptionCard({ subscription, today }: SubscriptionCardProps) {
  if (subscription === undefined) {
    return (
      <Card>
        <p className="text-sm text-muted">Você ainda não tem matrícula. Escolha um plano abaixo.</p>
      </Card>
    );
  }
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="font-medium">Plano {subscription.plan.name}</h2>
          <p className="text-sm text-muted">
            {formatIsoDate(subscription.startDate)} a {formatIsoDate(subscription.endDate)} ·{' '}
            {formatCurrency(subscription.monthlyPriceCents)}/mês
          </p>
        </div>
        <SubscriptionStatusBadge status={subscription.status} />
      </div>
      <InvoiceList invoices={subscription.invoices} today={today} />
    </Card>
  );
}
