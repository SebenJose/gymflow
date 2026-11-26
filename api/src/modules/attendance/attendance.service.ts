import { BadRequestException, Injectable } from '@nestjs/common';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import type { DatePeriod } from '../../common/validation/period.js';
import { BookingsService } from '../classes/bookings.service.js';
import type { ClassBooking } from '../classes/entities/class-booking.entity.js';
import { UsersService } from '../users/users.service.js';
import { type AttendanceSummary, summarizeAttendance } from './attendance-summary.js';

const NOT_A_STUDENT = 'Frequência só existe para alunos';

export type AttendanceHistory = { summary: AttendanceSummary; bookings: ClassBooking[] };

@Injectable()
export class AttendanceService {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly usersService: UsersService,
  ) {}

  findMine(student: AuthUser, period: DatePeriod): Promise<AttendanceHistory> {
    return this.historyOf(student.id, period);
  }

  /** Para a equipe: aluno inexistente responde 404; usuário que não é aluno, 400. */
  async findOfStudent(studentId: string, period: DatePeriod): Promise<AttendanceHistory> {
    const user = await this.usersService.findById(studentId);
    if (user.role !== UserRole.Student) {
      throw new BadRequestException(NOT_A_STUDENT);
    }
    return this.historyOf(user.id, period);
  }

  private async historyOf(studentId: string, period: DatePeriod): Promise<AttendanceHistory> {
    const bookings = await this.bookingsService.findAttendanceOf(studentId, period);
    return { summary: summarizeAttendance(bookings), bookings };
  }
}
