import { type ExecutionContext, ForbiddenException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { AuthUser } from '../types/auth-user.type.js';
import { UserRole } from '../types/user-role.js';
import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: vi.fn<() => UserRole[] | undefined>() };
  // O mock cobre só o método usado pelo guard.
  const guard = new RolesGuard(reflector as unknown as Reflector);

  function contextFor(user?: AuthUser): ExecutionContext {
    return {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('libera rotas sem @Roles()', () => {
    expect(guard.canActivate(contextFor({ id: 'u1', role: UserRole.Student }))).toBe(true);
  });

  it('libera quando o papel do usuário está entre os exigidos', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.Instructor, UserRole.Admin]);

    expect(guard.canActivate(contextFor({ id: 'u1', role: UserRole.Admin }))).toBe(true);
  });

  it('lança 403 quando o papel do usuário não é permitido', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.Admin]);

    expect(() => guard.canActivate(contextFor({ id: 'u1', role: UserRole.Student }))).toThrow(
      ForbiddenException,
    );
  });
});
