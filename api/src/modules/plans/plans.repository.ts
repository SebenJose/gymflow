import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CreatePlanDto } from './dto/create-plan.dto.js';
import type { UpdatePlanDto } from './dto/update-plan.dto.js';
import { Plan } from './entities/plan.entity.js';

@Injectable()
export class PlansRepository {
  constructor(@InjectRepository(Plan) private readonly repository: Repository<Plan>) {}

  findAll(onlyActive: boolean): Promise<Plan[]> {
    return this.repository.find({
      where: onlyActive ? { isActive: true } : {},
      order: { monthlyPriceCents: 'ASC', name: 'ASC' },
    });
  }

  findById(id: string): Promise<Plan | null> {
    return this.repository.findOneBy({ id });
  }

  create(data: CreatePlanDto): Promise<Plan> {
    return this.repository.save(this.repository.create(data));
  }

  /** Retorna `null` se o plano não existir. */
  async update(id: string, data: UpdatePlanDto): Promise<Plan | null> {
    const plan = await this.repository.findOneBy({ id });
    return plan === null ? null : this.repository.save(this.repository.merge(plan, data));
  }

  /** Retorna se algum plano foi removido. */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete({ id });
    return (result.affected ?? 0) > 0;
  }
}
