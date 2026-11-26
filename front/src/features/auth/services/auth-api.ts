import 'server-only';
import { z } from 'zod';
import { apiRequest } from '@/lib/api/api-client';
import type { LoginInput } from '../schemas/login-schema';
import type { RegisterInput } from '../schemas/register-schema';
import {
  authResponseSchema,
  sessionUserSchema,
  type SessionUser,
} from '../schemas/session-user-schema';

type AuthResponse = z.infer<typeof authResponseSchema>;

export function login(input: LoginInput): Promise<AuthResponse> {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: input,
    schema: authResponseSchema,
    authenticated: false,
  });
}

export function register({ name, email, password }: RegisterInput): Promise<AuthResponse> {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: { name, email, password },
    schema: authResponseSchema,
    authenticated: false,
  });
}

export function fetchCurrentUser(): Promise<SessionUser> {
  return apiRequest('/users/me', { schema: sessionUserSchema });
}
