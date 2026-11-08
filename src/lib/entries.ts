import { CATEGORIES, OTHER, categoryLabel, type CategoryId, type FixedCategoryId } from '@/config/categories';
import { parseDollars } from './money';
import { addDays, dayKey, noonOn } from './periods';

export type Entry = {
  id: string;
  category: CategoryId;
  amountCents: number;
  occurredAt: string; // ISO timestamp
  label?: string; // only for "other": what the user typed
};

export function priceOf(category: FixedCategoryId): number {
  const c = CATEGORIES.find((x) => x.id === category);
  if (!c) throw new Error(`Unknown category: ${category}`);
  return c.amountCents;
}

export function newEntry(category: FixedCategoryId, occurredAt: Date): Entry {
  return {
    id: crypto.randomUUID(),
    category,
    amountCents: priceOf(category),
    occurredAt: occurredAt.toISOString(),
  };
}

export type OtherInput = { label: string; amount: string };

/** Validate a typed "Other" entry. Returns cents + clean label, or an error message. */
export function validateOther(input: OtherInput): { label: string; cents: number } | { error: string } {
  const label = input.label.trim().replace(/\s+/g, ' ');
  if (!label) return { error: 'Type what you skipped.' };
  if (label.length > OTHER.maxLabelLength) return { error: `Keep the name under ${OTHER.maxLabelLength} characters.` };
  const cents = parseDollars(input.amount);
  if (cents === null) return { error: 'Enter an amount like 4 or 4.50.' };
  if (cents > OTHER.maxCents) return { error: 'Amount must be $1,000 or less.' };
  return { label, cents };
}

export function newOtherEntry(label: string, cents: number, occurredAt: Date): Entry {
  return {
    id: crypto.randomUUID(),
    category: OTHER.id,
    amountCents: cents,
    occurredAt: occurredAt.toISOString(),
    label,
  };
}

/** Display name: the typed name for "Other", the category label otherwise. */
export function entryLabel(e: Entry): string {
  return e.category === OTHER.id && e.label ? e.label : categoryLabel(e.category);
}

export function sumCents(entries: Entry[]): number {
  return entries.reduce((total, e) => total + e.amountCents, 0);
}

export function totalsByCategory(entries: Entry[]) {
  const rows = [...CATEGORIES, OTHER].map((c) => {
    const mine = entries.filter((e) => e.category === c.id);
    return { id: c.id as CategoryId, label: c.label, cents: sumCents(mine), count: mine.length };
  });
  // Hide "Other" when nothing was logged under it.
  return rows.filter((r) => r.id !== OTHER.id || r.count > 0);
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
  const pattern: [number, FixedCategoryId][] = [
    [0, 'breakfast'], [1, 'lunch'], [1, 'bike'], [1, 'bike'], [2, 'breakfast'], [3, 'lunch'],
    [4, 'bike'], [4, 'breakfast'], [6, 'lunch'], [8, 'bike'], [9, 'breakfast'],
    [12, 'lunch'], [15, 'lunch'], [18, 'bike'], [22, 'breakfast'], [27, 'lunch'],
    [33, 'bike'], [40, 'lunch'],
  ];
  const today = dayKey(now);
  const clamp = (d: Date) => new Date(Math.min(d.getTime(), now.getTime() - 60_000));
  const fixed = pattern.map(([daysAgo, category], i) => {
    const noon = noonOn(addDays(today, -daysAgo));
    // Vary the time a little around noon; never later than a minute ago.
    const offsetMin = ((i * 37) % 300) - 150;
    return { ...newEntry(category, clamp(new Date(noon.getTime() + offsetMin * 60_000))), id: `sample-${i}` };
  });
  const other = [
    { ...newOtherEntry('Coffee', 450, clamp(noonOn(addDays(today, -2)))), id: 'sample-o1' },
    { ...newOtherEntry('Movie ticket', 1800, clamp(noonOn(addDays(today, -11)))), id: 'sample-o2' },
  ];
  return [...fixed, ...other];
}
