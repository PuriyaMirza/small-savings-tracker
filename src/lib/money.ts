/**
 * Money is integer cents everywhere. Format only at display time.
 * Whole dollars show without decimals ("$2"); otherwise two decimals ("$10.50").
 */
export function formatCents(cents: number, opts: { alwaysDecimals?: boolean } = {}): string {
  if (!Number.isInteger(cents)) {
    throw new Error(`formatCents expects integer cents, got ${cents}`);
  }
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const rest = abs % 100;
  const whole = dollars.toLocaleString('en-US');
  if (rest === 0 && !opts.alwaysDecimals) return `${sign}$${whole}`;
  return `${sign}$${whole}.${String(rest).padStart(2, '0')}`;
}

/**
 * Parse a typed dollar amount ("4", "4.5", "$4.50") into integer cents.
 * Returns null for anything that isn't a positive amount with at most 2 decimals.
 */
export function parseDollars(input: string): number | null {
  const s = input.trim().replace(/^\$/, '').replace(/,/g, '');
  const m = /^(\d+)(?:\.(\d{1,2}))?$|^\.(\d{1,2})$/.exec(s);
  if (!m) return null;
  const dollars = Number(m[1] ?? 0);
  const fraction = (m[2] ?? m[3] ?? '').padEnd(2, '0');
  const cents = dollars * 100 + Number(fraction || 0);
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}
