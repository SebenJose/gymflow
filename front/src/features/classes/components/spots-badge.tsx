import { Badge } from '@/components/ui/badge';
import { pluralize } from '@/lib/format';

type SpotsBadgeProps = { availableSpots: number };

const FEW_SPOTS = 3;

export function SpotsBadge({ availableSpots }: SpotsBadgeProps) {
  if (availableSpots === 0) {
    return <Badge tone="danger">Lotada</Badge>;
  }
  const label = pluralize(availableSpots, 'vaga', 'vagas');
  return <Badge tone={availableSpots <= FEW_SPOTS ? 'primary' : 'neutral'}>{label}</Badge>;
}
