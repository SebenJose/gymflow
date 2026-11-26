import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { UserRole } from '../../common/types/user-role.js';
import type { NewUser, User } from './entities/user.entity.js';
import type { UsersRepository } from './users.repository.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  const newUser: NewUser = {
    name: 'Ana',
    email: 'ana@gymflow.dev',
    passwordHash: 'hash',
    role: UserRole.Student,
  };
  const repository = {
    create: vi.fn<UsersRepository['create']>(),
    findById: vi.fn<UsersRepository['findById']>(),
    findAll: vi.fn<UsersRepository['findAll']>(),
  };
  // Só os métodos exercitados pelos testes são mockados.
  const service = new UsersService(repository as unknown as UsersRepository);

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('converte violação de e-mail único em 409', async () => {
    const driverError = Object.assign(new Error('duplicate key'), { code: '23505' });
    repository.create.mockRejectedValue(new QueryFailedError('INSERT', [], driverError));

    await expect(service.create(newUser)).rejects.toBeInstanceOf(ConflictException);
  });

  it('repassa outros erros de banco sem alterá-los', async () => {
    const failure = new Error('connection lost');
    repository.create.mockRejectedValue(failure);

    await expect(service.create(newUser)).rejects.toBe(failure);
  });

  it('lança 404 quando o usuário não existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findById('id-inexistente')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('retorna o usuário encontrado', async () => {
    const user = { id: 'u1', ...newUser } as User;
    repository.findById.mockResolvedValue(user);

    await expect(service.findById('u1')).resolves.toBe(user);
  });

  describe('findAll', () => {
    const admin = { id: 'a1', role: UserRole.Admin };
    const instructor = { id: 'i1', role: UserRole.Instructor };

    it('admin lista com o filtro pedido', async () => {
      repository.findAll.mockResolvedValue([]);

      await service.findAll(admin, UserRole.Instructor);

      expect(repository.findAll).toHaveBeenCalledWith(UserRole.Instructor);
    });

    it('admin sem filtro lista todos os papéis', async () => {
      repository.findAll.mockResolvedValue([]);

      await service.findAll(admin);

      expect(repository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('instrutor só recebe alunos, mesmo sem filtro', async () => {
      repository.findAll.mockResolvedValue([]);

      await service.findAll(instructor);

      expect(repository.findAll).toHaveBeenCalledWith(UserRole.Student);
    });

    it('lança 403 quando o instrutor pede outro papel', () => {
      expect(() => service.findAll(instructor, UserRole.Admin)).toThrow(ForbiddenException);
    });
  });
});
