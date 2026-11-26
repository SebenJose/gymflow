'use client';

import { Button } from '@/components/ui/button';
import { useBooking } from '../hooks/use-booking';
import type { BookingState } from '../services/booking-state';

type BookingButtonProps = { classId: string; state: BookingState; className: string };

const LABELS: Record<BookingState, string> = {
  available: 'Inscrever-se',
  booked: 'Cancelar inscrição',
  full: 'Lotada',
  started: 'Encerrada',
};

export function BookingButton({ classId, state, className }: BookingButtonProps) {
  const { change, pending, error } = useBooking(classId, state === 'booked');
  const actionable = state === 'available' || state === 'booked';
  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant={state === 'available' ? 'primary' : 'secondary'}
        onClick={change}
        pending={pending}
        disabled={!actionable}
        aria-label={`${LABELS[state]}: ${className}`}
      >
        {LABELS[state]}
      </Button>
      {error !== undefined && (
        <p role="alert" className="text-right text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
