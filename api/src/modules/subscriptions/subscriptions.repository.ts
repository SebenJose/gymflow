import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, type FindOptionsWhere, Not } from 'typeorm';
import { Invoice, type NewInvoice } from './entities/invoice.entity.js';
import { type NewSubscription, Subscription } from './entities/subscription.entity.js';
import { InvoiceStatus, SubscriptionStatus } from './subscription-status.js';

export type SubscriptionFilter = {
  status?: SubscriptionStatus;
  studentId?: string;
};

const WITH_DETAILS = { plan: true, student: true, invoices: true } as const;
const ORDER_DETAILS = { createdAt: 'DESC', invoices: { dueDate: 'ASC' } } as const;

@Injectable()
export class SubscriptionsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  findById(id: string): Promise<Subscription | null> {
    return this.dataSource.getRepository(Subscription).findOne({
      where: { id },
      relations: WITH_DETAILS,
      order: ORDER_DETAILS,
    });
  }

  findAll(filter: SubscriptionFilter): Promise<Subscription[]> {
    const where: FindOptionsWhere<Subscription> = {};
    if (filter.status !== undefined) {
      where.status = filter.status;
    }
    if (filter.studentId !== undefined) {
      where.studentId = filter.studentId;
    }
    return this.dataSource
      .getRepository(Subscription)
      .find({ where, relations: WITH_DETAILS, order: ORDER_DETAILS });
  }

  /** Cria a matrícula e as mensalidades na mesma transação: ou tudo, ou nada. */
  async createWithInvoices(data: NewSubscription, invoices: NewInvoice[]): Promise<string> {
    return this.dataSource.transaction(async (manager) => {
      const subscription = await manager.save(manager.create(Subscription, data));
      await manager.save(
        invoices.map((invoice) =>
          manager.create(Invoice, { ...invoice, subscriptionId: subscription.id }),
        ),
      );
      return subscription.id;
    });
  }

  /**
   * Muda a situação só se a matrícula não estiver cancelada (checado no próprio UPDATE,
   * sem corrida). Ao cancelar, as mensalidades pendentes são canceladas juntas.
   * Retorna se a matrícula foi alterada.
   */
  async updateStatus(id: string, status: SubscriptionStatus): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const result = await manager.update(
        Subscription,
        { id, status: Not(SubscriptionStatus.Cancelled) },
        { status },
      );
      if ((result.affected ?? 0) === 0) {
        return false;
      }
      if (status === SubscriptionStatus.Cancelled) {
        await manager.update(
          Invoice,
          { subscriptionId: id, status: InvoiceStatus.Pending },
          { status: InvoiceStatus.Cancelled },
        );
      }
      return true;
    });
  }

  findInvoiceById(id: string): Promise<Invoice | null> {
    return this.dataSource.getRepository(Invoice).findOneBy({ id });
  }

  /** Marca como paga só se ainda estiver pendente. Retorna se a mensalidade foi alterada. */
  async markInvoicePaid(id: string, paidAt: Date): Promise<boolean> {
    const result = await this.dataSource
      .getRepository(Invoice)
      .update({ id, status: InvoiceStatus.Pending }, { status: InvoiceStatus.Paid, paidAt });
    return (result.affected ?? 0) > 0;
  }
}
