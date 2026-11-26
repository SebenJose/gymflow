import { ConflictException, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { Clock } from '../../common/clock/clock.js';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import type { Plan } from '../plans/entities/plan.entity.js';
import type { PlansService } from '../plans/plans.service.js';
import type { Invoice } from './entities/invoice.entity.js';
import type { Subscription } from './entities/subscription.entity.js';
import { InvoiceStatus, SubscriptionStatus } from './subscription-status.js';
import type { SubscriptionsRepository } from './subscriptions.repository.js';
import { SubscriptionsService } from './subscriptions.service.js';

describe('SubscriptionsService', () => {
  const student: AuthUser = { id: 's1', role: UserRole.Student };
  const otherStudent: AuthUser = { id: 's2', role: UserRole.Student };
  const admin: AuthUser = { id: 'a1', role: UserRole.Admin };
  const quarterly = { id: 'p1', monthlyPriceCents: 9990, durationMonths: 3 } as Plan;
  const now = new Date('2026-01-31T15:00:00Z');

  const repository = {
    findById: vi.fn<SubscriptionsRepository['findById']>(),
    findAll: vi.fn<SubscriptionsRepository['findAll']>(),
    createWithInvoices: vi.fn<SubscriptionsRepository['createWithInvoices']>(),
    updateStatus: vi.fn<SubscriptionsRepository['updateStatus']>(),
    findInvoiceById: vi.fn<SubscriptionsRepository['findInvoiceById']>(),
    markInvoicePaid: vi.fn<SubscriptionsRepository['markInvoicePaid']>(),
  };
  const plansService = { findOne: vi.fn<PlansService['findOne']>() };
  const clock: Clock = { now: () => now, today: () => '2026-01-31' };
  // Os mocks cobrem só os métodos que o service chama.
  const service = new SubscriptionsService(
    repository as unknown as SubscriptionsRepository,
    plansService as unknown as PlansService,
    clock,
  );

  const subscriptionWith = (status: SubscriptionStatus, studentId = student.id): Subscription =>
    ({ id: 'sub1', studentId, status }) as Subscription;
  const invoiceWith = (status: InvoiceStatus): Invoice => ({ id: 'inv1', status }) as Invoice;
  const uniqueViolation = new QueryFailedError(
    'INSERT',
    [],
    Object.assign(new Error('duplicate key'), { code: '23505' }),
  );

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('subscribe', () => {
    it('cria a matrícula com o preço do plano e uma mensalidade por mês', async () => {
      plansService.findOne.mockResolvedValue(quarterly);
      repository.createWithInvoices.mockResolvedValue('sub1');
      repository.findById.mockResolvedValue(subscriptionWith(SubscriptionStatus.Active));

      await service.subscribe(student, 'p1');

      expect(plansService.findOne).toHaveBeenCalledWith(student, 'p1');
      expect(repository.createWithInvoices).toHaveBeenCalledWith(
        {
          studentId: 's1',
          planId: 'p1',
          status: SubscriptionStatus.Active,
          startDate: '2026-01-31',
          endDate: '2026-04-30',
          monthlyPriceCents: 9990,
        },
        [
          { dueDate: '2026-01-31', amountCents: 9990 },
          { dueDate: '2026-02-28', amountCents: 9990 },
          { dueDate: '2026-03-31', amountCents: 9990 },
        ],
      );
    });

    it('propaga o 404 de plano inexistente ou desativado', async () => {
      plansService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.subscribe(student, 'p1')).rejects.toBeInstanceOf(NotFoundException);
      expect(repository.createWithInvoices).not.toHaveBeenCalled();
    });

    it('lança 409 quando o aluno já tem matrícula aberta', async () => {
      plansService.findOne.mockResolvedValue(quarterly);
      repository.createWithInvoices.mockRejectedValue(uniqueViolation);

      await expect(service.subscribe(student, 'p1')).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('findOne', () => {
    it('devolve a própria matrícula ao aluno', async () => {
      repository.findById.mockResolvedValue(subscriptionWith(SubscriptionStatus.Active));

      await expect(service.findOne(student, 'sub1')).resolves.toMatchObject({ id: 'sub1' });
    });

    it('responde 404 para matrícula de outro aluno', async () => {
      repository.findById.mockResolvedValue(subscriptionWith(SubscriptionStatus.Active));

      await expect(service.findOne(otherStudent, 'sub1')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('admin vê qualquer matrícula', async () => {
      repository.findById.mockResolvedValue(subscriptionWith(SubscriptionStatus.Active));

      await expect(service.findOne(admin, 'sub1')).resolves.toMatchObject({ id: 'sub1' });
    });
  });

  describe('changeStatus', () => {
    it('lança 404 para matrícula inexistente', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.changeStatus('x', SubscriptionStatus.Suspended)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('não altera nada quando a situação já é a pedida', async () => {
      repository.findById.mockResolvedValue(subscriptionWith(SubscriptionStatus.Suspended));

      await service.changeStatus('sub1', SubscriptionStatus.Suspended);

      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('lança 409 ao tentar reabrir matrícula cancelada', async () => {
      repository.findById.mockResolvedValue(subscriptionWith(SubscriptionStatus.Cancelled));

      await expect(service.changeStatus('sub1', SubscriptionStatus.Active)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repository.updateStatus).not.toHaveBeenCalled();
    });

    it('lança 409 se a matrícula for cancelada por outra requisição no meio', async () => {
      repository.findById.mockResolvedValue(subscriptionWith(SubscriptionStatus.Active));
      repository.updateStatus.mockResolvedValue(false);

      await expect(
        service.changeStatus('sub1', SubscriptionStatus.Suspended),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('lança 409 ao reativar quando o aluno já tem outra matrícula aberta', async () => {
      repository.findById.mockResolvedValue(subscriptionWith(SubscriptionStatus.Suspended));
      repository.updateStatus.mockRejectedValue(uniqueViolation);

      await expect(service.changeStatus('sub1', SubscriptionStatus.Active)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('suspende uma matrícula ativa', async () => {
      repository.findById.mockResolvedValue(subscriptionWith(SubscriptionStatus.Active));
      repository.updateStatus.mockResolvedValue(true);

      await service.changeStatus('sub1', SubscriptionStatus.Suspended);

      expect(repository.updateStatus).toHaveBeenCalledWith('sub1', SubscriptionStatus.Suspended);
    });
  });

  describe('payInvoice', () => {
    it('lança 404 para mensalidade inexistente', async () => {
      repository.findInvoiceById.mockResolvedValue(null);

      await expect(service.payInvoice('x')).rejects.toBeInstanceOf(NotFoundException);
    });

    it.each([InvoiceStatus.Paid, InvoiceStatus.Cancelled])(
      'lança 409 para mensalidade %s',
      async (status) => {
        repository.findInvoiceById.mockResolvedValue(invoiceWith(status));

        await expect(service.payInvoice('inv1')).rejects.toBeInstanceOf(ConflictException);
        expect(repository.markInvoicePaid).not.toHaveBeenCalled();
      },
    );

    it('marca como paga com a data do relógio', async () => {
      repository.findInvoiceById.mockResolvedValue(invoiceWith(InvoiceStatus.Pending));
      repository.markInvoicePaid.mockResolvedValue(true);

      await service.payInvoice('inv1');

      expect(repository.markInvoicePaid).toHaveBeenCalledWith('inv1', now);
    });

    it('lança 409 se outra requisição pagou no meio', async () => {
      repository.findInvoiceById.mockResolvedValue(invoiceWith(InvoiceStatus.Pending));
      repository.markInvoicePaid.mockResolvedValue(false);

      await expect(service.payInvoice('inv1')).rejects.toBeInstanceOf(ConflictException);
    });
  });
});
