import { z } from 'zod';

export const userRoleSchema = z.enum(['student', 'instructor', 'admin']);

export type UserRole = z.infer<typeof userRoleSchema>;

/** Usuário como a API devolve em `/users/me` e no login. */
export const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: userRoleSchema,
});

export type SessionUser = z.infer<typeof sessionUserSchema>;

export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: sessionUserSchema,
});

export const ROLE_LABELS: Record<UserRole, string> = {
  student: 'Aluno',
  instructor: 'Instrutor',
  admin: 'Administrador',
};
