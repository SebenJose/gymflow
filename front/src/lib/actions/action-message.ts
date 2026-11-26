import type { ActionResult } from './action-result';

/** Mensagem de erro de uma action, ou `undefined` se deu certo (formato do `ConfirmButton`). */
export async function errorMessageOf(action: Promise<ActionResult>): Promise<string | undefined> {
  const result = await action;
  return result.ok ? undefined : result.message;
}
