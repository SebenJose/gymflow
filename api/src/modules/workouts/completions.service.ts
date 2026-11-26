import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Clock } from '../../common/clock/clock.js';
import { isUniqueViolation } from '../../common/database/postgres-errors.js';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { type CompletionFilter, CompletionsRepository } from './completions.repository.js';
import type { ExerciseCompletion } from './entities/exercise-completion.entity.js';
import { WorkoutsService } from './workouts.service.js';

const EXERCISE_NOT_FOUND = 'Exercício não encontrado nesta ficha';
const ALREADY_COMPLETED = 'Este exercício já foi concluído hoje';
const NOTHING_TO_UNDO = 'Nenhuma conclusão deste exercício registrada hoje';
const INVALID_RANGE = 'A data inicial não pode ser depois da data final';

@Injectable()
export class CompletionsService {
  constructor(
    private readonly completionsRepository: CompletionsRepository,
    private readonly workoutsService: WorkoutsService,
    private readonly clock: Clock,
  ) {}

  /** Registra que o aluno concluiu hoje um exercício da própria ficha. */
  async complete(
    student: AuthUser,
    workoutId: string,
    exerciseId: string,
  ): Promise<ExerciseCompletion> {
    // Ficha de outro aluno responde 404 aqui.
    const workout = await this.workoutsService.findOne(student, workoutId);
    const exercise = workout.exercises.find((candidate) => candidate.id === exerciseId);
    if (exercise === undefined) {
      throw new NotFoundException(EXERCISE_NOT_FOUND);
    }

    try {
      return await this.completionsRepository.create({
        studentId: student.id,
        workoutId: workout.id,
        exerciseId: exercise.id,
        workoutName: workout.name,
        exerciseName: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        loadKg: exercise.loadKg,
        completedOn: this.clock.today(),
        completedAt: this.clock.now(),
      });
    } catch (error) {
      throw isUniqueViolation(error) ? new ConflictException(ALREADY_COMPLETED) : error;
    }
  }

  /** Desfaz a conclusão de hoje (ex.: o aluno marcou o exercício errado). */
  async undoToday(student: AuthUser, workoutId: string, exerciseId: string): Promise<void> {
    await this.workoutsService.findOne(student, workoutId);
    const removed = await this.completionsRepository.deleteForDay(
      student.id,
      exerciseId,
      this.clock.today(),
    );
    if (!removed) {
      throw new NotFoundException(NOTHING_TO_UNDO);
    }
  }

  findHistory(filter: CompletionFilter): Promise<ExerciseCompletion[]> {
    if (filter.from !== undefined && filter.to !== undefined && filter.from > filter.to) {
      throw new BadRequestException(INVALID_RANGE);
    }
    return this.completionsRepository.findAll(filter);
  }
}
