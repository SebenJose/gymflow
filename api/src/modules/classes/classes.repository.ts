import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, type Repository } from 'typeorm';
import type { DatePeriod } from '../../common/validation/period.js';
import { type ClassData, GymClass } from './entities/gym-class.entity.js';
import { whereStartsWithin } from './starts-within.js';

@Injectable()
export class ClassesRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  findById(id: string): Promise<GymClass | null> {
    return this.classes().findOne({ where: { id }, relations: { instructor: true } });
  }

  findAll(period: DatePeriod): Promise<GymClass[]> {
    const query = this.classes()
      .createQueryBuilder('gymClass')
      .leftJoinAndSelect('gymClass.instructor', 'instructor')
      .orderBy('gymClass.startsAt', 'ASC');
    return whereStartsWithin(query, 'gymClass', period).getMany();
  }

  async create(data: ClassData): Promise<string> {
    const gymClass = await this.classes().save(this.classes().create(data));
    return gymClass.id;
  }

  /**
   * Reduzir as vagas abaixo do número de inscritos viola o CHECK da tabela.
   * Retorna se a aula existia.
   */
  async update(id: string, data: Partial<ClassData>): Promise<boolean> {
    const gymClass = await this.classes().findOneBy({ id });
    if (gymClass === null) {
      return false;
    }
    await this.classes().save(this.classes().merge(gymClass, data));
    return true;
  }

  /** As inscrições são removidas em cascata. Retorna se a aula existia. */
  async delete(id: string): Promise<boolean> {
    const result = await this.classes().delete({ id });
    return (result.affected ?? 0) > 0;
  }

  private classes(): Repository<GymClass> {
    return this.dataSource.getRepository(GymClass);
  }
}
