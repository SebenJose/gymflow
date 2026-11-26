import { Card } from '@/components/ui/card';
import type { Booking } from '@/features/classes';
import { formatTime, formatWeekday } from '@/lib/dates';
import { AttendanceBadge } from './attendance-badge';

type ClassHistoryProps = { bookings: readonly Booking[] };

export function ClassHistory({ bookings }: ClassHistoryProps) {
  return (
    <Card className="flex flex-col gap-2">
      <h2 className="font-medium">Aulas</h2>
      {bookings.length === 0 ? (
        <p className="text-sm text-muted">Nenhuma aula no período.</p>
      ) : (
        <ul className="divide-y">
          {bookings.map(({ id, attended, class: gymClass }) => (
            <li key={id} className="flex items-center justify-between gap-4 py-3">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium">{gymClass.name}</p>
                <p className="text-sm text-muted capitalize">
                  {formatWeekday(gymClass.startsAt)} · {formatTime(gymClass.startsAt)}
                </p>
              </div>
              <AttendanceBadge attended={attended} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
