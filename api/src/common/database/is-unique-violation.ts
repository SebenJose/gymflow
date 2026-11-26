import { QueryFailedError } from 'typeorm';

const POSTGRES_UNIQUE_VIOLATION = '23505';

/** Indica se o erro veio de uma constraint UNIQUE do Postgres. */
export function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }
  // O TypeORM tipa `driverError` como `any`; o erro do driver `pg` traz o SQLSTATE em `code`.
  const driverError: unknown = error.driverError;
  return (
    typeof driverError === 'object' &&
    driverError !== null &&
    'code' in driverError &&
    driverError.code === POSTGRES_UNIQUE_VIOLATION
  );
}
