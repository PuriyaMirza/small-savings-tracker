import { describe, expect, it } from 'vitest';
import {
  entryLabel,
  groupByDay,
  newEntry,
  newOtherEntry,
  sampleEntries,
  sumCents,
  totalsByCategory,
  validateOther,
} from './entries';

describe('other entries', () => {
  it('validates name and amount', () => {
    expect(validateOther({ label: '  Coffee   to go ', amount: '4.50' })).toEqual({ label: 'Coffee to go', cents: 450 });
    expect(validateOther({ label: '', amount: '4' })).toHaveProperty('error');
    expect(validateOther({ label: 'x'.repeat(41), amount: '4' })).toHaveProperty('error');
    expect(validateOther({ label: 'Coffee', amount: 'abc' })).toHaveProperty('error');
    expect(validateOther({ label: 'Rent', amount: '1000.01' })).toHaveProperty('error');
    expect(validateOther({ label: 'Rent', amount: '1000' })).toEqual({ label: 'Rent', cents: 100000 });
  });

  it('shows the typed name and counts under one "Other" total', () => {
    const t = new Date('2026-11-08T17:00:00Z');
    const coffee = newOtherEntry('Coffee', 450, t);
    expect(entryLabel(coffee)).toBe('Coffee');
    const list = [coffee, newOtherEntry('Snack', 300, t), newEntry('bike', t)];
    expect(totalsByCategory(list).find((c) => c.id === 'other')).toMatchObject({ cents: 750, count: 2 });
  });

  it('hides the "Other" total when there are none', () => {
    const t = new Date('2026-11-08T17:00:00Z');
    expect(totalsByCategory([newEntry('bike', t)]).map((c) => c.id)).toEqual(['breakfast', 'lunch', 'bike']);
  });
});

describe('entries', () => {
  it('allows the same button many times in one day', () => {
    const t = new Date('2026-11-08T17:00:00Z');
    const list = [newEntry('bike', t), newEntry('bike', t), newEntry('bike', t)];
    expect(new Set(list.map((e) => e.id)).size).toBe(3);
    expect(totalsByCategory(list).find((c) => c.id === 'bike')).toMatchObject({ cents: 900, count: 3 });
  });

  it('takes the price from config, not the caller', () => {
    expect(newEntry('lunch', new Date()).amountCents).toBe(1000);
  });

  it('sums and splits by category', () => {
    const t = new Date('2026-11-08T17:00:00Z');
    const list = [newEntry('lunch', t), newEntry('lunch', t), newEntry('bike', t)];
    expect(sumCents(list)).toBe(2300);
    const lunch = totalsByCategory(list).find((c) => c.id === 'lunch');
    expect(lunch).toMatchObject({ cents: 2000, count: 2 });
  });

  it('groups newest first by New York day', () => {
    const late = newEntry('bike', new Date('2026-11-09T03:00:00Z')); // Nov 8, 22:00 EST
    const early = newEntry('lunch', new Date('2026-11-08T14:00:00Z')); // Nov 8, 09:00 EST
    const next = newEntry('breakfast', new Date('2026-11-09T13:00:00Z')); // Nov 9
    const groups = groupByDay([early, next, late]);
    expect(groups.map((g) => g.key)).toEqual(['2026-11-09', '2026-11-08']);
    expect(groups[1].entries.map((e) => e.id)).toEqual([late.id, early.id]);
  });

  it('builds sample data that never lies in the future', () => {
    const now = new Date('2026-11-08T13:00:00Z');
    for (const e of sampleEntries(now)) {
      expect(new Date(e.occurredAt).getTime()).toBeLessThan(now.getTime());
    }
  });
});
