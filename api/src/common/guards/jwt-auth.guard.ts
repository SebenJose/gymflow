import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import type { AuthenticatedRequest, AuthUser, JwtPayload } from '../types/auth-user.type.js';
import { isUserRole } from '../types/user-role.js';

const BEARER_PREFIX = 'Bearer ';

/** Exige um token JWT válido em toda rota que não for marcada com `@Public()`. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;
    if (header === undefined || !header.startsWith(BEARER_PREFIX)) {
      throw new UnauthorizedException('Token de acesso ausente');
    }

    request.user = await this.verify(header.slice(BEARER_PREFIX.length));
    return true;
  }

  private async verify(token: string): Promise<AuthUser> {
    let payload: unknown;
    try {
      payload = await this.jwtService.verifyAsync<object>(token);
    } catch {
      throw new UnauthorizedException('Token de acesso inválido ou expirado');
    }

    if (!isJwtPayload(payload)) {
      throw new UnauthorizedException('Token de acesso inválido ou expirado');
    }
    return { id: payload.sub, role: payload.role };
  }
}

function isJwtPayload(value: unknown): value is JwtPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'sub' in value &&
    typeof value.sub === 'string' &&
    'role' in value &&
    isUserRole(value.role)
  );
}
