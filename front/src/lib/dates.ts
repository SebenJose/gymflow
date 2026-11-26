/** Mesmo fuso que a API usa para decidir "que dia é hoje" (vencimentos, aulas). */
export const BUSINESS_TIME_ZONE = 'America/Sao_Paulo';

/** Hoje no fuso da academia, em `YYYY-MM-DD` (o locale `en-CA` já formata assim). */
export function businessToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
