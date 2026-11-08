'use client';

import { useSearchParams } from 'next/navigation';

const MESSAGES: Record<string, string> = {
  AccessDenied: "That Google account isn't allowed to use this app.",
  Configuration: 'Sign-in is not set up correctly yet (server configuration).',
};

export default function SignInError() {
  const error = useSearchParams().get('error');
  if (!error) return null;
  return (
    <p role="alert" className="mt-4 rounded-2xl bg-track p-3 text-sm text-lunch">
      {MESSAGES[error] ?? 'Sign-in failed. Please try again.'}
    </p>
  );
}
