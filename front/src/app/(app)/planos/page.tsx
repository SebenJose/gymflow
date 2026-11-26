import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { LinkButton } from '@/components/ui/link-button';
import { PageHeader } from '@/components/ui/page-header';
import { AdminPlanList, fetchAllPlans } from '@/features/admin';
import { requireUser } from '@/features/auth';
import {
  fetchMySubscriptions,
  fetchPlans,
  isOpenSubscription,
  PlanGrid,
  SubscriptionCard,
} from '@/features/plans';
import { businessToday } from '@/lib/dates';
import { ROUTES } from '@/lib/routes';

export const metadata: Metadata = { title: 'Planos · gymflow' };

/** Aluno contrata e acompanha a matrícula; admin gerencia os planos. */
export default async function PlansPage() {
  const user = await requireUser(['student', 'admin']);
  if (user.role === 'admin') {
    const plans = await fetchAllPlans();
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PageHeader title="Planos" description="Planos de assinatura, ativos e desativados." />
          <LinkButton href={`${ROUTES.plans}/novo`}>
            <Plus className="size-4" aria-hidden />
            Novo plano
          </LinkButton>
        </div>
        <AdminPlanList plans={plans} />
      </div>
    );
  }

  const [plans, subscriptions] = await Promise.all([fetchPlans(), fetchMySubscriptions()]);
  const current = subscriptions.find(isOpenSubscription);
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Planos"
        description="Sua matrícula, mensalidades e os planos disponíveis."
      />
      <SubscriptionCard subscription={current} today={businessToday()} />
      <section className="flex flex-col gap-4">
        <h2 className="font-medium">Planos disponíveis</h2>
        <PlanGrid plans={plans} canSubscribe={current === undefined} />
      </section>
    </div>
  );
}
