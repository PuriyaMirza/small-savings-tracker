import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// One table (docs/HANDOFF.md → Data model). Categories live in code.
export const entries = pgTable(
  'entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    category: text('category').notNull(),
    label: text('label'), // only for "other"
    amountCents: integer('amount_cents').notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    index('entries_user_occurred_idx')
      .on(t.userId, t.occurredAt.desc())
      .where(sql`${t.deletedAt} is null`),
    check('entries_amount_positive', sql`${t.amountCents} > 0 and ${t.amountCents} <= 100000`),
    check('entries_label_length', sql`${t.label} is null or char_length(${t.label}) <= 40`),
  ],
);

export type EntryRow = typeof entries.$inferSelect;
