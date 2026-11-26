import 'server-only';
import { redirect } from 'next/navigation';
import type { z } from 'zod';
import { ROUTES } from '../routes';
import { getSessionToken } from '../session/session-token';
import { API_BASE_URL } from './api-config';
import { errorEnvelopeSchema, successEnvelopeSchema } from './api-envelope';
import { ApiError } from './api-error';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type RequestOptions<T extends z.ZodType> = {
  schema: T;
  method?: HttpMethod;
  body?: unknown;
  /** Envia o token da sessão. Desligue nas rotas públicas (login e cadastro). */
  authenticated?: boolean;
};

const HTTP_NO_CONTENT = 204;
const HTTP_UNAUTHORIZED = 401;
const HTTP_SERVICE_UNAVAILABLE = 503;
const UNREACHABLE_MESSAGE = 'Não foi possível conectar ao servidor. Tente novamente em instantes.';
const UNEXPECTED_MESSAGE = 'Ocorreu um erro inesperado. Tente novamente.';

/**
 * Único ponto de acesso HTTP à API: monta a URL, envia o token, valida a resposta com o schema
 * e converte erros em `ApiError`. Token rejeitado (401) encerra a sessão.
 */
export async function apiRequest<T extends z.ZodType>(
  path: string,
  { schema, method = 'GET', body, authenticated = true }: RequestOptions<T>,
): Promise<z.infer<T>> {
  const token = authenticated ? await getSessionToken() : undefined;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token !== undefined) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      cache: 'no-store',
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
  } catch {
    throw new ApiError(HTTP_SERVICE_UNAVAILABLE, UNREACHABLE_MESSAGE);
  }

  if (response.status === HTTP_UNAUTHORIZED && token !== undefined) {
    redirect(ROUTES.sessionExpired);
  }
  if (response.status === HTTP_NO_CONTENT) {
    return schema.parse(null);
  }
  const payload = await readJson(response);
  if (!response.ok) {
    throw toApiError(response.status, payload);
  }
  return schema.parse(successEnvelopeSchema.parse(payload).data);
}

async function readJson(response: Response): Promise<unknown> {
  try {
    const payload: unknown = await response.json();
    return payload;
  } catch {
    return null;
  }
}

function toApiError(status: number, payload: unknown): ApiError {
  const parsed = errorEnvelopeSchema.safeParse(payload);
  if (!parsed.success) {
    return new ApiError(status, UNEXPECTED_MESSAGE);
  }
  return new ApiError(status, parsed.data.error.message, parsed.data.error.details ?? []);
}
