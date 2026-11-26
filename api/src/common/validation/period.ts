import { BadRequestException } from '@nestjs/common';

const INVALID_RANGE = 'A data inicial não pode ser depois da data final';

/** Período em dias `YYYY-MM-DD`; a comparação de texto vale porque o formato é fixo. */
export type DatePeriod = { from?: string; to?: string };

/** Lança 400 quando o período está invertido. */
export function assertValidPeriod({ from, to }: DatePeriod): void {
  if (from !== undefined && to !== undefined && from > to) {
    throw new BadRequestException(INVALID_RANGE);
  }
}
