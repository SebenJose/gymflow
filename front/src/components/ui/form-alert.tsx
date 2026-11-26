import { CircleAlert } from 'lucide-react';

type FormAlertProps = { message: string | undefined };

/** Erro geral do formulário (ex.: resposta da API). Não renderiza nada sem mensagem. */
export function FormAlert({ message }: FormAlertProps) {
  if (message === undefined) {
    return null;
  }
  return (
    <p
      role="alert"
      className="flex items-center gap-2 rounded-md border border-danger/40 px-3 py-2 text-sm text-danger"
    >
      <CircleAlert className="size-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}
