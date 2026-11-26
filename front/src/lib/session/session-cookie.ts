/** Cookie httpOnly com o token de acesso da API. Lido pelo proxy e pelo cliente HTTP. */
export const SESSION_COOKIE = 'gymflow_session';

/** Igual ao `JWT_EXPIRES_IN` padrão da API (1 dia); se o token vencer antes, a API responde 401. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;
