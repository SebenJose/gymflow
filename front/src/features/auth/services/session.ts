import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { ROUTES } from '@/lib/routes';
import { getSessionToken } from '@/lib/session/session-token';
import type { SessionUser, UserRole } from '../schemas/session-user-schema';
import { fetchCurrentUser } from './auth-api';

/**
 * Usuário da sessão, consultado na API uma vez por requisição. Token inválido redireciona
 * para o encerramento da sessão (feito pelo cliente HTTP).
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if ((await getSessionToken()) === undefined) {
    return null;
  }
  return fetchCurrentUser();
});

/**
 * Exige sessão e, se informado, um dos papéis. A autorização de verdade é da API;
 * aqui só se evita mostrar uma tela que a API recusaria.
 */
export async function requireUser(roles?: readonly UserRole[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (user === null) {
    redirect(ROUTES.login);
  }
  if (roles !== undefined && !roles.includes(user.role)) {
    redirect(ROUTES.home);
  }
  return user;
}
