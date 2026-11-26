import type { ClassBooking } from '../classes/entities/class-booking.entity.js';

export type AttendanceSummary = {
  totalClasses: number;
  attended: number;
  missed: number;
  notRecorded: number;
  /** Presenças sobre as aulas com registro, em %; `null` se nenhuma foi registrada. */
  attendancePercent: number | null;
};

const PERCENT = 100;

/** Aulas sem registro de presença ficam fora do percentual, para não contarem como falta. */
export function summarizeAttendance(bookings: ClassBooking[]): AttendanceSummary {
  const attended = bookings.filter((booking) => booking.attended === true).length;
  const missed = bookings.filter((booking) => booking.attended === false).length;
  const recorded = attended + missed;
  return {
    totalClasses: bookings.length,
    attended,
    missed,
    notRecorded: bookings.length - recorded,
    attendancePercent: recorded === 0 ? null : Math.round((attended * PERCENT) / recorded),
  };
}
