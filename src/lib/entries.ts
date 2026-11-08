import { CATEGORIES, type CategoryId } from '@/config/categories';
import { addDays, dayKey, noonOn } from './periods';

export type Entry = {
  id: string;
  category: CategoryId;
  amountCents: number;
  occurredAt: string; // ISO timestamp
};

export function priceOf(category: CategoryId): number {
  const c = CATEGORIES.find((x) => x.id === category);
  if (!c) throw new Error(`Unknown category: ${category}`);
  return c.amountCents;
}

export function newEntry(category: CategoryId, occurredAt: Date): Entry {
  return {
    id: crypto.randomUUID(),
    category,
    amountCents: priceOf(category),
    occurredAt: occurredAt.toISOString(),
  };
}

export function sumCents(entries: Entry[]): number {
  return entries.reduce((total, e) => total + e.amountCents, 0);
}

export function totalsByCategory(entries: Entry[]) {
  return CATEGORIES.map((c) => {
    const mine = entries.filter((e) => e.category === c.id);
    return { ...c, cents: sumCents(mine), count: mine.length };
  });
}

/** Newest first, grouped by local day. */
export function groupByDay(entries: Entry[]): { key: string; entries: Entry[] }[] {
  const sorted = [...entries].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const groups: { key: string; entries: Entry[] }[] = [];
  for (const e of sorted) {
    const key = dayKey(new Date(e.occurredAt));
    const last = groups.at(-1);
    if (last?.key === key) last.entries.push(e);
    else groups.push({ key, entries: [e] });
  }
  return groups;
}

/**
 * Hard-coded sample data for M1 (replaced by the database in M3/M4).
 * Spread over the last ~6 weeks so every period shows something.
 */
export function sampleEntries(now: Date): Entry[] {
  const pattern: [number, CategoryId][] = [
    [0, 'breakfast'], [1, 'lunch'], [1, 'bike'], [2, 'breakfast'], [3, 'lunch'],
    [4, 'bike'], [4, 'breakfast'], [6, 'lunch'], [8, 'bike'], [9, 'breakfast'],
    [12, 'lunch'], [15, 'lunch'], [18, 'bike'], [22, 'breakfast'], [27, 'lunch'],
    [33, 'bike'], [40, 'lunch'],
  ];
  const today = dayKey(now);
  return pattern.map(([daysAgo, category], i) => {
    const noon = noonOn(addDays(today, -daysAgo));
    // Vary the time a little around noon; never later than a minute ago.
    const offsetMin = ((i * 37) % 300) - 150;
    const when = new Date(Math.min(noon.getTime() + offsetMin * 60_000, now.getTime() - 60_000));
    return { ...newEntry(category, when), id: `sample-${i}` };
  });
}
