import { BUSINESS_TIME_ZONE, formatDateInTimeZone } from './clock.js';

describe('formatDateInTimeZone', () => {
  it('usa a data local da academia, não a de UTC', () => {
    // 01h UTC do dia 2 ainda é noite do dia 1 em São Paulo (UTC-3).
    const instant = new Date('2026-03-02T01:00:00Z');

    expect(formatDateInTimeZone(instant, BUSINESS_TIME_ZONE)).toBe('2026-03-01');
    expect(formatDateInTimeZone(instant, 'UTC')).toBe('2026-03-02');
  });
});
