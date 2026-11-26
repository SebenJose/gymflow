import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Plan } from '@/features/plans';
import { formatCurrency, pluralize } from '@/lib/format';
import { ROUTES } from '@/lib/routes';

type AdminPlanListProps = { plans: readonly Plan[] };

export function AdminPlanList({ plans }: AdminPlanListProps) {
  if (plans.length === 0) {
    return <p className="text-sm text-muted">Nenhum plano cadastrado.</p>;
  }
  return (
    <Card className="p-0">
      <ul className="divide-y">
        {plans.map((plan) => (
          <li key={plan.id}>
            <Link
              href={`${ROUTES.plans}/${plan.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-background"
            >
              <span className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2 font-medium">
                  {plan.name}
                  {plan.isActive ? <Badge tone="success">Ativo</Badge> : <Badge>Inativo</Badge>}
                </span>
                <span className="text-sm text-muted">
                  {formatCurrency(plan.monthlyPriceCents)}/mês ·{' '}
                  {pluralize(plan.durationMonths, 'mês', 'meses')}
                </span>
              </span>
              <ChevronRight className="size-4 text-muted" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
