/**
 * Calendar math in the app's fixed time zone. We compare local calendar
 * days as "YYYY-MM-DD" keys, which sidesteps DST: a day is a day no matter
 * whether it has 23, 24 or 25 hours.
 */
export const TIME_ZONE = 'America/New_York';

export type Period = 'week' | 'last30' | 'all';

export const PERIODS: { id: Period; label: string }[] = [
  { id: 'week', label: 'This week' },
  { id: 'last30', label: 'Last 30 days' },
  { id: 'all', label: 'All time' },
];

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function zonedParts(date: Date) {
  const p: Record<string, string> = {};
  for (const { type, value } of partsFormatter.formatToParts(date)) p[type] = value;
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    second: Number(p.second),
  };
}

/** Local calendar day of an instant, e.g. "2026-11-08". */
export function dayKey(date: Date): string {
  const { year, month, day } = zonedParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function keyToUtcMidnight(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function utcMidnightToKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Shift a day key by whole calendar days. */
export function addDays(key: string, days: number): string {
  return utcMidnightToKey(keyToUtcMidnight(key) + days * 86_400_000);
}

/** 1 = Monday … 7 = Sunday for a day key. */
export function isoWeekday(key: string): number {
  const dow = new Date(keyToUtcMidnight(key)).getUTCDay(); // 0 = Sunday
  return dow === 0 ? 7 : dow;
}

/** First day key included in a period, or null for "all time". */
export function periodStartKey(period: Period, now: Date): string | null {
  const today = dayKey(now);
  if (period === 'week') return addDays(today, -(isoWeekday(today) - 1));
  if (period === 'last30') return addDays(today, -29);
  return null;
}

export function isInPeriod(occurredAt: Date, period: Period, now: Date): boolean {
  const start = periodStartKey(period, now);
  const key = dayKey(occurredAt);
  return key <= dayKey(now) && (start === null || key >= start);
}

/** The instant of 12:00 local time on a day key (used for backdated entries). */
export function noonOn(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  const guess = Date.UTC(y, m - 1, d, 12);
  const p = zonedParts(new Date(guess));
  const asIfUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const offset = asIfUtc - guess; // local minus UTC, e.g. -5h in winter
  return new Date(guess - offset);
}

/** "Today", "Yesterday", or e.g. "Mon, Nov 3". */
export function dayLabel(key: string, now: Date): string {
  const today = dayKey(now);
  if (key === today) return 'Today';
  if (key === addDays(today, -1)) return 'Yesterday';
  return new Date(keyToUtcMidnight(key)).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Local clock time of an instant, e.g. "8:05 AM". */
export function timeLabel(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    timeZone: TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
  });
}
