'use client';

import Link from 'next/link';
import { useMemo, useState, type FormEvent } from 'react';
import { CATEGORIES, OTHER, type CategoryId } from '@/config/categories';
import {
  entryLabel,
  groupByDay,
  newEntry,
  newOtherEntry,
  sampleEntries,
  sumCents,
  totalsByCategory,
  validateOther,
  type Entry,
} from '@/lib/entries';
import { formatCents } from '@/lib/money';
import { addDays, dayKey, dayLabel, isInPeriod, noonOn, PERIODS, timeLabel, type Period } from '@/lib/periods';
import { useToast } from '@/components/useToast';

const DOT_BG: Record<CategoryId, string> = {
  breakfast: 'bg-breakfast',
  lunch: 'bg-lunch',
  bike: 'bg-bike',
  other: 'bg-other',
};

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper';

/**
 * M1: hard-coded sample entries in local state. Rendered client-only
 * (see SavingsLoader) because the sample data depends on the current time.
 */
export default function SavingsScreen() {
  const [now] = useState(() => new Date());
  const [entries, setEntries] = useState<Entry[]>(() => sampleEntries(now));
  const [period, setPeriod] = useState<Period>('week');
  const toast = useToast();

  const inPeriod = useMemo(
    () => entries.filter((e) => isInPeriod(new Date(e.occurredAt), period, now)),
    [entries, period, now],
  );
  const total = sumCents(inPeriod);
  const byCategory = totalsByCategory(inPeriod);
  const maxCents = Math.max(1, ...byCategory.map((c) => c.cents));
  const groups = groupByDay(inPeriod);

  function remove(entry: Entry) {
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    toast.show(`Deleted ${entryLabel(entry)} · ${formatCents(entry.amountCents)}`, () =>
      setEntries((prev) => [...prev, entry]),
    );
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
    if (formCategory === OTHER.id) {
      const result = validateOther({ label: formOtherLabel, amount: formOtherAmount });
      if ('error' in result) {
        setFormError(result.error);
        return;
      }
      entry = newOtherEntry(result.label, result.cents, noonOn(formDay));
      setFormOtherAmount('');
    } else {
      entry = newEntry(formCategory, noonOn(formDay));
    }
    setFormError(null);
    setEntries((prev) => [...prev, entry]);
    toast.show(`Added ${entryLabel(entry)} · ${dayLabel(formDay, now)}`, () =>
      setEntries((prev) => prev.filter((x) => x.id !== entry.id)),
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pb-28 pt-[max(0.75rem,env(safe-area-inset-top))] text-paper">
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
      {groups.length === 0 && <p className="mt-2 text-muted">Nothing logged in this period.</p>}
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
                    aria-label={`Delete ${label} ${formatCents(e.amountCents)}, ${dayLabel(g.key, now)} ${timeLabel(new Date(e.occurredAt))}`}
                    className={`flex size-11 items-center justify-center rounded-full text-muted ${focusRing}`}
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
          className={`mt-4 min-h-11 w-full rounded-full bg-paper text-sm font-extrabold text-ink ${focusRing}`}
        >
          Add
        </button>
      </form>

      {toast.element}
    </main>
  );
}
