import { QueryFailedError } from 'typeorm';

const POSTGRES_UNIQUE_VIOLATION = '23505';
const POSTGRES_FOREIGN_KEY_VIOLATION = '23503';
const POSTGRES_CHECK_VIOLATION = '23514';

/** Indica se o erro veio de uma constraint UNIQUE do Postgres. */
export function isUniqueViolation(error: unknown): boolean {
  return hasPostgresCode(error, POSTGRES_UNIQUE_VIOLATION);
}

/** Indica se o erro veio de uma FOREIGN KEY do Postgres (ex.: remover registro ainda referenciado). */
export function isForeignKeyViolation(error: unknown): boolean {
  return hasPostgresCode(error, POSTGRES_FOREIGN_KEY_VIOLATION);
}

/** Indica se o erro veio de uma constraint CHECK do Postgres. */
export function isCheckViolation(error: unknown): boolean {
  return hasPostgresCode(error, POSTGRES_CHECK_VIOLATION);
}

function hasPostgresCode(error: unknown, code: string): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }
  // O TypeORM tipa `driverError` como `any`; o erro do driver `pg` traz o SQLSTATE em `code`.
  const driverError: unknown = error.driverError;
  return (
    typeof driverError === 'object' &&
    driverError !== null &&
    'code' in driverError &&
    driverError.code === code
  );
}
