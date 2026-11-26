/** Erro devolvido pela API no formato padronizado, com a mensagem já pronta para o usuário. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details: readonly string[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
