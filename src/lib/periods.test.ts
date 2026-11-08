import { describe, expect, it } from 'vitest';
import { addDays, dayKey, dayLabel, isInPeriod, isoWeekday, noonOn, periodStartKey, startOfDay } from './periods';

// Instants given in UTC; New York is UTC-5 in winter (EST), UTC-4 in summer (EDT).
const at = (iso: string) => new Date(iso);

describe('dayKey', () => {
  it('uses New York local date, not UTC', () => {
    // 2026-11-09 03:00 UTC = 2026-11-08 22:00 EST
    expect(dayKey(at('2026-11-09T03:00:00Z'))).toBe('2026-11-08');
    expect(dayKey(at('2026-11-09T05:00:00Z'))).toBe('2026-11-09');
  });
});

describe('addDays / isoWeekday', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('numbers Monday as 1 and Sunday as 7', () => {
    expect(isoWeekday('2026-11-09')).toBe(1); // Monday
    expect(isoWeekday('2026-11-08')).toBe(7); // Sunday
  });
});

describe('week boundary', () => {
  // Sunday 2026-11-08 23:59 EST = 2026-11-09T04:59Z; Monday 00:00 EST = 05:00Z
  const sundayLate = at('2026-11-09T04:59:00Z');
  const mondayStart = at('2026-11-09T05:00:00Z');

  it('Sunday 23:59 belongs to the week that started the previous Monday', () => {
    expect(periodStartKey('week', sundayLate)).toBe('2026-11-02');
  });
  it('Monday 00:00 starts a new week', () => {
    expect(periodStartKey('week', mondayStart)).toBe('2026-11-09');
    expect(isInPeriod(sundayLate, 'week', mondayStart)).toBe(false);
  });
});

describe('last 30 days', () => {
  const now = at('2026-11-08T17:00:00Z');
  it('is today plus the 29 days before', () => {
    expect(periodStartKey('last30', now)).toBe('2026-10-10');
    expect(isInPeriod(at('2026-10-10T16:00:00Z'), 'last30', now)).toBe(true);
    expect(isInPeriod(at('2026-10-09T16:00:00Z'), 'last30', now)).toBe(false);
  });
  it('excludes future days and includes everything for all time', () => {
    expect(isInPeriod(at('2026-11-10T16:00:00Z'), 'all', now)).toBe(false);
    expect(isInPeriod(at('2020-01-01T16:00:00Z'), 'all', now)).toBe(true);
  });
});

describe('DST change days', () => {
  it('fall back (2026-11-01, 25 hours) is still one day', () => {
    expect(dayKey(at('2026-11-01T04:30:00Z'))).toBe('2026-11-01'); // 00:30 EDT
    expect(dayKey(at('2026-11-02T04:30:00Z'))).toBe('2026-11-01'); // 23:30 EST
  });
  it('spring forward (2026-03-08, 23 hours) is still one day', () => {
    expect(dayKey(at('2026-03-08T05:30:00Z'))).toBe('2026-03-08'); // 00:30 EST
    expect(dayKey(at('2026-03-09T03:30:00Z'))).toBe('2026-03-08'); // 23:30 EDT
  });
});

describe('noonOn', () => {
  it('returns 12:00 New York time in winter and summer', () => {
    expect(noonOn('2026-01-15').toISOString()).toBe('2026-01-15T17:00:00.000Z');
    expect(noonOn('2026-07-15').toISOString()).toBe('2026-07-15T16:00:00.000Z');
  });
});

describe('startOfDay', () => {
  it('is local midnight, including on both DST change days', () => {
    expect(startOfDay('2026-11-08').toISOString()).toBe('2026-11-08T05:00:00.000Z'); // EST
    expect(startOfDay('2026-07-15').toISOString()).toBe('2026-07-15T04:00:00.000Z'); // EDT
    expect(startOfDay('2026-11-01').toISOString()).toBe('2026-11-01T04:00:00.000Z'); // fall back later that night
    expect(startOfDay('2026-11-02').toISOString()).toBe('2026-11-02T05:00:00.000Z');
    expect(startOfDay('2026-03-08').toISOString()).toBe('2026-03-08T05:00:00.000Z'); // spring forward later
    expect(startOfDay('2026-03-09').toISOString()).toBe('2026-03-09T04:00:00.000Z');
  });
});

describe('dayLabel', () => {
  const now = at('2026-11-08T17:00:00Z');
  it('names today and yesterday, dates otherwise', () => {
    expect(dayLabel('2026-11-08', now)).toBe('Today');
    expect(dayLabel('2026-11-07', now)).toBe('Yesterday');
    expect(dayLabel('2026-11-03', now)).toBe('Tue, Nov 3');
  });
});
