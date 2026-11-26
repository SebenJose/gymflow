import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { Clock } from '../../common/clock/clock.js';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import type { CompletionsRepository } from './completions.repository.js';
import { CompletionsService } from './completions.service.js';
import type { ExerciseCompletion } from './entities/exercise-completion.entity.js';
import type { Workout } from './entities/workout.entity.js';
import type { WorkoutsService } from './workouts.service.js';

describe('CompletionsService', () => {
  const student: AuthUser = { id: 's1', role: UserRole.Student };
  const now = new Date('2026-03-10T12:00:00Z');
  const workout = {
    id: 'w1',
    name: 'Treino A',
    exercises: [{ id: 'e1', name: 'Agachamento', sets: 4, reps: 10, loadKg: 40 }],
  } as Workout;

  const repository = {
    create: vi.fn<CompletionsRepository['create']>(),
    deleteForDay: vi.fn<CompletionsRepository['deleteForDay']>(),
    findAll: vi.fn<CompletionsRepository['findAll']>(),
  };
  const workoutsService = { findOne: vi.fn<WorkoutsService['findOne']>() };
  const clock: Clock = { now: () => now, today: () => '2026-03-10' };
  // Os mocks cobrem só os métodos que o service chama.
  const service = new CompletionsService(
    repository as unknown as CompletionsRepository,
    workoutsService as unknown as WorkoutsService,
    clock,
  );

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('complete', () => {
    it('grava uma cópia do que estava prescrito, com a data de hoje', async () => {
      workoutsService.findOne.mockResolvedValue(workout);
      repository.create.mockResolvedValue({ id: 'c1' } as ExerciseCompletion);

      await service.complete(student, 'w1', 'e1');

      expect(workoutsService.findOne).toHaveBeenCalledWith(student, 'w1');
      expect(repository.create).toHaveBeenCalledWith({
        studentId: 's1',
        workoutId: 'w1',
        exerciseId: 'e1',
        workoutName: 'Treino A',
        exerciseName: 'Agachamento',
        sets: 4,
        reps: 10,
        loadKg: 40,
        completedOn: '2026-03-10',
        completedAt: now,
      });
    });

    it('propaga o 404 de ficha inexistente ou de outro aluno', async () => {
      workoutsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.complete(student, 'w1', 'e1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('lança 404 quando o exercício não é dessa ficha', async () => {
      workoutsService.findOne.mockResolvedValue(workout);

      await expect(service.complete(student, 'w1', 'outro')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('lança 409 quando o exercício já foi concluído hoje', async () => {
      workoutsService.findOne.mockResolvedValue(workout);
      repository.create.mockRejectedValue(
        new QueryFailedError('INSERT', [], Object.assign(new Error('dup'), { code: '23505' })),
      );

      await expect(service.complete(student, 'w1', 'e1')).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('undoToday', () => {
    it('remove a conclusão de hoje do próprio aluno', async () => {
      workoutsService.findOne.mockResolvedValue(workout);
      repository.deleteForDay.mockResolvedValue(true);

      await service.undoToday(student, 'w1', 'e1');

      expect(repository.deleteForDay).toHaveBeenCalledWith('s1', 'e1', '2026-03-10');
    });

    it('lança 404 quando não há conclusão hoje', async () => {
      workoutsService.findOne.mockResolvedValue(workout);
      repository.deleteForDay.mockResolvedValue(false);

      await expect(service.undoToday(student, 'w1', 'e1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('findHistory', () => {
    it('lança 400 quando o período está invertido', () => {
      expect(() => service.findHistory({ from: '2026-03-10', to: '2026-03-01' })).toThrow(
        BadRequestException,
      );
    });

    it('repassa o filtro ao repository', async () => {
      repository.findAll.mockResolvedValue([]);

      await service.findHistory({ studentId: 's1', from: '2026-03-01' });

      expect(repository.findAll).toHaveBeenCalledWith({ studentId: 's1', from: '2026-03-01' });
    });
  });
});
