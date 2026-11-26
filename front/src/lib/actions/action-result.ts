import { ApiError } from '../api/api-error';

/** Resultado de uma Server Action que não terminou em redirecionamento. */
export type ActionResult = { ok: true } | { ok: false; message: string };

const INVALID_INPUT_MESSAGE = 'Confira os campos do formulário.';

export const invalidInput: ActionResult = { ok: false, message: INVALID_INPUT_MESSAGE };

/**
 * Converte erro da API em resultado para o formulário. Qualquer outro erro é relançado,
 * inclusive os de controle do Next (`redirect`), que não podem ser engolidos.
 */
export function toActionFailure(error: unknown): ActionResult {
  if (error instanceof ApiError) {
    return { ok: false, message: error.message };
  }
  throw error;
}
