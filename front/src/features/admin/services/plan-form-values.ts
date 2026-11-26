import type { Plan } from '@/features/plans';
import type { PlanFormInput } from '../schemas/plan-form-schema';

const CENTS_PER_UNIT = 100;

/** Plano da API → valores do formulário (preço em reais, com vírgula). */
export function toPlanFormInput(plan: Plan): PlanFormInput {
  return {
    name: plan.name,
    description: plan.description ?? '',
    monthlyPrice: (plan.monthlyPriceCents / CENTS_PER_UNIT).toFixed(2).replace('.', ','),
    durationMonths: String(plan.durationMonths),
    isActive: plan.isActive,
  };
}
