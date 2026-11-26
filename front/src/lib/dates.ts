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

const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: BUSINESS_TIME_ZONE,
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: BUSINESS_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
});

/** Ex.: "quinta-feira, 27/11", no fuso da academia. */
export function formatWeekday(isoDateTime: string): string {
  return weekdayFormatter.format(new Date(isoDateTime));
}

/** Ex.: "18:30", no fuso da academia. */
export function formatTime(isoDateTime: string): string {
  return timeFormatter.format(new Date(isoDateTime));
}

/** Dia (`YYYY-MM-DD`) de um instante, no fuso da academia. */
export function businessDayOf(isoDateTime: string): string {
  return businessToday(new Date(isoDateTime));
}
