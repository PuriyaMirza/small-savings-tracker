'use client';

import { useEffect, useId, useState, type FormEvent } from 'react';
import { OTHER } from '@/config/categories';
import { validateOther } from '@/lib/entries';

type Props = {
  initialLabel?: string;
  onCancel: () => void;
  onSave: (label: string, cents: number) => void;
};

/** Bottom sheet for logging an "Other" saving: a typed name and amount. */
export default function OtherSheet({ initialLabel = '', onCancel, onSave }: Props) {
  const [label, setLabel] = useState(initialLabel);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const result = validateOther({ label, amount });
    if ('error' in result) {
      setError(result.error);
      return;
    }
    onSave(result.label, result.cents);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/50" onClick={onCancel}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-3xl bg-paper px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 text-ink"
      >
        <h2 id={titleId} className="text-2xl font-extrabold">
          Other saving
        </h2>
        <label className="mt-4 flex flex-col text-sm font-medium">
          What did you skip?
          <input
            autoFocus
            value={label}
            maxLength={OTHER.maxLabelLength}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Coffee"
            autoComplete="off"
            className="mt-1 min-h-12 rounded-xl border-2 border-ink px-3 text-lg"
          />
        </label>
        <label className="mt-3 flex flex-col text-sm font-medium">
          Amount saved ($)
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="4.50"
            autoComplete="off"
            className="mt-1 min-h-12 rounded-xl border-2 border-ink px-3 text-lg tabular-nums"
          />
        </label>
        {error && (
          <p role="alert" className="mt-2 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-12 flex-1 rounded-full border-2 border-ink text-sm font-extrabold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="min-h-12 flex-1 rounded-full bg-ink text-sm font-extrabold text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Log it
          </button>
        </div>
      </form>
    </div>
  );
}
