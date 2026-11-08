'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type ToastState = { id: number; message: string; onUndo?: () => void } | null;

const TOAST_MS = 6000;

/** One toast at a time; a new one replaces the old. */
export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback((message: string, onUndo?: () => void) => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), message, onUndo });
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const element = (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      {toast && (
        <div
          key={toast.id}
          className="pointer-events-auto flex min-h-14 w-full max-w-sm items-center justify-between gap-3 rounded-full bg-bar py-2 pl-5 pr-2 text-paper shadow-lg"
        >
          <span className="text-sm font-medium">{toast.message}</span>
          {toast.onUndo && (
            <button
              type="button"
              onClick={() => {
                toast.onUndo?.();
                dismiss();
              }}
              className="min-h-11 rounded-full bg-paper px-5 text-sm font-extrabold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );

  return { show, dismiss, element };
}
