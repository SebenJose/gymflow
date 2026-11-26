import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { Clock } from '../../common/clock/clock.js';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import type { BookingsRepository } from './bookings.repository.js';
import { BookingsService } from './bookings.service.js';
import type { ClassesService } from './classes.service.js';
import type { ClassBooking } from './entities/class-booking.entity.js';
import type { GymClass } from './entities/gym-class.entity.js';

describe('BookingsService', () => {
  const student: AuthUser = { id: 's1', role: UserRole.Student };
  const now = new Date('2026-03-10T12:00:00Z');
  const upcoming = { id: 'c1', startsAt: new Date('2026-03-10T21:00:00Z') } as GymClass;
  const started = { id: 'c1', startsAt: new Date('2026-03-10T11:30:00Z') } as GymClass;
  const booking = { id: 'b1' } as ClassBooking;

  const repository = {
    findById: vi.fn<BookingsRepository['findById']>(),
    book: vi.fn<BookingsRepository['book']>(),
    cancel: vi.fn<BookingsRepository['cancel']>(),
    findByStudent: vi.fn<BookingsRepository['findByStudent']>(),
    findByClass: vi.fn<BookingsRepository['findByClass']>(),
    findStartedByStudent: vi.fn<BookingsRepository['findStartedByStudent']>(),
    setAttendance: vi.fn<BookingsRepository['setAttendance']>(),
  };
  const classesService = { findOne: vi.fn<ClassesService['findOne']>() };
  const clock: Clock = { now: () => now, today: () => '2026-03-10' };
  // Os mocks cobrem só os métodos que o service chama.
  const service = new BookingsService(
    repository as unknown as BookingsRepository,
    classesService as unknown as ClassesService,
    clock,
  );

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('book', () => {
    it('inscreve o aluno e devolve a inscrição', async () => {
      classesService.findOne.mockResolvedValue(upcoming);
      repository.book.mockResolvedValue('b1');
      repository.findById.mockResolvedValue(booking);

      await expect(service.book(student, 'c1')).resolves.toBe(booking);
      expect(repository.book).toHaveBeenCalledWith('c1', 's1');
    });

    it('lança 409 quando a aula está lotada', async () => {
      classesService.findOne.mockResolvedValue(upcoming);
      repository.book.mockResolvedValue(null);

      await expect(service.book(student, 'c1')).rejects.toThrow('Não há vagas disponíveis');
    });

    it('lança 409 quando o aluno já está inscrito', async () => {
      classesService.findOne.mockResolvedValue(upcoming);
      repository.book.mockRejectedValue(
        new QueryFailedError('INSERT', [], Object.assign(new Error('dup'), { code: '23505' })),
      );

      await expect(service.book(student, 'c1')).rejects.toThrow('já está inscrito');
    });

    it('lança 409 quando a aula já começou', async () => {
      classesService.findOne.mockResolvedValue(started);

      await expect(service.book(student, 'c1')).rejects.toBeInstanceOf(ConflictException);
      expect(repository.book).not.toHaveBeenCalled();
    });

    it('propaga o 404 de aula inexistente', async () => {
      classesService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.book(student, 'c1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('cancela a inscrição do próprio aluno', async () => {
      classesService.findOne.mockResolvedValue(upcoming);
      repository.cancel.mockResolvedValue(true);

      await service.cancel(student, 'c1');

      expect(repository.cancel).toHaveBeenCalledWith('c1', 's1');
    });

    it('lança 404 quando o aluno não está inscrito', async () => {
      classesService.findOne.mockResolvedValue(upcoming);
      repository.cancel.mockResolvedValue(false);

      await expect(service.cancel(student, 'c1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('lança 409 quando a aula já começou', async () => {
      classesService.findOne.mockResolvedValue(started);

      await expect(service.cancel(student, 'c1')).rejects.toBeInstanceOf(ConflictException);
      expect(repository.cancel).not.toHaveBeenCalled();
    });
  });

  describe('findMine', () => {
    it('busca só as inscrições do aluno no período', async () => {
      repository.findByStudent.mockResolvedValue([]);

      await service.findMine(student, { from: '2026-03-01' });

      expect(repository.findByStudent).toHaveBeenCalledWith('s1', { from: '2026-03-01' });
    });

    it('lança 400 quando o período está invertido', () => {
      expect(() => service.findMine(student, { from: '2026-03-10', to: '2026-03-01' })).toThrow(
        BadRequestException,
      );
    });
  });

  describe('findRoster', () => {
    it('lança 404 quando a aula não existe', async () => {
      classesService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.findRoster('c1')).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.findByClass).not.toHaveBeenCalled();
    });
  });

  describe('markAttendance', () => {
    it('registra a presença depois do início da aula', async () => {
      classesService.findOne.mockResolvedValue(started);
      repository.setAttendance.mockResolvedValue(booking);

      await expect(service.markAttendance('c1', 'b1', true)).resolves.toBe(booking);
      expect(repository.setAttendance).toHaveBeenCalledWith('c1', 'b1', true);
    });

    it('lança 409 antes do início da aula', async () => {
      classesService.findOne.mockResolvedValue(upcoming);

      await expect(service.markAttendance('c1', 'b1', true)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repository.setAttendance).not.toHaveBeenCalled();
    });

    it('lança 404 quando a inscrição não é dessa aula', async () => {
      classesService.findOne.mockResolvedValue(started);
      repository.setAttendance.mockResolvedValue(null);

      await expect(service.markAttendance('c1', 'b1', false)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('findAttendanceOf', () => {
    it('busca só aulas que já começaram, pelo relógio', async () => {
      repository.findStartedByStudent.mockResolvedValue([]);

      await service.findAttendanceOf('s1', { to: '2026-03-10' });

      expect(repository.findStartedByStudent).toHaveBeenCalledWith('s1', { to: '2026-03-10' }, now);
    });

    it('lança 400 quando o período está invertido', () => {
      expect(() =>
        service.findAttendanceOf('s1', { from: '2026-03-10', to: '2026-03-01' }),
      ).toThrow(BadRequestException);
    });
  });
});
