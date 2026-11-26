import { Badge, type BadgeTone } from '@/components/ui/badge';
import type { SubscriptionStatus } from '../schemas/subscription-schema';

const LABELS: Record<SubscriptionStatus, { label: string; tone: BadgeTone }> = {
  active: { label: 'Ativa', tone: 'success' },
  suspended: { label: 'Suspensa', tone: 'danger' },
  cancelled: { label: 'Cancelada', tone: 'neutral' },
};

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const { label, tone } = LABELS[status];
  return <Badge tone={tone}>{label}</Badge>;
}
