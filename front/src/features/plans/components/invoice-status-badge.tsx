import { Badge, type BadgeTone } from '@/components/ui/badge';
import type { InvoiceDisplayStatus } from '../services/invoice-status';

const LABELS: Record<InvoiceDisplayStatus, { label: string; tone: BadgeTone }> = {
  paid: { label: 'Paga', tone: 'success' },
  pending: { label: 'A vencer', tone: 'neutral' },
  overdue: { label: 'Atrasada', tone: 'danger' },
  cancelled: { label: 'Cancelada', tone: 'neutral' },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceDisplayStatus }) {
  const { label, tone } = LABELS[status];
  return <Badge tone={tone}>{label}</Badge>;
}
