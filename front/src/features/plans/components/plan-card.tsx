import { Card } from '@/components/ui/card';
import { formatCurrency, pluralize } from '@/lib/format';
import type { Plan } from '../schemas/plan-schema';
import { SubscribeButton } from './subscribe-button';

type PlanCardProps = { plan: Plan; canSubscribe: boolean };

export function PlanCard({ plan, canSubscribe }: PlanCardProps) {
  const total = plan.monthlyPriceCents * plan.durationMonths;
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-medium">{plan.name}</h3>
        <p>
          <span className="text-2xl font-semibold">{formatCurrency(plan.monthlyPriceCents)}</span>
          <span className="text-sm text-muted"> /mês</span>
        </p>
        <p className="text-sm text-muted">
          {pluralize(plan.durationMonths, 'mês', 'meses')} · total {formatCurrency(total)}
        </p>
      </div>
      {plan.description !== null && <p className="flex-1 text-sm text-muted">{plan.description}</p>}
      <SubscribeButton planId={plan.id} disabled={!canSubscribe} />
    </Card>
  );
}
