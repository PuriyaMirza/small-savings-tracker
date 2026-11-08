'use client';

import dynamic from 'next/dynamic';
import type { Entry } from '@/lib/entries';

// Client-only: periods and day labels depend on the browser's current time,
// which would differ between the server render and the browser.
const SavingsScreen = dynamic(() => import('./SavingsScreen'), {
  ssr: false,
  loading: () => <p className="px-5 pt-6 text-muted">Loading…</p>,
});

export default function SavingsLoader({ entries }: { entries: Entry[] }) {
  return <SavingsScreen initialEntries={entries} />;
}
