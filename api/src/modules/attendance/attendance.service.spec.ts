import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import type { BookingsService } from '../classes/bookings.service.js';
import type { ClassBooking } from '../classes/entities/class-booking.entity.js';
import type { User } from '../users/entities/user.entity.js';
import type { UsersService } from '../users/users.service.js';
import { AttendanceService } from './attendance.service.js';

describe('AttendanceService', () => {
  const student: AuthUser = { id: 's1', role: UserRole.Student };
  const bookings = [{ attended: true }, { attended: false }] as ClassBooking[];

  const bookingsService = { findAttendanceOf: vi.fn<BookingsService['findAttendanceOf']>() };
  const usersService = { findById: vi.fn<UsersService['findById']>() };
  // Os mocks cobrem só os métodos que o service chama.
  const service = new AttendanceService(
    bookingsService as unknown as BookingsService,
    usersService as unknown as UsersService,
  );

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('findMine devolve as aulas do próprio aluno com o resumo', async () => {
    bookingsService.findAttendanceOf.mockResolvedValue(bookings);

    const history = await service.findMine(student, { from: '2026-03-01' });

    expect(bookingsService.findAttendanceOf).toHaveBeenCalledWith('s1', { from: '2026-03-01' });
    expect(history.bookings).toBe(bookings);
    expect(history.summary).toMatchObject({ attended: 1, missed: 1, attendancePercent: 50 });
  });

  it('findOfStudent lança 400 para usuário que não é aluno', async () => {
    usersService.findById.mockResolvedValue({ id: 'i1', role: UserRole.Instructor } as User);

    await expect(service.findOfStudent('i1', {})).rejects.toBeInstanceOf(BadRequestException);
    expect(bookingsService.findAttendanceOf).not.toHaveBeenCalled();
  });

  it('findOfStudent propaga o 404 de usuário inexistente', async () => {
    usersService.findById.mockRejectedValue(new NotFoundException());

    await expect(service.findOfStudent('x', {})).rejects.toBeInstanceOf(NotFoundException);
  });
});
