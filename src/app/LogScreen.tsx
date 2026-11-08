'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CATEGORIES, type Category } from '@/config/categories';
import { newEntry, sumCents, type Entry } from '@/lib/entries';
import { formatCents } from '@/lib/money';
import { useToast } from '@/components/useToast';

const BAND_BG: Record<Category['id'], string> = {
  breakfast: 'bg-breakfast',
  lunch: 'bg-lunch',
  bike: 'bg-bike',
};

/**
 * M1: entries live in local React state only (lost on reload).
 * M3 swaps this for Server Actions + the database.
 */
export default function LogScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const toast = useToast();

  function log(category: Category) {
    const entry = newEntry(category.id, new Date());
    setEntries((prev) => [...prev, entry]);
    toast.show(`Logged ${category.label} · ${formatCents(category.amountCents)}`, () =>
      setEntries((prev) => prev.filter((e) => e.id !== entry.id)),
    );
  }

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
          const count = entries.filter((e) => e.category === c.id).length;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => log(c)}
              aria-label={`Log ${c.label}, ${formatCents(c.amountCents)}. ${count} today.`}
              className={`${BAND_BG[c.id]} flex flex-1 flex-col justify-center px-5 text-left text-ink transition-[filter] active:brightness-90 focus-visible:outline-4 focus-visible:-outline-offset-8 focus-visible:outline-ink`}
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
      </div>

      {toast.element}
    </main>
  );
}
