export type BillingSchedule = {
  startDate: string;
  endDate: string;
  dueDates: string[];
};

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Calcula a vigência e os vencimentos mensais de uma matrícula.
 * O primeiro vencimento é no dia da contratação; os demais, no mesmo dia dos meses seguintes
 * (ou no último dia do mês, quando ele for mais curto — ex.: 31/01 → 28/02).
 */
export function buildBillingSchedule(startDate: string, durationMonths: number): BillingSchedule {
  const dueDates = Array.from({ length: durationMonths }, (_, index) =>
    addMonths(startDate, index),
  );
  return { startDate, endDate: addMonths(startDate, durationMonths), dueDates };
}

/** Soma meses a uma data `YYYY-MM-DD`, limitando o dia ao fim do mês de destino. */
export function addMonths(isoDate: string, months: number): string {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (match === null) {
    throw new Error(`Data inválida: "${isoDate}"`);
  }
  const [, year, month, day] = match.map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Data inválida: "${isoDate}"`);
  }

  const targetMonthIndex = month - 1 + months;
  const lastDayOfTarget = new Date(Date.UTC(year, targetMonthIndex + 1, 0)).getUTCDate();
  const target = new Date(Date.UTC(year, targetMonthIndex, Math.min(day, lastDayOfTarget)));
  return target.toISOString().slice(0, 10);
}
