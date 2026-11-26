import { z } from 'zod';

// Mesmos limites do `CreatePlanDto` da API (`plan-constraints.ts`).
const NAME_MAX = 80;
const DESCRIPTION_MAX = 500;
const MAX_DURATION_MONTHS = 24;
const CENTS_PER_UNIT = 100;
/** Ex.: "129,90", "129.9" ou "129". */
const MONEY_PATTERN = /^\d+([.,]\d{1,2})?$/;

export const planFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Informe o nome do plano')
    .max(NAME_MAX, `Máximo de ${NAME_MAX} caracteres`),
  description: z
    .string()
    .trim()
    .max(DESCRIPTION_MAX, `Máximo de ${DESCRIPTION_MAX} caracteres`)
    .transform((value) => (value === '' ? null : value)),
  /** Digitado em reais; a API guarda em centavos. */
  monthlyPrice: z
    .string()
    .trim()
    .regex(MONEY_PATTERN, 'Informe um valor como 129,90')
    .transform((value) => Math.round(Number(value.replace(',', '.')) * CENTS_PER_UNIT)),
  durationMonths: z
    .string()
    .trim()
    .min(1, 'Obrigatório')
    .pipe(
      z.coerce
        .number<string>()
        .int('Use um número inteiro')
        .min(1, 'Mínimo 1')
        .max(MAX_DURATION_MONTHS, `Máximo ${MAX_DURATION_MONTHS}`),
    ),
  isActive: z.boolean(),
});

export type PlanFormInput = z.input<typeof planFormSchema>;
export type PlanFormValues = z.output<typeof planFormSchema>;

export const EMPTY_PLAN_FORM: PlanFormInput = {
  name: '',
  description: '',
  monthlyPrice: '',
  durationMonths: '1',
  isActive: true,
};
