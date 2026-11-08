import { and, desc, eq, gte, isNull } from 'drizzle-orm';
import { getDb } from '@/db';
import { entries, type EntryRow } from '@/db/schema';
import type { CategoryId } from '@/config/categories';
import type { Entry } from './entries';

export function rowToEntry(r: EntryRow): Entry {
  return {
    id: r.id,
    category: r.category as CategoryId,
    amountCents: r.amountCents,
    occurredAt: r.occurredAt.toISOString(),
    ...(r.label ? { label: r.label } : {}),
  };
}

/** Live (not deleted) entries for a user, newest first, optionally since an instant. */
export async function getEntries(userId: string, since?: Date): Promise<Entry[]> {
  const rows = await getDb()
    .select()
    .from(entries)
    .where(
      and(
        eq(entries.userId, userId),
        isNull(entries.deletedAt),
        since ? gte(entries.occurredAt, since) : undefined,
      ),
    )
    .orderBy(desc(entries.occurredAt))
    .limit(10_000);
  return rows.map(rowToEntry);
}
