import { addMonths, buildBillingSchedule } from './billing-schedule.js';

describe('addMonths', () => {
  it.each([
    ['2026-01-15', 1, '2026-02-15'],
    ['2026-01-31', 1, '2026-02-28'],
    ['2028-01-31', 1, '2028-02-29'],
    ['2026-11-30', 3, '2027-02-28'],
    ['2026-05-10', 12, '2027-05-10'],
    ['2026-05-10', 0, '2026-05-10'],
  ])('%s + %i mês(es) = %s', (date, months, expected) => {
    expect(addMonths(date, months)).toBe(expected);
  });

  it('rejeita data fora do formato YYYY-MM-DD', () => {
    expect(() => addMonths('10/05/2026', 1)).toThrow('Data inválida');
  });
});

describe('buildBillingSchedule', () => {
  it('gera um vencimento por mês e a vigência do plano', () => {
    expect(buildBillingSchedule('2026-01-31', 3)).toEqual({
      startDate: '2026-01-31',
      endDate: '2026-04-30',
      dueDates: ['2026-01-31', '2026-02-28', '2026-03-31'],
    });
  });
});
