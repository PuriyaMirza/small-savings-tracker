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
