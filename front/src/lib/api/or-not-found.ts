import 'server-only';
import { notFound } from 'next/navigation';
import { ApiError } from './api-error';

const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;

/** Para páginas de detalhe: recurso inexistente (ou id inválido na URL) mostra a página 404. */
export async function orNotFound<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === HTTP_NOT_FOUND || error.status === HTTP_BAD_REQUEST)
    ) {
      notFound();
    }
    throw error;
  }
}
