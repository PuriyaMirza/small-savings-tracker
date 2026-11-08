import { describe, expect, it } from 'vitest';
import { groupByDay, newEntry, sampleEntries, sumCents, totalsByCategory } from './entries';

describe('entries', () => {
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
