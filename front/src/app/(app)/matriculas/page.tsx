import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import {
  AdminSubscriptionCard,
  fetchSubscriptions,
  SubscriptionStatusFilter,
} from '@/features/admin';
import { requireUser } from '@/features/auth';
import { subscriptionStatusSchema } from '@/features/plans';
import { businessToday } from '@/lib/dates';

export const metadata: Metadata = { title: 'Matrículas · gymflow' };

export default async function SubscriptionsPage({ searchParams }: PageProps<'/matriculas'>) {
  await requireUser(['admin']);
  const { situacao } = await searchParams;
  const parsed = subscriptionStatusSchema.safeParse(situacao);
  const status = parsed.success ? parsed.data : undefined;
  const subscriptions = await fetchSubscriptions(status);
  const today = businessToday();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Matrículas"
        description="Situação das matrículas e pagamento das mensalidades."
      />
      <SubscriptionStatusFilter selected={status} />
      {subscriptions.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma matrícula encontrada.</p>
      ) : (
        subscriptions.map((subscription) => (
          <AdminSubscriptionCard key={subscription.id} subscription={subscription} today={today} />
        ))
      )}
    </div>
  );
}
