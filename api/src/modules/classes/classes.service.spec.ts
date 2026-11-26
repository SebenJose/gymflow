import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { Clock } from '../../common/clock/clock.js';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import type { User } from '../users/entities/user.entity.js';
import type { UsersService } from '../users/users.service.js';
import type { ClassesRepository } from './classes.repository.js';
import { ClassesService } from './classes.service.js';
import type { GymClass } from './entities/gym-class.entity.js';

describe('ClassesService', () => {
  const admin: AuthUser = { id: 'a1', role: UserRole.Admin };
  const instructor: AuthUser = { id: 'i1', role: UserRole.Instructor };
  const now = new Date('2026-03-10T12:00:00Z');
  const tomorrow = '2026-03-11T18:00:00-03:00';
  const gymClass = { id: 'c1' } as GymClass;

  const repository = {
    findById: vi.fn<ClassesRepository['findById']>(),
    findAll: vi.fn<ClassesRepository['findAll']>(),
    create: vi.fn<ClassesRepository['create']>(),
    update: vi.fn<ClassesRepository['update']>(),
    delete: vi.fn<ClassesRepository['delete']>(),
  };
  const usersService = { findById: vi.fn<UsersService['findById']>() };
  const clock: Clock = { now: () => now, today: () => '2026-03-10' };
  // Os mocks cobrem só os métodos que o service chama.
  const service = new ClassesService(
    repository as unknown as ClassesRepository,
    usersService as unknown as UsersService,
    clock,
  );

  const userWith = (id: string, role: UserRole): User => ({ id, role }) as User;
  const spinning = { name: 'Spinning', startsAt: tomorrow, durationMinutes: 45, capacity: 20 };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('findAll', () => {
    it('sem data inicial, lista a partir de hoje', async () => {
      repository.findAll.mockResolvedValue([]);

      await service.findAll({ to: '2026-03-20' });

      expect(repository.findAll).toHaveBeenCalledWith({ from: '2026-03-10', to: '2026-03-20' });
    });

    it('lança 400 quando o período está invertido', () => {
      expect(() => service.findAll({ from: '2026-03-10', to: '2026-03-01' })).toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('lança 404 quando a aula não existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('c1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('create', () => {
    it('instrutor que não informa o responsável fica com a aula', async () => {
      usersService.findById.mockResolvedValue(userWith('i1', UserRole.Instructor));
      repository.create.mockResolvedValue('c1');
      repository.findById.mockResolvedValue(gymClass);

      await expect(service.create(instructor, spinning)).resolves.toBe(gymClass);

      expect(repository.create).toHaveBeenCalledWith({
        name: 'Spinning',
        description: null,
        instructorId: 'i1',
        startsAt: new Date(tomorrow),
        durationMinutes: 45,
        capacity: 20,
      });
    });

    it('admin pode criar aula sem responsável', async () => {
      repository.create.mockResolvedValue('c1');
      repository.findById.mockResolvedValue(gymClass);

      await service.create(admin, spinning);

      expect(usersService.findById).not.toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ instructorId: null }),
      );
    });

    it('lança 400 quando o responsável não é instrutor', async () => {
      usersService.findById.mockResolvedValue(userWith('s1', UserRole.Student));

      await expect(
        service.create(admin, { ...spinning, instructorId: 's1' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('lança 400 quando a aula começaria no passado', async () => {
      await expect(
        service.create(admin, { ...spinning, startsAt: '2026-03-10T08:00:00-03:00' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('update', () => {
    it('converte o horário e repassa só o que mudou', async () => {
      repository.update.mockResolvedValue(true);
      repository.findById.mockResolvedValue(gymClass);

      await service.update('c1', { startsAt: tomorrow, capacity: 30 });

      expect(repository.update).toHaveBeenCalledWith('c1', {
        startsAt: new Date(tomorrow),
        capacity: 30,
      });
    });

    it('lança 409 quando as vagas ficariam abaixo dos inscritos', async () => {
      repository.update.mockRejectedValue(
        new QueryFailedError('UPDATE', [], Object.assign(new Error('check'), { code: '23514' })),
      );

      await expect(service.update('c1', { capacity: 1 })).rejects.toBeInstanceOf(ConflictException);
    });

    it('lança 404 quando a aula não existe', async () => {
      repository.update.mockResolvedValue(false);

      await expect(service.update('c1', { name: 'Yoga' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('lança 404 quando a aula não existe', async () => {
      repository.delete.mockResolvedValue(false);

      await expect(service.remove('c1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
