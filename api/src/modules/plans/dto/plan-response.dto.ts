import type { Plan } from '../entities/plan.entity.js';

export class PlanResponseDto {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly monthlyPriceCents: number;
  readonly durationMonths: number;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(plan: Plan) {
    this.id = plan.id;
    this.name = plan.name;
    this.description = plan.description;
    this.monthlyPriceCents = plan.monthlyPriceCents;
    this.durationMonths = plan.durationMonths;
    this.isActive = plan.isActive;
    this.createdAt = plan.createdAt;
    this.updatedAt = plan.updatedAt;
  }
}
