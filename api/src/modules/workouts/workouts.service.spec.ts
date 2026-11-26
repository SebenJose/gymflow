import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import type { User } from '../users/entities/user.entity.js';
import type { UsersService } from '../users/users.service.js';
import type { WorkoutExercise } from './entities/workout-exercise.entity.js';
import type { Workout } from './entities/workout.entity.js';
import type { WorkoutsRepository } from './workouts.repository.js';
import { WorkoutsService } from './workouts.service.js';

describe('WorkoutsService', () => {
  const instructor: AuthUser = { id: 'i1', role: UserRole.Instructor };
  const student: AuthUser = { id: 's1', role: UserRole.Student };
  const otherStudent: AuthUser = { id: 's2', role: UserRole.Student };
  const workout = { id: 'w1', studentId: 's1' } as Workout;

  const repository = {
    findById: vi.fn<WorkoutsRepository['findById']>(),
    findAll: vi.fn<WorkoutsRepository['findAll']>(),
    createWithExercises: vi.fn<WorkoutsRepository['createWithExercises']>(),
    update: vi.fn<WorkoutsRepository['update']>(),
    delete: vi.fn<WorkoutsRepository['delete']>(),
    addExercise: vi.fn<WorkoutsRepository['addExercise']>(),
    updateExercise: vi.fn<WorkoutsRepository['updateExercise']>(),
    deleteExercise: vi.fn<WorkoutsRepository['deleteExercise']>(),
  };
  const usersService = { findById: vi.fn<UsersService['findById']>() };
  // Os mocks cobrem só os métodos que o service chama.
  const service = new WorkoutsService(
    repository as unknown as WorkoutsRepository,
    usersService as unknown as UsersService,
  );

  const userWith = (role: UserRole): User => ({ id: 's1', role }) as User;
  const squat = { name: 'Agachamento', sets: 4, reps: 10 };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('create', () => {
    it('cria a ficha em nome do instrutor, com campos opcionais nulos', async () => {
      usersService.findById.mockResolvedValue(userWith(UserRole.Student));
      repository.createWithExercises.mockResolvedValue('w1');
      repository.findById.mockResolvedValue(workout);

      await service.create(instructor, { studentId: 's1', name: 'Treino A', exercises: [squat] });

      expect(repository.createWithExercises).toHaveBeenCalledWith(
        { studentId: 's1', instructorId: 'i1', name: 'Treino A', notes: null },
        [{ ...squat, loadKg: null, restSeconds: null, notes: null }],
      );
    });

    it('lança 400 quando o usuário informado não é aluno', async () => {
      usersService.findById.mockResolvedValue(userWith(UserRole.Instructor));

      await expect(
        service.create(instructor, { studentId: 's1', name: 'Treino A', exercises: [squat] }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.createWithExercises).not.toHaveBeenCalled();
    });

    it('propaga o 404 de aluno inexistente', async () => {
      usersService.findById.mockRejectedValue(new NotFoundException());

      await expect(
        service.create(instructor, { studentId: 'x', name: 'Treino A', exercises: [squat] }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('devolve a própria ficha ao aluno', async () => {
      repository.findById.mockResolvedValue(workout);

      await expect(service.findOne(student, 'w1')).resolves.toBe(workout);
    });

    it('responde 404 para ficha de outro aluno', async () => {
      repository.findById.mockResolvedValue(workout);

      await expect(service.findOne(otherStudent, 'w1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('instrutor vê qualquer ficha', async () => {
      repository.findById.mockResolvedValue(workout);

      await expect(service.findOne(instructor, 'w1')).resolves.toBe(workout);
    });
  });

  describe('404 quando a ficha ou o exercício não existem', () => {
    it('update', async () => {
      repository.update.mockResolvedValue(false);

      await expect(service.update('x', { name: 'B' })).rejects.toBeInstanceOf(NotFoundException);
    });

    it('remove', async () => {
      repository.delete.mockResolvedValue(false);

      await expect(service.remove('x')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('addExercise', async () => {
      repository.addExercise.mockResolvedValue(null);

      await expect(service.addExercise('x', squat)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('updateExercise', async () => {
      repository.updateExercise.mockResolvedValue(null);

      await expect(service.updateExercise('w1', 'x', { reps: 12 })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('removeExercise', async () => {
      repository.deleteExercise.mockResolvedValue(false);

      await expect(service.removeExercise('w1', 'x')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  it('addExercise devolve o exercício criado', async () => {
    const created = { id: 'e1', position: 3 } as WorkoutExercise;
    repository.addExercise.mockResolvedValue(created);

    await expect(service.addExercise('w1', squat)).resolves.toBe(created);
  });
});
