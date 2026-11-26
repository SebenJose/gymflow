import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/dates';
import type { GymClass } from '../schemas/class-schema';
import { SpotsBadge } from './spots-badge';

type ClassItemProps = { gymClass: GymClass; booked: boolean; action: ReactNode };

/** A ação (ex.: inscrição) vem de fora, para a mesma linha servir a aluno e equipe. */
export function ClassItem({ gymClass, booked, action }: ClassItemProps) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="flex min-w-0 flex-1 gap-4">
        <p className="w-24 shrink-0 text-sm text-muted tabular-nums">
          {formatTime(gymClass.startsAt)}–{formatTime(gymClass.endsAt)}
        </p>
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{gymClass.name}</h3>
            <SpotsBadge availableSpots={gymClass.availableSpots} />
            {booked && <Badge tone="success">Inscrito</Badge>}
          </div>
          <p className="text-sm text-muted">
            {gymClass.instructor?.name ?? 'Sem instrutor definido'} · {gymClass.bookedCount}/
            {gymClass.capacity} inscritos
          </p>
          {gymClass.description !== null && (
            <p className="text-sm text-muted">{gymClass.description}</p>
          )}
        </div>
      </div>
      {action}
    </li>
  );
}
