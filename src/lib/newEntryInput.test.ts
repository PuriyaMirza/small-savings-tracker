import { describe, expect, it } from 'vitest';
import { buildNewRow } from './newEntryInput';

const now = new Date('2026-11-08T17:00:00Z'); // Sun Nov 8, 12:00 EST
const id = '6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b';
const user = 'owner@example.com';

describe('buildNewRow', () => {
  it('takes fixed prices from config and ignores any amount sent', () => {
    const r = buildNewRow({ id, category: 'lunch', amount: '0.01' }, user, now);
    expect(r).toEqual({
      ok: true,
      row: { id, userId: user, category: 'lunch', label: null, amountCents: 1000, occurredAt: now },
    });
  });

  it('never lets the browser choose the user', () => {
    const r = buildNewRow({ id, category: 'bike', userId: 'attacker@example.com' }, user, now);
    expect(r.ok && r.row.userId).toBe(user);
  });

  it('re-validates Other on the server', () => {
    expect(buildNewRow({ id, category: 'other', label: 'Coffee', amount: '4.50' }, user, now)).toMatchObject({
      ok: true,
      row: { label: 'Coffee', amountCents: 450 },
    });
    expect(buildNewRow({ id, category: 'other', label: 'Rent', amount: '5000' }, user, now)).toMatchObject({ ok: false });
    expect(buildNewRow({ id, category: 'other', label: '', amount: '3' }, user, now)).toMatchObject({ ok: false });
  });

  it('backdates to noon New York time within the allowed range', () => {
    const r = buildNewRow({ id, category: 'bike', day: '2026-11-01' }, user, now);
    expect(r.ok && r.row.occurredAt.toISOString()).toBe('2026-11-01T17:00:00.000Z');
    expect(buildNewRow({ id, category: 'bike', day: '2026-11-09' }, user, now)).toMatchObject({ ok: false });
    expect(buildNewRow({ id, category: 'bike', day: '2024-11-07' }, user, now)).toMatchObject({ ok: false });
  });

  it('rejects bad ids, unknown categories and malformed dates', () => {
    for (const bad of [
      { id: 'nope', category: 'bike' },
      { id, category: 'pizza' },
      { id, category: 'bike', day: '11/08/2026' },
      null,
    ]) {
      expect(buildNewRow(bad, user, now)).toMatchObject({ ok: false });
    }
  });
});
