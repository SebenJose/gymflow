import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Clock } from '../../common/clock/clock.js';
import { isUniqueViolation } from '../../common/database/postgres-errors.js';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import { PlansService } from '../plans/plans.service.js';
import { buildBillingSchedule } from './billing-schedule.js';
import type { Invoice } from './entities/invoice.entity.js';
import type { Subscription } from './entities/subscription.entity.js';
import { InvoiceStatus, SubscriptionStatus } from './subscription-status.js';
import { type SubscriptionFilter, SubscriptionsRepository } from './subscriptions.repository.js';

const SUBSCRIPTION_NOT_FOUND = 'Matrícula não encontrada';
const INVOICE_NOT_FOUND = 'Mensalidade não encontrada';
const ALREADY_SUBSCRIBED = 'O aluno já possui uma matrícula ativa ou suspensa';
const CANCELLED_IS_FINAL = 'Matrícula cancelada não pode mudar de situação';
const ONLY_PENDING_CAN_BE_PAID = 'Somente mensalidades pendentes podem ser pagas';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly plansService: PlansService,
    private readonly clock: Clock,
  ) {}

  /** Contrata um plano ativo: cria a matrícula e todas as mensalidades da vigência. */
  async subscribe(student: AuthUser, planId: string): Promise<Subscription> {
    // Para o aluno, plano desativado é tratado como inexistente (404).
    const plan = await this.plansService.findOne(student, planId);
    const schedule = buildBillingSchedule(this.clock.today(), plan.durationMonths);

    let id: string;
    try {
      id = await this.subscriptionsRepository.createWithInvoices(
        {
          studentId: student.id,
          planId: plan.id,
          status: SubscriptionStatus.Active,
          startDate: schedule.startDate,
          endDate: schedule.endDate,
          monthlyPriceCents: plan.monthlyPriceCents,
        },
        schedule.dueDates.map((dueDate) => ({ dueDate, amountCents: plan.monthlyPriceCents })),
      );
    } catch (error) {
      throw isUniqueViolation(error) ? new ConflictException(ALREADY_SUBSCRIBED) : error;
    }
    return this.getById(id);
  }

  findMine(student: AuthUser): Promise<Subscription[]> {
    return this.subscriptionsRepository.findAll({ studentId: student.id });
  }

  findAll(filter: SubscriptionFilter): Promise<Subscription[]> {
    return this.subscriptionsRepository.findAll(filter);
  }

  /** O aluno só enxerga as próprias matrículas; as dos outros respondem 404. */
  async findOne(user: AuthUser, id: string): Promise<Subscription> {
    const subscription = await this.getById(id);
    if (user.role !== UserRole.Admin && subscription.studentId !== user.id) {
      throw new NotFoundException(SUBSCRIPTION_NOT_FOUND);
    }
    return subscription;
  }

  async changeStatus(id: string, status: SubscriptionStatus): Promise<Subscription> {
    const subscription = await this.getById(id);
    if (subscription.status === status) {
      return subscription;
    }
    if (subscription.status === SubscriptionStatus.Cancelled) {
      throw new ConflictException(CANCELLED_IS_FINAL);
    }

    let changed: boolean;
    try {
      changed = await this.subscriptionsRepository.updateStatus(id, status);
    } catch (error) {
      // Reativar uma suspensa quando o aluno já tem outra matrícula aberta.
      throw isUniqueViolation(error) ? new ConflictException(ALREADY_SUBSCRIBED) : error;
    }
    if (!changed) {
      // Foi cancelada por outra requisição entre a leitura e o UPDATE.
      throw new ConflictException(CANCELLED_IS_FINAL);
    }
    return this.getById(id);
  }

  async payInvoice(id: string): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id);
    if (invoice.status !== InvoiceStatus.Pending) {
      throw new ConflictException(ONLY_PENDING_CAN_BE_PAID);
    }
    const paid = await this.subscriptionsRepository.markInvoicePaid(id, this.clock.now());
    if (!paid) {
      throw new ConflictException(ONLY_PENDING_CAN_BE_PAID);
    }
    return this.getInvoiceById(id);
  }

  private async getById(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionsRepository.findById(id);
    if (subscription === null) {
      throw new NotFoundException(SUBSCRIPTION_NOT_FOUND);
    }
    return subscription;
  }

  private async getInvoiceById(id: string): Promise<Invoice> {
    const invoice = await this.subscriptionsRepository.findInvoiceById(id);
    if (invoice === null) {
      throw new NotFoundException(INVOICE_NOT_FOUND);
    }
    return invoice;
  }
}
