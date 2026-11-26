import { createParamDecorator, type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest, AuthUser } from '../types/auth-user.type.js';

/** Injeta no handler o usuário autenticado pelo guard de JWT. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (user === undefined) {
      throw new UnauthorizedException('Autenticação necessária');
    }
    return user;
  },
);
