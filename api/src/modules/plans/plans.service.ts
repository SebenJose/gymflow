import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isUniqueViolation } from '../../common/database/is-unique-violation.js';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import type { CreatePlanDto } from './dto/create-plan.dto.js';
import type { UpdatePlanDto } from './dto/update-plan.dto.js';
import type { Plan } from './entities/plan.entity.js';
import { PlansRepository } from './plans.repository.js';

const PLAN_NOT_FOUND_MESSAGE = 'Plano não encontrado';
const DUPLICATE_NAME_MESSAGE = 'Já existe um plano com esse nome';

@Injectable()
export class PlansService {
  constructor(private readonly plansRepository: PlansRepository) {}

  /** Quem não é admin só vê os planos disponíveis para contratação. */
  findAll(user: AuthUser, includeInactive: boolean): Promise<Plan[]> {
    if (includeInactive && user.role !== UserRole.Admin) {
      throw new ForbiddenException('Apenas administradores veem planos desativados');
    }
    return this.plansRepository.findAll(!includeInactive);
  }

  /** Plano desativado é tratado como inexistente para quem não é admin. */
  async findOne(user: AuthUser, id: string): Promise<Plan> {
    const plan = await this.plansRepository.findById(id);
    if (plan === null || (!plan.isActive && user.role !== UserRole.Admin)) {
      throw new NotFoundException(PLAN_NOT_FOUND_MESSAGE);
    }
    return plan;
  }

  create(dto: CreatePlanDto): Promise<Plan> {
    return this.withUniqueName(() => this.plansRepository.create(dto));
  }

  async update(id: string, dto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.withUniqueName(() => this.plansRepository.update(id, dto));
    if (plan === null) {
      throw new NotFoundException(PLAN_NOT_FOUND_MESSAGE);
    }
    return plan;
  }

  async remove(id: string): Promise<void> {
    const removed = await this.plansRepository.delete(id);
    if (!removed) {
      throw new NotFoundException(PLAN_NOT_FOUND_MESSAGE);
    }
  }

  /** O nome único é garantido pela constraint do banco; a violação vira 409. */
  private async withUniqueName<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(DUPLICATE_NAME_MESSAGE);
      }
      throw error;
    }
  }
}
