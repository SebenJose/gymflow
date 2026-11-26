const CENTS_PER_UNIT = 100;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Valores da API vêm em centavos. */
export function formatCurrency(cents: number): string {
  return currencyFormatter.format(cents / CENTS_PER_UNIT);
}

/** `YYYY-MM-DD` → `DD/MM/AAAA`, sem passar por `Date` (que deslocaria o dia pelo fuso). */
export function formatIsoDate(isoDate: string): string {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  return match === null ? isoDate : `${match[3]}/${match[2]}/${match[1]}`;
}

export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
