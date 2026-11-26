'use server';

import { redirect } from 'next/navigation';
import { type ActionResult, invalidInput, toActionFailure } from '@/lib/actions/action-result';
import { ROUTES } from '@/lib/routes';
import { clearSessionToken, setSessionToken } from '@/lib/session/session-token';
import { loginSchema } from '../schemas/login-schema';
import { registerSchema } from '../schemas/register-schema';
import { login, register } from './auth-api';

// A entrada vem do cliente: é validada de novo aqui, com o mesmo schema do formulário.

export async function loginAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return invalidInput;
  }
  let token: string;
  try {
    token = (await login(parsed.data)).accessToken;
  } catch (error) {
    return toActionFailure(error);
  }
  await setSessionToken(token);
  redirect(ROUTES.home);
}

export async function registerAction(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return invalidInput;
  }
  let token: string;
  try {
    token = (await register(parsed.data)).accessToken;
  } catch (error) {
    return toActionFailure(error);
  }
  await setSessionToken(token);
  redirect(ROUTES.home);
}

export async function logoutAction(): Promise<void> {
  await clearSessionToken();
  redirect(ROUTES.login);
}
