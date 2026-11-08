import { CATEGORIES, OTHER, categoryLabel, type CategoryId, type FixedCategoryId } from '@/config/categories';
import { parseDollars } from './money';
import { dayKey } from './periods';

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

/**
 * Fresh server data replaces the local copy, except entries still being
 * saved (not on the server yet), which are kept so they don't flicker away.
 */
export function mergeServerEntries(server: Entry[], local: Entry[], pendingIds: Set<string>): Entry[] {
  const onServer = new Set(server.map((e) => e.id));
  const stillSaving = local.filter((e) => pendingIds.has(e.id) && !onServer.has(e.id));
  return [...server, ...stillSaving];
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
