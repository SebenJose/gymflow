import { UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../common/types/user-role.js';
import type { User } from '../users/entities/user.entity.js';
import type { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import type { PasswordHasher } from './password-hasher.js';

describe('AuthService', () => {
  const storedUser = {
    id: 'u1',
    name: 'Ana',
    email: 'ana@gymflow.dev',
    passwordHash: 'hashed-password',
    role: UserRole.Student,
    createdAt: new Date('2026-01-01'),
  } as User;

  const usersService = {
    create: vi.fn<UsersService['create']>(),
    findByEmailWithPassword: vi.fn<UsersService['findByEmailWithPassword']>(),
  };
  const passwordHasher = {
    hash: vi.fn<PasswordHasher['hash']>(),
    compare: vi.fn<PasswordHasher['compare']>(),
  };
  const jwtService = { signAsync: vi.fn<(payload: object) => Promise<string>>() };

  // Os mocks cobrem só os métodos que o AuthService chama.
  const service = new AuthService(
    usersService as unknown as UsersService,
    passwordHasher,
    jwtService as unknown as JwtService,
  );

  beforeEach(() => {
    vi.resetAllMocks();
    jwtService.signAsync.mockResolvedValue('signed-token');
  });

  describe('register', () => {
    it('cria um aluno com a senha em hash e o e-mail normalizado', async () => {
      passwordHasher.hash.mockResolvedValue('hashed-password');
      usersService.create.mockResolvedValue(storedUser);

      const result = await service.register({
        name: '  Ana ',
        email: ' Ana@GymFlow.dev ',
        password: 'senha-forte',
      });

      expect(passwordHasher.hash).toHaveBeenCalledWith('senha-forte');
      expect(usersService.create).toHaveBeenCalledWith({
        name: 'Ana',
        email: 'ana@gymflow.dev',
        passwordHash: 'hashed-password',
        role: UserRole.Student,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 'u1', role: UserRole.Student });
      expect(result.accessToken).toBe('signed-token');
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('login', () => {
    it('retorna token quando e-mail e senha conferem', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(storedUser);
      passwordHasher.compare.mockResolvedValue(true);

      const result = await service.login({ email: 'ANA@gymflow.dev', password: 'senha-forte' });

      expect(usersService.findByEmailWithPassword).toHaveBeenCalledWith('ana@gymflow.dev');
      expect(passwordHasher.compare).toHaveBeenCalledWith('senha-forte', 'hashed-password');
      expect(result.accessToken).toBe('signed-token');
    });

    it('lança 401 quando o e-mail não existe', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ninguem@gymflow.dev', password: 'qualquer' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(passwordHasher.compare).not.toHaveBeenCalled();
    });

    it('lança 401 quando a senha está errada', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(storedUser);
      passwordHasher.compare.mockResolvedValue(false);

      await expect(
        service.login({ email: 'ana@gymflow.dev', password: 'errada' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
