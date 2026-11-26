import type { Request } from 'express';
import type { UserRole } from './user-role.js';

/** Usuário autenticado, extraído do token JWT. */
export type AuthUser = {
  id: string;
  role: UserRole;
};

/** Conteúdo assinado no token de acesso. */
export type JwtPayload = {
  sub: string;
  role: UserRole;
};

export type AuthenticatedRequest = Request & { user?: AuthUser };
