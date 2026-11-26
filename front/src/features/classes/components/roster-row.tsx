'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { useAttendance } from '../hooks/use-attendance';
import type { RosterEntry } from '../schemas/class-form-schema';

type RosterRowProps = { classId: string; entry: RosterEntry; canMark: boolean };

export function RosterRow({ classId, entry, canMark }: RosterRowProps) {
  const { attended, pending, error, mark } = useAttendance(classId, entry.id, entry.attended);
  const option = (value: boolean, label: string, activeClass: string) => (
    <Button
      variant="secondary"
      aria-pressed={attended === value}
      disabled={!canMark || pending}
      onClick={() => mark(value)}
      className={cn('h-8 px-3', attended === value && activeClass)}
    >
      {label}
    </Button>
  );
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{entry.student.name}</span>
        <span className="text-xs text-muted">{entry.student.email}</span>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="flex gap-2" role="group" aria-label={`Presença de ${entry.student.name}`}>
          {option(true, 'Presente', 'border-success text-success')}
          {option(false, 'Falta', 'border-danger text-danger')}
        </div>
        {error !== undefined && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </li>
  );
}
