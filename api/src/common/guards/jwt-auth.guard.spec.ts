import { type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { JwtService } from '@nestjs/jwt';
import type { AuthenticatedRequest } from '../types/auth-user.type.js';
import { UserRole } from '../types/user-role.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

describe('JwtAuthGuard', () => {
  const reflector = { getAllAndOverride: vi.fn<() => boolean | undefined>() };
  const jwtService = { verifyAsync: vi.fn<(token: string) => Promise<object>>() };
  // Os mocks cobrem só os métodos usados pelo guard.
  const guard = new JwtAuthGuard(
    reflector as unknown as Reflector,
    jwtService as unknown as JwtService,
  );

  function contextFor(request: Partial<AuthenticatedRequest>): ExecutionContext {
    return {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  function requestWith(authorization?: string): Partial<AuthenticatedRequest> {
    return { headers: authorization === undefined ? {} : { authorization } };
  }

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('libera rotas marcadas com @Public() sem exigir token', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    await expect(guard.canActivate(contextFor(requestWith()))).resolves.toBe(true);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('lança 401 sem cabeçalho Authorization', async () => {
    await expect(guard.canActivate(contextFor(requestWith()))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('lança 401 quando o esquema não é Bearer', async () => {
    await expect(guard.canActivate(contextFor(requestWith('Basic abc')))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('lança 401 quando o token não é válido', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    await expect(
      guard.canActivate(contextFor(requestWith('Bearer expirado'))),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('lança 401 quando o payload não tem o formato esperado', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'u1', role: 'superuser' });

    await expect(guard.canActivate(contextFor(requestWith('Bearer token')))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('anexa o usuário do token à requisição', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'u1', role: UserRole.Admin, iat: 1 });
    const request = requestWith('Bearer valido');

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valido');
    expect(request.user).toEqual({ id: 'u1', role: UserRole.Admin });
  });
});
