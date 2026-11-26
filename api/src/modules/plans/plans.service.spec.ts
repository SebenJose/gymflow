import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import type { AuthUser } from '../../common/types/auth-user.type.js';
import { UserRole } from '../../common/types/user-role.js';
import type { Plan } from './entities/plan.entity.js';
import type { PlansRepository } from './plans.repository.js';
import { PlansService } from './plans.service.js';

describe('PlansService', () => {
  const admin: AuthUser = { id: 'a1', role: UserRole.Admin };
  const student: AuthUser = { id: 's1', role: UserRole.Student };
  const activePlan = { id: 'p1', name: 'Mensal', isActive: true } as Plan;
  const inactivePlan = { id: 'p2', name: 'Antigo', isActive: false } as Plan;

  const repository = {
    findAll: vi.fn<PlansRepository['findAll']>(),
    findById: vi.fn<PlansRepository['findById']>(),
    create: vi.fn<PlansRepository['create']>(),
    update: vi.fn<PlansRepository['update']>(),
    delete: vi.fn<PlansRepository['delete']>(),
  };
  const service = new PlansService(repository as unknown as PlansRepository);
  const uniqueViolation = new QueryFailedError(
    'INSERT',
    [],
    Object.assign(new Error('duplicate key'), { code: '23505' }),
  );

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('findAll', () => {
    it('lista só os ativos por padrão', async () => {
      repository.findAll.mockResolvedValue([activePlan]);

      await expect(service.findAll(student, false)).resolves.toEqual([activePlan]);
      expect(repository.findAll).toHaveBeenCalledWith(true);
    });

    it('admin pode incluir os desativados', async () => {
      repository.findAll.mockResolvedValue([activePlan, inactivePlan]);

      await service.findAll(admin, true);

      expect(repository.findAll).toHaveBeenCalledWith(false);
    });

    it('lança 403 quando quem não é admin pede os desativados', () => {
      expect(() => service.findAll(student, true)).toThrow(ForbiddenException);
      expect(repository.findAll).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('lança 404 quando o plano não existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne(admin, 'x')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('esconde plano desativado de quem não é admin', async () => {
      repository.findById.mockResolvedValue(inactivePlan);

      await expect(service.findOne(student, 'p2')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('mostra plano desativado ao admin', async () => {
      repository.findById.mockResolvedValue(inactivePlan);

      await expect(service.findOne(admin, 'p2')).resolves.toBe(inactivePlan);
    });
  });

  describe('create e update', () => {
    const dto = { name: 'Mensal', monthlyPriceCents: 9990, durationMonths: 1 };

    it('converte nome duplicado em 409 ao criar', async () => {
      repository.create.mockRejectedValue(uniqueViolation);

      await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    });

    it('converte nome duplicado em 409 ao atualizar', async () => {
      repository.update.mockRejectedValue(uniqueViolation);

      await expect(service.update('p1', { name: 'Antigo' })).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('lança 404 ao atualizar plano inexistente', async () => {
      repository.update.mockResolvedValue(null);

      await expect(service.update('x', { name: 'Novo' })).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('lança 404 quando nada foi removido', async () => {
      repository.delete.mockResolvedValue(false);

      await expect(service.remove('x')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('remove o plano existente', async () => {
      repository.delete.mockResolvedValue(true);

      await expect(service.remove('p1')).resolves.toBeUndefined();
    });
  });
});
