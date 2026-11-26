import { Injectable } from '@nestjs/common';

/** Fuso usado para decidir "que dia é hoje" nas regras de negócio (vencimentos, início de matrícula). */
export const BUSINESS_TIME_ZONE = 'America/Sao_Paulo';

/** Abstração do relógio, para as regras que dependem da data serem testáveis. */
export abstract class Clock {
  abstract now(): Date;
  /** Data de hoje no fuso da academia, no formato `YYYY-MM-DD`. */
  abstract today(): string;
}

@Injectable()
export class SystemClock extends Clock {
  now(): Date {
    return new Date();
  }

  today(): string {
    return formatDateInTimeZone(this.now(), BUSINESS_TIME_ZONE);
  }
}

/** O locale `en-CA` formata a data como `YYYY-MM-DD`. */
export function formatDateInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
