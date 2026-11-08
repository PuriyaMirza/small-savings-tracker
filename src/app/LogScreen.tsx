'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import { CATEGORIES, OTHER, type Category, type CategoryId } from '@/config/categories';
import { newEntry, newOtherEntry, sumCents, type Entry } from '@/lib/entries';
import { formatCents } from '@/lib/money';
import { useToast } from '@/components/useToast';
import OtherSheet from '@/components/OtherSheet';
import { addEntry, deleteEntry, type ActionResult } from './actions';

const BAND_BG: Record<CategoryId, string> = {
  breakfast: 'bg-breakfast',
  lunch: 'bg-lunch',
  bike: 'bg-bike',
  other: 'bg-other',
};

const bandClass =
  'flex flex-1 flex-col justify-center px-5 text-left text-ink transition-[filter] active:brightness-90 disabled:opacity-60 focus-visible:outline-4 focus-visible:-outline-offset-8 focus-visible:outline-ink';

type Props = {
  /** Today's saved entries from the database; null while loading. */
  initialEntries: Entry[] | null;
};

/**
 * Optimistic UI: a tap shows immediately, then saves on the server.
 * If the save fails, the entry is removed again and an error toast shows.
 * Every tap is its own entry, so a button can be logged any number of times a day.
 */
export default function LogScreen({ initialEntries }: Props) {
  const loading = initialEntries === null;
  const [entries, setEntries] = useState<Entry[]>(initialEntries ?? []);
  const [otherOpen, setOtherOpen] = useState(false);
  const [lastOtherLabel, setLastOtherLabel] = useState('');
  const pending = useRef(new Map<string, Promise<ActionResult<Entry>>>());
  const toast = useToast();

  const remove = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));

  async function undo(entry: Entry) {
    remove(entry.id);
    const saving = pending.current.get(entry.id);
    if (saving && !(await saving).ok) return; // never saved; nothing to delete
    const res = await deleteEntry(entry.id);
    if (!res.ok) {
      setEntries((prev) => [...prev, entry]);
      toast.show(res.error);
    }
  }

  function save(entry: Entry, input: Record<string, string>, message: string) {
    setEntries((prev) => [...prev, entry]);
    toast.show(message, () => void undo(entry));
    const saving = addEntry({ id: entry.id, ...input });
    pending.current.set(entry.id, saving);
    void saving.then((res) => {
      pending.current.delete(entry.id);
      if (res.ok) {
        setEntries((prev) => prev.map((e) => (e.id === entry.id ? res.data : e)));
      } else {
        remove(entry.id);
        toast.show(res.error);
      }
    });
  }

  function log(category: Category) {
    const entry = newEntry(category.id, new Date());
    save(entry, { category: category.id }, `Logged ${category.label} · ${formatCents(category.amountCents)}`);
  }

  function logOther(label: string, cents: number) {
    setOtherOpen(false);
    setLastOtherLabel(label);
    const entry = newOtherEntry(label, cents, new Date());
    save(
      entry,
      { category: OTHER.id, label, amount: (cents / 100).toFixed(2) },
      `Logged ${label} · ${formatCents(cents)}`,
    );
  }

  const closeOther = useCallback(() => setOtherOpen(false), []);
  const countOf = (id: CategoryId) => entries.filter((e) => e.category === id).length;
  const otherCount = countOf(OTHER.id);

  return (
    <main className="flex h-dvh flex-col">
      <header className="flex items-center justify-between bg-bar px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-paper">
        <div>
          <p className="text-xs font-medium text-muted">Today</p>
          <p className="text-2xl font-extrabold tabular-nums">{loading ? '…' : formatCents(sumCents(entries))}</p>
        </div>
        <Link
          href="/savings"
          className="flex min-h-11 items-center rounded-full bg-paper px-4 text-sm font-extrabold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
        >
          Savings →
        </Link>
      </header>

      <div className="flex flex-1 flex-col pb-[env(safe-area-inset-bottom)]">
        {CATEGORIES.map((c) => {
          const count = countOf(c.id);
          return (
            <button
              key={c.id}
              type="button"
              disabled={loading}
              onClick={() => log(c)}
              aria-label={`Log ${c.label}, ${formatCents(c.amountCents)}. ${count} today.`}
              className={`${BAND_BG[c.id]} ${bandClass}`}
            >
              <span className="text-sm font-medium">
                {c.note} · {loading ? '…' : count} today
              </span>
              <span className="flex items-baseline justify-between text-[50px] font-extrabold leading-none">
                <span>{c.label}</span>
                <span>{formatCents(c.amountCents)}</span>
              </span>
            </button>
          );
        })}
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            toast.dismiss(); // the toast would cover the sheet's buttons
            setOtherOpen(true);
          }}
          aria-haspopup="dialog"
          aria-label={`Log something else, choose name and amount. ${otherCount} today.`}
          className={`${BAND_BG.other} ${bandClass}`}
        >
          <span className="text-sm font-medium">
            {OTHER.note} · {loading ? '…' : otherCount} today
          </span>
          <span className="flex items-baseline justify-between text-[50px] font-extrabold leading-none">
            <span>{OTHER.label}</span>
            <span aria-hidden>+</span>
          </span>
        </button>
      </div>

      {otherOpen && <OtherSheet initialLabel={lastOtherLabel} onCancel={closeOther} onSave={logOther} />}
      {toast.element}
    </main>
  );
}
