import type { TransformFnParams } from 'class-transformer';

/**
 * Converte "true"/"false" da query string em boolean. Sem isso, `Boolean("false")` daria `true`.
 * Outros valores passam adiante para o `@IsBoolean()` rejeitar.
 */
export function toBoolean({ value }: TransformFnParams): unknown {
  const raw: unknown = value;
  if (raw === 'true') {
    return true;
  }
  if (raw === 'false') {
    return false;
  }
  return raw;
}
