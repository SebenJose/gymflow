import { addDays, atBusinessTime } from './seed-dates.js';

describe('seed-dates', () => {
  it('addDays atravessa meses e anos nos dois sentidos', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('atBusinessTime monta o horário no fuso de São Paulo', () => {
    expect(atBusinessTime('2026-03-10', '18:30').toISOString()).toBe('2026-03-10T21:30:00.000Z');
  });
});
