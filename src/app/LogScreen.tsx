'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { CATEGORIES, OTHER, type Category, type CategoryId } from '@/config/categories';
import { newEntry, newOtherEntry, sumCents, type Entry } from '@/lib/entries';
import { formatCents } from '@/lib/money';
import { useToast } from '@/components/useToast';
import OtherSheet from '@/components/OtherSheet';

const BAND_BG: Record<CategoryId, string> = {
  breakfast: 'bg-breakfast',
  lunch: 'bg-lunch',
  bike: 'bg-bike',
  other: 'bg-other',
};

const bandClass =
  'flex flex-1 flex-col justify-center px-5 text-left text-ink transition-[filter] active:brightness-90 focus-visible:outline-4 focus-visible:-outline-offset-8 focus-visible:outline-ink';

/**
 * M1: entries live in local React state only (lost on reload).
 * M3 swaps this for Server Actions + the database.
 * Every tap is its own entry, so a button can be logged any number of times a day.
 */
export default function LogScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [otherOpen, setOtherOpen] = useState(false);
  const [lastOtherLabel, setLastOtherLabel] = useState('');
  const toast = useToast();

  function add(entry: Entry, message: string) {
    setEntries((prev) => [...prev, entry]);
    toast.show(message, () => setEntries((prev) => prev.filter((e) => e.id !== entry.id)));
  }

  function log(category: Category) {
    add(newEntry(category.id, new Date()), `Logged ${category.label} · ${formatCents(category.amountCents)}`);
  }

  function logOther(label: string, cents: number) {
    setOtherOpen(false);
    setLastOtherLabel(label);
    add(newOtherEntry(label, cents, new Date()), `Logged ${label} · ${formatCents(cents)}`);
  }

  const closeOther = useCallback(() => setOtherOpen(false), []);
  const countOf = (id: CategoryId) => entries.filter((e) => e.category === id).length;
  const otherCount = countOf(OTHER.id);

  return (
    <main className="flex h-dvh flex-col">
      <header className="flex items-center justify-between bg-bar px-5 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-paper">
        <div>
          <p className="text-xs font-medium text-muted">Today</p>
          <p className="text-2xl font-extrabold tabular-nums">{formatCents(sumCents(entries))}</p>
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
              onClick={() => log(c)}
              aria-label={`Log ${c.label}, ${formatCents(c.amountCents)}. ${count} today.`}
              className={`${BAND_BG[c.id]} ${bandClass}`}
            >
              <span className="text-sm font-medium">
                {c.note} · {count} today
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
          onClick={() => {
            toast.dismiss(); // the toast would cover the sheet's buttons
            setOtherOpen(true);
          }}
          aria-haspopup="dialog"
          aria-label={`Log something else, choose name and amount. ${otherCount} today.`}
          className={`${BAND_BG.other} ${bandClass}`}
        >
          <span className="text-sm font-medium">
            {OTHER.note} · {otherCount} today
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
