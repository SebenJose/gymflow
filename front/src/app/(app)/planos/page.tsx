import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { requireUser } from '@/features/auth';
import {
  fetchMySubscriptions,
  fetchPlans,
  isOpenSubscription,
  PlanGrid,
  SubscriptionCard,
} from '@/features/plans';
import { businessToday } from '@/lib/dates';

export const metadata: Metadata = { title: 'Planos · gymflow' };

export default async function PlansPage() {
  await requireUser(['student']);
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
