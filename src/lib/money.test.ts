import { describe, expect, it } from 'vitest';
import { formatCents, parseDollars } from './money';

describe('parseDollars', () => {
  it('accepts whole, decimal and $-prefixed amounts', () => {
    expect(parseDollars('4')).toBe(400);
    expect(parseDollars('4.5')).toBe(450);
    expect(parseDollars(' $4.50 ')).toBe(450);
    expect(parseDollars('.75')).toBe(75);
    expect(parseDollars('1,200')).toBe(120000);
  });
  it('rejects zero, negatives, 3+ decimals and junk', () => {
    for (const bad of ['', '0', '0.00', '-3', '4.555', 'abc', '4.', '1e3']) {
      expect(parseDollars(bad)).toBeNull();
    }
  });
});
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
