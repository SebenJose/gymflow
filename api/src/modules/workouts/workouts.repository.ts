import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, type FindOptionsWhere, type Repository } from 'typeorm';
import type { UpdateExerciseDto } from './dto/update-exercise.dto.js';
import type { UpdateWorkoutDto } from './dto/update-workout.dto.js';
import { type ExerciseData, WorkoutExercise } from './entities/workout-exercise.entity.js';
import { type NewWorkout, Workout } from './entities/workout.entity.js';

const WITH_DETAILS = { student: true, instructor: true, exercises: true } as const;
const ORDER_DETAILS = { createdAt: 'DESC', exercises: { position: 'ASC' } } as const;

@Injectable()
export class WorkoutsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  findById(id: string): Promise<Workout | null> {
    return this.workouts().findOne({
      where: { id },
      relations: WITH_DETAILS,
      order: ORDER_DETAILS,
    });
  }

  findAll(filter: { studentId?: string }): Promise<Workout[]> {
    const where: FindOptionsWhere<Workout> = {};
    if (filter.studentId !== undefined) {
      where.studentId = filter.studentId;
    }
    return this.workouts().find({ where, relations: WITH_DETAILS, order: ORDER_DETAILS });
  }

  /** Cria a ficha e os exercícios na mesma transação, na ordem recebida. */
  createWithExercises(data: NewWorkout, exercises: ExerciseData[]): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      const workout = await manager.save(manager.create(Workout, data));
      await manager.save(
        exercises.map((exercise, position) =>
          manager.create(WorkoutExercise, { ...exercise, position, workoutId: workout.id }),
        ),
      );
      return workout.id;
    });
  }

  /** Retorna se a ficha existia. */
  async update(id: string, data: UpdateWorkoutDto): Promise<boolean> {
    const workout = await this.workouts().findOneBy({ id });
    if (workout === null) {
      return false;
    }
    await this.workouts().save(this.workouts().merge(workout, data));
    return true;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.workouts().delete({ id });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Adiciona o exercício ao fim da ficha. A linha da ficha fica travada durante a transação,
   * para duas inclusões simultâneas não ganharem a mesma posição.
   * Retorna `null` se a ficha não existir.
   */
  addExercise(workoutId: string, data: ExerciseData): Promise<WorkoutExercise | null> {
    return this.dataSource.transaction(async (manager) => {
      const workout = await manager.findOne(Workout, {
        where: { id: workoutId },
        lock: { mode: 'pessimistic_write' },
      });
      if (workout === null) {
        return null;
      }
      const last = await manager.findOne(WorkoutExercise, {
        where: { workoutId },
        order: { position: 'DESC' },
      });
      const position = last === null ? 0 : last.position + 1;
      return manager.save(manager.create(WorkoutExercise, { ...data, position, workoutId }));
    });
  }

  /** Retorna `null` se o exercício não existir nessa ficha. */
  async updateExercise(
    workoutId: string,
    exerciseId: string,
    data: UpdateExerciseDto,
  ): Promise<WorkoutExercise | null> {
    const exercise = await this.exercises().findOneBy({ id: exerciseId, workoutId });
    if (exercise === null) {
      return null;
    }
    return this.exercises().save(this.exercises().merge(exercise, data));
  }

  async deleteExercise(workoutId: string, exerciseId: string): Promise<boolean> {
    const result = await this.exercises().delete({ id: exerciseId, workoutId });
    return (result.affected ?? 0) > 0;
  }

  private workouts(): Repository<Workout> {
    return this.dataSource.getRepository(Workout);
  }

  private exercises(): Repository<WorkoutExercise> {
    return this.dataSource.getRepository(WorkoutExercise);
  }
}
