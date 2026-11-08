import type { Metadata } from 'next';
import { Suspense } from 'react';
import { signIn } from '@/auth';
import SignInError from './SignInError';

export const metadata: Metadata = { title: 'Sign in · Savings' };

export default function SignInPage() {
  async function signInWithGoogle() {
    'use server';
    await signIn('google', { redirectTo: '/' });
  }

  return (
    <main className="flex min-h-dvh flex-col">
      <div className="h-3 bg-breakfast" />
      <div className="h-3 bg-lunch" />
      <div className="h-3 bg-bike" />
      <div className="flex flex-1 flex-col justify-center px-5 pb-[max(2rem,env(safe-area-inset-bottom))] text-paper">
        <h1 className="text-[50px] font-extrabold leading-none">Savings</h1>
        <p className="mt-3 text-muted">Private app. Sign in to continue.</p>
        <Suspense>
          <SignInError />
        </Suspense>
        <form action={signInWithGoogle} className="mt-8">
          <button
            type="submit"
            className="min-h-12 w-full rounded-full bg-paper text-base font-extrabold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </main>
  );
}
