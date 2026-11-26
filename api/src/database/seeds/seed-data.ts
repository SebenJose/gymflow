import { UserRole } from '../../common/types/user-role.js';
import { SubscriptionStatus } from '../../modules/subscriptions/subscription-status.js';

/** Senha de todos os usuários de exemplo (documentada no README). */
export const SEED_PASSWORD = 'gymflow123';

export const SEED_USERS = [
  { key: 'admin', name: 'Administração GymFlow', email: 'admin@gymflow.dev', role: UserRole.Admin },
  { key: 'carla', name: 'Carla Mendes', email: 'carla@gymflow.dev', role: UserRole.Instructor },
  { key: 'rafael', name: 'Rafael Souza', email: 'rafael@gymflow.dev', role: UserRole.Instructor },
  { key: 'ana', name: 'Ana Lima', email: 'ana@gymflow.dev', role: UserRole.Student },
  { key: 'bruno', name: 'Bruno Costa', email: 'bruno@gymflow.dev', role: UserRole.Student },
  { key: 'carol', name: 'Carolina Alves', email: 'carol@gymflow.dev', role: UserRole.Student },
  { key: 'diego', name: 'Diego Rocha', email: 'diego@gymflow.dev', role: UserRole.Student },
] as const;

export type SeedUserKey = (typeof SEED_USERS)[number]['key'];

export const SEED_PLANS = [
  {
    key: 'mensal',
    name: 'Mensal',
    description: 'Acesso livre à musculação e às aulas coletivas, sem fidelidade.',
    monthlyPriceCents: 12990,
    durationMonths: 1,
    isActive: true,
  },
  {
    key: 'trimestral',
    name: 'Trimestral',
    description: 'Três meses com mensalidade reduzida.',
    monthlyPriceCents: 11490,
    durationMonths: 3,
    isActive: true,
  },
  {
    key: 'anual',
    name: 'Anual',
    description: 'Doze meses com o melhor preço por mês.',
    monthlyPriceCents: 8990,
    durationMonths: 12,
    isActive: true,
  },
  {
    key: 'promo',
    name: 'Promoção de Verão',
    description: 'Campanha encerrada; mantida para histórico.',
    monthlyPriceCents: 7990,
    durationMonths: 3,
    isActive: false,
  },
] as const;

export type SeedPlanKey = (typeof SEED_PLANS)[number]['key'];

/** `startedDaysAgo` e `paidInvoices` contam a partir de hoje, para os dados não envelhecerem. */
export const SEED_SUBSCRIPTIONS: readonly {
  student: SeedUserKey;
  plan: SeedPlanKey;
  status: SubscriptionStatus;
  startedDaysAgo: number;
  paidInvoices: number;
}[] = [
  {
    student: 'ana',
    plan: 'anual',
    status: SubscriptionStatus.Active,
    startedDaysAgo: 65,
    paidInvoices: 3,
  },
  // A segunda mensalidade já venceu e segue pendente: aparece como atrasada.
  {
    student: 'bruno',
    plan: 'trimestral',
    status: SubscriptionStatus.Active,
    startedDaysAgo: 40,
    paidInvoices: 1,
  },
  {
    student: 'carol',
    plan: 'mensal',
    status: SubscriptionStatus.Suspended,
    startedDaysAgo: 10,
    paidInvoices: 0,
  },
];
