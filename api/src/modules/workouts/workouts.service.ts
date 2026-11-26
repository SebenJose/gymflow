import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import { UsersService } from '../users/users.service.js';
import type { CreateExerciseDto } from './dto/create-exercise.dto.js';
import type { CreateWorkoutDto } from './dto/create-workout.dto.js';
import type { UpdateExerciseDto } from './dto/update-exercise.dto.js';
import type { UpdateWorkoutDto } from './dto/update-workout.dto.js';
import type { ExerciseData, WorkoutExercise } from './entities/workout-exercise.entity.js';
import type { Workout } from './entities/workout.entity.js';
import { WorkoutsRepository } from './workouts.repository.js';

const WORKOUT_NOT_FOUND = 'Ficha de treino não encontrada';
const EXERCISE_NOT_FOUND = 'Exercício não encontrado nesta ficha';
const NOT_A_STUDENT = 'Fichas de treino só podem ser criadas para alunos';

@Injectable()
export class WorkoutsService {
  constructor(
    private readonly workoutsRepository: WorkoutsRepository,
    private readonly usersService: UsersService,
  ) {}

  async create(author: AuthUser, dto: CreateWorkoutDto): Promise<Workout> {
    const student = await this.usersService.findById(dto.studentId);
    if (student.role !== UserRole.Student) {
      throw new BadRequestException(NOT_A_STUDENT);
    }
    const id = await this.workoutsRepository.createWithExercises(
      { studentId: student.id, instructorId: author.id, name: dto.name, notes: dto.notes ?? null },
      dto.exercises.map(toExerciseData),
    );
    return this.getById(id);
  }

  findMine(student: AuthUser): Promise<Workout[]> {
    return this.workoutsRepository.findAll({ studentId: student.id });
  }

  findAll(filter: { studentId?: string }): Promise<Workout[]> {
    return this.workoutsRepository.findAll(filter);
  }

  /** O aluno só enxerga as próprias fichas; as dos outros respondem 404. */
  async findOne(user: AuthUser, id: string): Promise<Workout> {
    const workout = await this.getById(id);
    if (user.role === UserRole.Student && workout.studentId !== user.id) {
      throw new NotFoundException(WORKOUT_NOT_FOUND);
    }
    return workout;
  }

  async update(id: string, dto: UpdateWorkoutDto): Promise<Workout> {
    if (!(await this.workoutsRepository.update(id, dto))) {
      throw new NotFoundException(WORKOUT_NOT_FOUND);
    }
    return this.getById(id);
  }

  async remove(id: string): Promise<void> {
    if (!(await this.workoutsRepository.delete(id))) {
      throw new NotFoundException(WORKOUT_NOT_FOUND);
    }
  }

  async addExercise(workoutId: string, dto: CreateExerciseDto): Promise<WorkoutExercise> {
    const exercise = await this.workoutsRepository.addExercise(workoutId, toExerciseData(dto));
    if (exercise === null) {
      throw new NotFoundException(WORKOUT_NOT_FOUND);
    }
    return exercise;
  }

  async updateExercise(
    workoutId: string,
    exerciseId: string,
    dto: UpdateExerciseDto,
  ): Promise<WorkoutExercise> {
    const exercise = await this.workoutsRepository.updateExercise(workoutId, exerciseId, dto);
    if (exercise === null) {
      throw new NotFoundException(EXERCISE_NOT_FOUND);
    }
    return exercise;
  }

  async removeExercise(workoutId: string, exerciseId: string): Promise<void> {
    if (!(await this.workoutsRepository.deleteExercise(workoutId, exerciseId))) {
      throw new NotFoundException(EXERCISE_NOT_FOUND);
    }
  }

  private async getById(id: string): Promise<Workout> {
    const workout = await this.workoutsRepository.findById(id);
    if (workout === null) {
      throw new NotFoundException(WORKOUT_NOT_FOUND);
    }
    return workout;
  }
}

function toExerciseData(dto: CreateExerciseDto): ExerciseData {
  return {
    name: dto.name,
    sets: dto.sets,
    reps: dto.reps,
    loadKg: dto.loadKg ?? null,
    restSeconds: dto.restSeconds ?? null,
    notes: dto.notes ?? null,
  };
}
