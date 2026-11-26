import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Clock } from '../../common/clock/clock.js';
import { isUniqueViolation } from '../../common/database/postgres-errors.js';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { assertValidPeriod, type DatePeriod } from '../../common/validation/period.js';
import { BookingsRepository } from './bookings.repository.js';
import { ClassesService } from './classes.service.js';
import type { ClassBooking } from './entities/class-booking.entity.js';
import type { GymClass } from './entities/gym-class.entity.js';

const BOOKING_NOT_FOUND = 'Você não está inscrito nesta aula';
const ALREADY_BOOKED = 'Você já está inscrito nesta aula';
const CLASS_FULL = 'Não há vagas disponíveis nesta aula';
const CLASS_ALREADY_STARTED = 'A aula já começou';

@Injectable()
export class BookingsService {
  constructor(
    private readonly bookingsRepository: BookingsRepository,
    private readonly classesService: ClassesService,
    private readonly clock: Clock,
  ) {}

  /** Inscreve o aluno, se a aula ainda não começou e houver vaga. */
  async book(student: AuthUser, classId: string): Promise<ClassBooking> {
    this.assertNotStarted(await this.classesService.findOne(classId));

    let bookingId: string | null;
    try {
      bookingId = await this.bookingsRepository.book(classId, student.id);
    } catch (error) {
      throw isUniqueViolation(error) ? new ConflictException(ALREADY_BOOKED) : error;
    }
    if (bookingId === null) {
      throw new ConflictException(CLASS_FULL);
    }
    const booking = await this.bookingsRepository.findById(bookingId);
    if (booking === null) {
      // A aula foi removida logo depois da inscrição.
      throw new NotFoundException(BOOKING_NOT_FOUND);
    }
    return booking;
  }

  /** Cancela a inscrição e libera a vaga, enquanto a aula não começou. */
  async cancel(student: AuthUser, classId: string): Promise<void> {
    this.assertNotStarted(await this.classesService.findOne(classId));
    if (!(await this.bookingsRepository.cancel(classId, student.id))) {
      throw new NotFoundException(BOOKING_NOT_FOUND);
    }
  }

  findMine(student: AuthUser, period: DatePeriod): Promise<ClassBooking[]> {
    assertValidPeriod(period);
    return this.bookingsRepository.findByStudent(student.id, period);
  }

  async findRoster(classId: string): Promise<ClassBooking[]> {
    await this.classesService.findOne(classId);
    return this.bookingsRepository.findByClass(classId);
  }

  private assertNotStarted(gymClass: GymClass): void {
    if (gymClass.startsAt <= this.clock.now()) {
      throw new ConflictException(CLASS_ALREADY_STARTED);
    }
  }
}
