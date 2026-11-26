import type { Subscription } from '../entities/subscription.entity.js';
import type { SubscriptionStatus } from '../subscription-status.js';
import { InvoiceResponseDto } from './invoice-response.dto.js';

type PlanSummary = { id: string; name: string; durationMonths: number };
type StudentSummary = { id: string; name: string; email: string };

/** Espera a matrícula carregada com `plan`, `student` e `invoices`. */
export class SubscriptionResponseDto {
  readonly id: string;
  readonly status: SubscriptionStatus;
  readonly startDate: string;
  readonly endDate: string;
  readonly monthlyPriceCents: number;
  readonly plan: PlanSummary;
  readonly student: StudentSummary;
  readonly invoices: InvoiceResponseDto[];
  readonly createdAt: Date;

  constructor(subscription: Subscription) {
    const { plan, student } = subscription;
    this.id = subscription.id;
    this.status = subscription.status;
    this.startDate = subscription.startDate;
    this.endDate = subscription.endDate;
    this.monthlyPriceCents = subscription.monthlyPriceCents;
    this.plan = { id: plan.id, name: plan.name, durationMonths: plan.durationMonths };
    this.student = { id: student.id, name: student.name, email: student.email };
    this.invoices = subscription.invoices.map((invoice) => new InvoiceResponseDto(invoice));
    this.createdAt = subscription.createdAt;
  }
}
