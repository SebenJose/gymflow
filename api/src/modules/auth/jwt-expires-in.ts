import type { JwtSignOptions } from '@nestjs/jwt';

type ExpiresIn = NonNullable<JwtSignOptions['expiresIn']>;

// Formatos aceitos pelo `jsonwebtoken`: segundos ("3600") ou número + unidade ("1d", "12h", "30 m").
const EXPIRES_IN_PATTERN = /^\d+(\s?(ms|s|m|h|d|w|y))?$/i;

/** Valida o `JWT_EXPIRES_IN` vindo do ambiente e o converte para o tipo esperado pelo JWT. */
export function parseExpiresIn(value: string): ExpiresIn {
  if (!isExpiresIn(value)) {
    throw new Error(
      `JWT_EXPIRES_IN inválido: "${value}". Use, por exemplo, "3600", "12h" ou "1d".`,
    );
  }
  return /^\d+$/.test(value) ? Number(value) : value;
}

function isExpiresIn(value: string): value is Extract<ExpiresIn, string> {
  return EXPIRES_IN_PATTERN.test(value);
}
