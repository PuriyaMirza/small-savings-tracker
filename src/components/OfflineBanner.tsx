'use client';

/** Shown at the top of a screen while there's no connection. */
export default function OfflineBanner() {
  return (
    <div role="status" className="bg-lunch px-5 py-2 text-center text-sm font-extrabold text-ink">
      You&apos;re offline. Saving is paused until you reconnect.
    </div>
  );
}
