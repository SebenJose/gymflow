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

const MS_PER_DAY = 86_400_000;

/** Soma dias a uma data `YYYY-MM-DD`. */
export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Date(date.getTime() + days * MS_PER_DAY).toISOString().slice(0, 10);
}

const dayLabelFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC',
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
});

/** Ex.: "quarta-feira, 25/11" para um dia `YYYY-MM-DD` (sem fuso: o dia já é o da academia). */
export function formatDayLabel(isoDate: string): string {
  return dayLabelFormatter.format(new Date(`${isoDate}T12:00:00Z`));
}

/** Offset fixo de São Paulo (sem horário de verão desde 2019). */
const BUSINESS_UTC_OFFSET = '-03:00';

/** Dia `YYYY-MM-DD` + hora `HH:mm` no fuso da academia → ISO com offset, como a API exige. */
export function toBusinessDateTime(isoDate: string, time: string): string {
  return `${isoDate}T${time}:00${BUSINESS_UTC_OFFSET}`;
}
