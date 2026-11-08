'use client';

import Link from 'next/link';
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { CATEGORIES, OTHER, type CategoryId } from '@/config/categories';
import {
  entryLabel,
  groupByDay,
  newEntry,
  newOtherEntry,
  sumCents,
  totalsByCategory,
  validateOther,
  type Entry,
} from '@/lib/entries';
import { formatCents } from '@/lib/money';
import { addDays, dayKey, dayLabel, isInPeriod, noonOn, PERIODS, timeLabel, type Period } from '@/lib/periods';
import { useToast } from '@/components/useToast';
import OfflineBanner from '@/components/OfflineBanner';
import { useOnline } from '@/components/useOnline';
import { addEntry, deleteEntry, restoreEntry, type ActionResult } from '../actions';

const DOT_BG: Record<CategoryId, string> = {
  breakfast: 'bg-breakfast',
  lunch: 'bg-lunch',
  bike: 'bg-bike',
  other: 'bg-other',
};

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper';

/**
 * All saved entries from the database. Changes show immediately and are
 * saved on the server; a failed save is rolled back with an error toast.
 * Rendered client-only (see SavingsLoader) because periods depend on "now".
 */
export default function SavingsScreen({ initialEntries }: { initialEntries: Entry[] }) {
  const [now] = useState(() => new Date());
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [period, setPeriod] = useState<Period>('week');
  const pending = useRef(new Map<string, Promise<ActionResult<Entry>>>());
  const toast = useToast();
  const online = useOnline();

  const drop = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));
  const putBack = (entry: Entry) =>
    setEntries((prev) => (prev.some((e) => e.id === entry.id) ? prev : [...prev, entry]));

  const inPeriod = useMemo(
    () => entries.filter((e) => isInPeriod(new Date(e.occurredAt), period, now)),
    [entries, period, now],
  );
  const total = sumCents(inPeriod);
  const byCategory = totalsByCategory(inPeriod);
  const maxCents = Math.max(1, ...byCategory.map((c) => c.cents));
  const groups = groupByDay(inPeriod);

  function remove(entry: Entry) {
    drop(entry.id);
    const deleting = deleteEntry(entry.id);
    toast.show(`Deleted ${entryLabel(entry)} · ${formatCents(entry.amountCents)}`, () => {
      putBack(entry);
      void deleting.then(async (del) => {
        if (!del.ok) return; // delete never happened; already back
        const res = await restoreEntry(entry.id);
        if (!res.ok) {
          drop(entry.id);
          toast.show(res.error);
        }
      });
    });
    void deleting.then((res) => {
      if (!res.ok) {
        putBack(entry);
        toast.show(res.error);
      }
    });
  }

  const today = dayKey(now);
  const minDay = addDays(today, -365 * 2);
  const [formCategory, setFormCategory] = useState<CategoryId>('breakfast');
  const [formDay, setFormDay] = useState(today);
  const [formOtherLabel, setFormOtherLabel] = useState('');
  const [formOtherAmount, setFormOtherAmount] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  function addMissed(e: FormEvent) {
    e.preventDefault();
    if (!formDay || formDay > today || formDay < minDay) {
      setFormError('Pick a date between 2 years ago and today.');
      return;
    }
    let entry: Entry;
    let input: Record<string, string>;
    if (formCategory === OTHER.id) {
      const result = validateOther({ label: formOtherLabel, amount: formOtherAmount });
      if ('error' in result) {
        setFormError(result.error);
        return;
      }
      entry = newOtherEntry(result.label, result.cents, noonOn(formDay));
      input = { category: OTHER.id, day: formDay, label: result.label, amount: (result.cents / 100).toFixed(2) };
      setFormOtherAmount('');
    } else {
      entry = newEntry(formCategory, noonOn(formDay));
      input = { category: formCategory, day: formDay };
    }
    setFormError(null);
    putBack(entry);
    toast.show(`Added ${entryLabel(entry)} · ${dayLabel(formDay, now)}`, () => void undoAdd(entry));
    const saving = addEntry({ id: entry.id, ...input });
    pending.current.set(entry.id, saving);
    void saving.then((res) => {
      pending.current.delete(entry.id);
      if (res.ok) {
        setEntries((prev) => prev.map((e) => (e.id === entry.id ? res.data : e)));
      } else {
        drop(entry.id);
        toast.show(res.error);
      }
    });
  }

  async function undoAdd(entry: Entry) {
    drop(entry.id);
    const saving = pending.current.get(entry.id);
    if (saving && !(await saving).ok) return;
    const res = await deleteEntry(entry.id);
    if (!res.ok) {
      putBack(entry);
      toast.show(res.error);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pb-28 pt-[max(0.75rem,env(safe-area-inset-top))] text-paper">
      {!online && (
        <div className="-mx-5 mb-3">
          <OfflineBanner />
        </div>
      )}
      <Link
        href="/"
        className={`flex min-h-11 w-fit items-center rounded-full bg-paper px-4 text-sm font-extrabold text-ink ${focusRing}`}
      >
        ← Log
      </Link>

      <div role="group" aria-label="Period" className="mt-6 flex gap-1 rounded-full bg-track p-1">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={period === p.id}
            onClick={() => setPeriod(p.id)}
            className={`min-h-11 flex-1 rounded-full px-2 text-sm font-extrabold ${focusRing} ${
              period === p.id ? 'bg-paper text-ink' : 'text-muted'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <p className="mt-6 text-[min(104px,26vw)] font-extrabold leading-none tabular-nums">
        {formatCents(total)}
      </p>

      <ul className="mt-6 space-y-3" aria-label="By category">
        {byCategory.map((c) => (
          <li key={c.id}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-extrabold">{c.label}</span>
              <span className="text-muted tabular-nums">
                {formatCents(c.cents)} · {c.count}×
              </span>
            </div>
            <div className="mt-1 h-3 rounded-full bg-track">
              <div
                className={`h-3 rounded-full ${DOT_BG[c.id]}`}
                style={{ width: `${(c.cents / maxCents) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-extrabold">History</h2>
      {entries.length === 0 ? (
        <p className="mt-2 text-muted">
          No savings yet. Tap a band on the Log screen to record your first one.
        </p>
      ) : (
        groups.length === 0 && <p className="mt-2 text-muted">Nothing logged in this period.</p>
      )}
      {groups.map((g) => (
        <section key={g.key} className="mt-4">
          <h3 className="text-sm font-medium text-muted">{dayLabel(g.key, now)}</h3>
          <ul className="mt-1 divide-y divide-track">
            {g.entries.map((e) => {
              const label = entryLabel(e);
              return (
                <li key={e.id} className="flex min-h-12 items-center gap-3">
                  <span aria-hidden className={`size-3 shrink-0 rounded-full ${DOT_BG[e.category]}`} />
                  <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
                  <span className="text-sm text-muted tabular-nums">{timeLabel(new Date(e.occurredAt))}</span>
                  <span className="w-14 text-right font-extrabold tabular-nums">{formatCents(e.amountCents)}</span>
                  <button
                    type="button"
                    onClick={() => remove(e)}
                    disabled={!online}
                    aria-label={`Delete ${label} ${formatCents(e.amountCents)}, ${dayLabel(g.key, now)} ${timeLabel(new Date(e.occurredAt))}`}
                    className={`flex size-11 items-center justify-center rounded-full text-muted disabled:opacity-40 ${focusRing}`}
                  >
                    <span aria-hidden>✕</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <form onSubmit={addMissed} className="mt-10 rounded-3xl bg-track p-4">
        <h2 className="text-lg font-extrabold">Add a missed entry</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <label className="flex min-w-36 flex-1 flex-col text-sm text-muted">
            Category
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as CategoryId)}
              className={`mt-1 min-h-11 rounded-xl bg-bar px-3 text-base text-paper ${focusRing}`}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} · {formatCents(c.amountCents)}
                </option>
              ))}
              <option value={OTHER.id}>Other · you choose</option>
            </select>
          </label>
          <label className="flex min-w-36 flex-1 flex-col text-sm text-muted">
            Date
            <input
              type="date"
              value={formDay}
              min={minDay}
              max={today}
              onChange={(e) => setFormDay(e.target.value)}
              className={`mt-1 min-h-11 rounded-xl bg-bar px-3 text-base text-paper [color-scheme:dark] ${focusRing}`}
            />
          </label>
        </div>
        {formCategory === OTHER.id && (
          <div className="mt-3 flex flex-wrap gap-3">
            <label className="flex min-w-36 flex-1 flex-col text-sm text-muted">
              What did you skip?
              <input
                value={formOtherLabel}
                maxLength={OTHER.maxLabelLength}
                onChange={(e) => setFormOtherLabel(e.target.value)}
                placeholder="Coffee"
                autoComplete="off"
                className={`mt-1 min-h-11 rounded-xl bg-bar px-3 text-base text-paper ${focusRing}`}
              />
            </label>
            <label className="flex min-w-36 flex-1 flex-col text-sm text-muted">
              Amount saved ($)
              <input
                value={formOtherAmount}
                onChange={(e) => setFormOtherAmount(e.target.value)}
                inputMode="decimal"
                placeholder="4.50"
                autoComplete="off"
                className={`mt-1 min-h-11 rounded-xl bg-bar px-3 text-base text-paper tabular-nums ${focusRing}`}
              />
            </label>
          </div>
        )}
        {formError && (
          <p role="alert" className="mt-2 text-sm text-lunch">
            {formError}
          </p>
        )}
        <button
          type="submit"
          disabled={!online}
          className={`mt-4 min-h-11 w-full rounded-full bg-paper text-sm font-extrabold text-ink disabled:opacity-50 ${focusRing}`}
        >
          Add
        </button>
      </form>

      {toast.element}
    </main>
  );
}
