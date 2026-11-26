import { Badge } from '@/components/ui/badge';

type AttendanceBadgeProps = { attended: boolean | null };

export function AttendanceBadge({ attended }: AttendanceBadgeProps) {
  if (attended === null) {
    return <Badge>Sem registro</Badge>;
  }
  return attended ? <Badge tone="success">Presente</Badge> : <Badge tone="danger">Falta</Badge>;
}
