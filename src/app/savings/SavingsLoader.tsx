'use client';

import dynamic from 'next/dynamic';

// Client-only: the sample data is built from the current time, which would
// differ between the server render and the browser.
const SavingsScreen = dynamic(() => import('./SavingsScreen'), {
  ssr: false,
  loading: () => <p className="px-5 pt-6 text-muted">Loading…</p>,
});

export default function SavingsLoader() {
  return <SavingsScreen />;
}
