import { signOut } from '@/auth';

export default function SignOutButton() {
  async function doSignOut() {
    'use server';
    await signOut({ redirectTo: '/signin' });
  }

  return (
    <form action={doSignOut}>
      <button
        type="submit"
        className="min-h-11 rounded-full px-4 text-sm font-medium text-muted underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
      >
        Sign out
      </button>
    </form>
  );
}
