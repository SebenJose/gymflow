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
const BOOKING_NOT_IN_CLASS = 'Inscrição não encontrada nesta aula';
const CLASS_NOT_STARTED = 'A presença só pode ser registrada depois do início da aula';

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

  /** Registra presença ou falta; só faz sentido depois que a aula começou. */
  async markAttendance(
    classId: string,
    bookingId: string,
    attended: boolean,
  ): Promise<ClassBooking> {
    const gymClass = await this.classesService.findOne(classId);
    if (gymClass.startsAt > this.clock.now()) {
      throw new ConflictException(CLASS_NOT_STARTED);
    }
    const booking = await this.bookingsRepository.setAttendance(classId, bookingId, attended);
    if (booking === null) {
      throw new NotFoundException(BOOKING_NOT_IN_CLASS);
    }
    return booking;
  }

  /** Histórico de frequência: só aulas que já começaram contam. */
  findAttendanceOf(studentId: string, period: DatePeriod): Promise<ClassBooking[]> {
    assertValidPeriod(period);
    return this.bookingsRepository.findStartedByStudent(studentId, period, this.clock.now());
  }

  private assertNotStarted(gymClass: GymClass): void {
    if (gymClass.startsAt <= this.clock.now()) {
      throw new ConflictException(CLASS_ALREADY_STARTED);
    }
  }
}
