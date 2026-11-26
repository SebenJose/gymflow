import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  type FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import {
  ExerciseCompletion,
  type NewExerciseCompletion,
} from './entities/exercise-completion.entity.js';

export type CompletionFilter = {
  studentId?: string;
  from?: string;
  to?: string;
};

@Injectable()
export class CompletionsRepository {
  constructor(
    @InjectRepository(ExerciseCompletion)
    private readonly repository: Repository<ExerciseCompletion>,
  ) {}

  create(data: NewExerciseCompletion): Promise<ExerciseCompletion> {
    return this.repository.save(this.repository.create(data));
  }

  /** Retorna se havia conclusão do exercício nesse dia. */
  async deleteForDay(studentId: string, exerciseId: string, day: string): Promise<boolean> {
    const result = await this.repository.delete({ studentId, exerciseId, completedOn: day });
    return (result.affected ?? 0) > 0;
  }

  findAll(filter: CompletionFilter): Promise<ExerciseCompletion[]> {
    const where: FindOptionsWhere<ExerciseCompletion> = {};
    if (filter.studentId !== undefined) {
      where.studentId = filter.studentId;
    }
    if (filter.from !== undefined && filter.to !== undefined) {
      where.completedOn = Between(filter.from, filter.to);
    } else if (filter.from !== undefined) {
      where.completedOn = MoreThanOrEqual(filter.from);
    } else if (filter.to !== undefined) {
      where.completedOn = LessThanOrEqual(filter.to);
    }
    return this.repository.find({ where, order: { completedAt: 'DESC' } });
  }
}
