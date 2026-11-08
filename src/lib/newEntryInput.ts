import { z } from 'zod';
import { ALL_CATEGORY_IDS, OTHER, type CategoryId } from '@/config/categories';
import { priceOf, validateOther } from './entries';
import { addDays, dayKey, noonOn } from './periods';

/** What the browser may send. Never an amount for fixed buttons, never a user id. */
export const addEntrySchema = z.object({
  id: z.uuid(),
  category: z.enum(ALL_CATEGORY_IDS as [CategoryId, ...CategoryId[]]),
  day: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(), // backdated entry; omitted = "now"
  label: z.string().max(200).optional(), // "other" only
  amount: z.string().max(20).optional(), // "other" only, e.g. "4.50"
});

export type AddEntryInput = z.infer<typeof addEntrySchema>;

export type NewRow = {
  id: string;
  userId: string;
  category: CategoryId;
  label: string | null;
  amountCents: number;
  occurredAt: Date;
};

/**
 * Turn untrusted input into the row to insert, applying every business rule
 * on the server: price from config, Other re-validated, backdate range checked.
 */
export function buildNewRow(
  raw: unknown,
  userId: string,
  now: Date,
): { ok: true; row: NewRow } | { ok: false; error: string } {
  const parsed = addEntrySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'Invalid entry.' };
  const input = parsed.data;

  let occurredAt = now;
  if (input.day) {
    const today = dayKey(now);
    if (input.day > today || input.day < addDays(today, -365 * 2)) {
      return { ok: false, error: 'Pick a date between 2 years ago and today.' };
    }
    occurredAt = noonOn(input.day);
  }

  if (input.category === OTHER.id) {
    const other = validateOther({ label: input.label ?? '', amount: input.amount ?? '' });
    if ('error' in other) return { ok: false, error: other.error };
    return {
      ok: true,
      row: { id: input.id, userId, category: OTHER.id, label: other.label, amountCents: other.cents, occurredAt },
    };
  }

  return {
    ok: true,
    row: {
      id: input.id,
      userId,
      category: input.category,
      label: null,
      amountCents: priceOf(input.category),
      occurredAt,
    },
  };
}
