import type { ClassBooking } from '../classes/entities/class-booking.entity.js';
import { summarizeAttendance } from './attendance-summary.js';

describe('summarizeAttendance', () => {
  const withAttended = (attended: boolean | null): ClassBooking => ({ attended }) as ClassBooking;

  it('conta presenças, faltas e aulas sem registro', () => {
    const bookings = [true, true, false, null].map(withAttended);

    expect(summarizeAttendance(bookings)).toEqual({
      totalClasses: 4,
      attended: 2,
      missed: 1,
      notRecorded: 1,
      attendancePercent: 67,
    });
  });

  it('percentual nulo quando nenhuma presença foi registrada', () => {
    expect(summarizeAttendance([withAttended(null)]).attendancePercent).toBeNull();
    expect(summarizeAttendance([]).attendancePercent).toBeNull();
  });
});
