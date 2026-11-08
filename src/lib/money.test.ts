import { describe, expect, it } from 'vitest';
import { formatCents } from './money';
import { CATEGORIES } from '../config/categories';

describe('formatCents', () => {
  it('shows whole dollars without decimals', () => {
    expect(formatCents(200)).toBe('$2');
    expect(formatCents(1000)).toBe('$10');
  });

  it('shows cents when present or requested', () => {
    expect(formatCents(1050)).toBe('$10.50');
    expect(formatCents(1000, { alwaysDecimals: true })).toBe('$10.00');
    expect(formatCents(5)).toBe('$0.05');
  });

  it('adds thousands separators and handles zero and negatives', () => {
    expect(formatCents(123456)).toBe('$1,234.56');
    expect(formatCents(0)).toBe('$0');
    expect(formatCents(-300)).toBe('-$3');
  });

  it('rejects non-integer input', () => {
    expect(() => formatCents(2.5)).toThrow();
  });
});

describe('CATEGORIES', () => {
  it('has the three v1 buttons with positive integer prices', () => {
    expect(CATEGORIES.map((c) => c.id)).toEqual(['breakfast', 'lunch', 'bike']);
    for (const c of CATEGORIES) {
      expect(Number.isInteger(c.amountCents)).toBe(true);
      expect(c.amountCents).toBeGreaterThan(0);
    }
  });
});
