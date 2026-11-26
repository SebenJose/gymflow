import { z } from 'zod';

// Mesmos limites do `RegisterDto` da API.
const NAME_MAX_LENGTH = 120;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Informe seu nome')
      .max(NAME_MAX_LENGTH, `O nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres`),
    email: z.email('Informe um e-mail válido').trim(),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`)
      .max(PASSWORD_MAX_LENGTH, `A senha deve ter no máximo ${PASSWORD_MAX_LENGTH} caracteres`),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'As senhas não conferem',
    path: ['passwordConfirmation'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
