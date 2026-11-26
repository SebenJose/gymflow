import type { Plan } from '../schemas/plan-schema';
import { PlanCard } from './plan-card';

type PlanGridProps = { plans: readonly Plan[]; canSubscribe: boolean };

export function PlanGrid({ plans, canSubscribe }: PlanGridProps) {
  if (plans.length === 0) {
    return <p className="text-sm text-muted">Nenhum plano disponível no momento.</p>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} canSubscribe={canSubscribe} />
      ))}
    </div>
  );
}
