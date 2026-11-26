import 'server-only';

const DEFAULT_API_URL = 'http://localhost:3333/api';

/** Trata variável definida mas vazia (`API_URL=` no .env) como ausente. */
function envValue(value: string | undefined): string | undefined {
  return value === undefined || value.trim() === '' ? undefined : value;
}

/**
 * As chamadas à API saem do servidor do Next. `API_URL` permite um endereço interno
 * (ex.: `http://api:3333/api` na rede do docker); sem ela, vale o endereço público.
 */
export const API_BASE_URL =
  envValue(process.env.API_URL) ?? envValue(process.env.NEXT_PUBLIC_API_URL) ?? DEFAULT_API_URL;
