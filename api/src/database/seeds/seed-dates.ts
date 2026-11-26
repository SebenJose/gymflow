const MS_PER_DAY = 86_400_000;

/**
 * Offset fixo de São Paulo (sem horário de verão desde 2019), para montar os horários das aulas
 * no fuso da academia.
 */
const BUSINESS_UTC_OFFSET = '-03:00';

/** Soma dias a uma data `YYYY-MM-DD`. */
export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Date(date.getTime() + days * MS_PER_DAY).toISOString().slice(0, 10);
}

/** Horário `HH:mm` de um dia `YYYY-MM-DD`, no fuso da academia. */
export function atBusinessTime(isoDate: string, time: string): Date {
  return new Date(`${isoDate}T${time}:00${BUSINESS_UTC_OFFSET}`);
}
