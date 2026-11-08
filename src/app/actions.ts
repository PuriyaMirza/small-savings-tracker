'use server';

import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getDb } from '@/db';
import { entries } from '@/db/schema';
import { requireUser } from '@/lib/dal';
import { buildNewRow } from '@/lib/newEntryInput';
import { rowToEntry } from '@/lib/queries';
import type { Entry } from '@/lib/entries';

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

const idSchema = z.uuid();

function refreshPages() {
  revalidatePath('/');
  revalidatePath('/savings');
}

async function signedInEmail(): Promise<string | null> {
  try {
    return (await requireUser()).email;
  } catch {
    return null;
  }
}

/** Save one entry. Price, user and date rules are all applied here, on the server. */
export async function addEntry(input: unknown): Promise<ActionResult<Entry>> {
  const email = await signedInEmail();
  if (!email) return { ok: false, error: 'Please sign in again.' };

  const built = buildNewRow(input, email, new Date());
  if (!built.ok) return built;

  try {
    const [row] = await getDb().insert(entries).values(built.row).returning();
    refreshPages();
    return { ok: true, data: rowToEntry(row) };
  } catch (e) {
    console.error('addEntry failed', e);
    return { ok: false, error: "Couldn't save. Check your connection and try again." };
  }
}

/** Soft-delete (used by Undo on the Log screen and Delete on Savings). */
export async function deleteEntry(id: unknown): Promise<ActionResult> {
  return setDeleted(id, true);
}

/** Bring back a soft-deleted entry (Undo after a delete). */
export async function restoreEntry(id: unknown): Promise<ActionResult> {
  return setDeleted(id, false);
}

async function setDeleted(rawId: unknown, deleted: boolean): Promise<ActionResult> {
  const email = await signedInEmail();
  if (!email) return { ok: false, error: 'Please sign in again.' };
  const id = idSchema.safeParse(rawId);
  if (!id.success) return { ok: false, error: 'Invalid entry.' };

  try {
    await getDb()
      .update(entries)
      .set({ deletedAt: deleted ? new Date() : null })
      .where(
        and(
          eq(entries.id, id.data),
          eq(entries.userId, email), // only ever touch your own rows
          deleted ? isNull(entries.deletedAt) : isNotNull(entries.deletedAt),
        ),
      );
    refreshPages();
    return { ok: true, data: undefined };
  } catch (e) {
    console.error('setDeleted failed', e);
    return { ok: false, error: "Couldn't update. Check your connection and try again." };
  }
}
