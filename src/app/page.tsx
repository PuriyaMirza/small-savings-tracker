import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/dal';
import { getEntries } from '@/lib/queries';
import { dayKey, startOfDay } from '@/lib/periods';
import LogScreen from './LogScreen';

export default function LogPage() {
  return (
    <Suspense fallback={<LogScreen initialEntries={null} />}>
      <TodayData />
    </Suspense>
  );
}

// Reads the session and the database, so it runs per request behind Suspense.
async function TodayData() {
  let email: string;
  try {
    email = (await requireUser()).email;
  } catch {
    redirect('/signin');
  }
  const today = await getEntries(email, startOfDay(dayKey(new Date())));
  return <LogScreen initialEntries={today} />;
}
