import type { ClassBooking } from '../entities/class-booking.entity.js';

/** Inscrito em uma aula, visto pela equipe. Espera `student` carregado. */
export class RosterEntryResponseDto {
  readonly id: string;
  readonly bookedAt: Date;
  readonly student: { id: string; name: string; email: string };

  constructor(booking: ClassBooking) {
    this.id = booking.id;
    this.bookedAt = booking.createdAt;
    this.student = {
      id: booking.student.id,
      name: booking.student.name,
      email: booking.student.email,
    };
  }
}
