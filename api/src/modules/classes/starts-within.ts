import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { BUSINESS_TIME_ZONE } from '../../common/clock/clock.js';
import type { DatePeriod } from '../../common/validation/period.js';

/** Filtra aulas pelo dia de início no fuso da academia (não no do servidor nem em UTC). */
export function whereStartsWithin<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  classAlias: string,
  { from, to }: DatePeriod,
): SelectQueryBuilder<T> {
  const startDay = `(${classAlias}.startsAt AT TIME ZONE :timeZone)::date`;
  query.setParameter('timeZone', BUSINESS_TIME_ZONE);
  if (from !== undefined) {
    query.andWhere(`${startDay} >= :from`, { from });
  }
  if (to !== undefined) {
    query.andWhere(`${startDay} <= :to`, { to });
  }
  return query;
}
