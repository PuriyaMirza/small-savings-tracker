'use client';

import { useEffect } from 'react';
import { useOnline } from '@/components/useOnline';

// Shown instead of a blank screen when a page fails to load
// (for example the database is unreachable or the connection dropped).
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const online = useOnline();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col">
      <div className="h-3 bg-breakfast" />
      <div className="h-3 bg-lunch" />
      <div className="h-3 bg-bike" />
      <div className="flex flex-1 flex-col justify-center px-5 pb-[max(2rem,env(safe-area-inset-bottom))] text-paper">
        <h1 className="text-[40px] font-extrabold leading-tight">
          {online ? 'Something went wrong' : "You're offline"}
        </h1>
        <p className="mt-3 text-muted">
          {online
            ? "Your savings couldn't load. Nothing you logged is lost."
            : 'Savings needs an internet connection to load and save entries.'}
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-8 min-h-12 w-full rounded-full bg-paper text-base font-extrabold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
