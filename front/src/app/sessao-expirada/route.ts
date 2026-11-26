import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { clearSessionToken } from '@/lib/session/session-token';

/**
 * A API recusou o token (expirado ou inválido). Server Components não podem apagar cookies,
 * então o cliente HTTP redireciona para cá, que apaga e volta ao login.
 */
export async function GET(): Promise<never> {
  await clearSessionToken();
  redirect(ROUTES.login);
}
