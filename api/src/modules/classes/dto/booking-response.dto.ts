import type { ClassBooking } from '../entities/class-booking.entity.js';
import { ClassResponseDto } from './class-response.dto.js';

/** Inscrição vista pelo aluno. Espera `gymClass` e `gymClass.instructor` carregados. */
export class BookingResponseDto {
  readonly id: string;
  readonly bookedAt: Date;
  readonly class: ClassResponseDto;

  constructor(booking: ClassBooking) {
    this.id = booking.id;
    this.bookedAt = booking.createdAt;
    this.class = new ClassResponseDto(booking.gymClass);
  }
}
