import { auth } from '@/auth';
import { isAllowedEmail } from './allowlist';

/**
 * Data Access Layer: every Server Action (M3+) calls this first.
 * proxy.ts already blocks logged-out page visits, but actions must re-check
 * on the server because a request can be crafted without the page.
 */
export async function requireUser(): Promise<{ email: string }> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email || !isAllowedEmail(email, true)) {
    throw new Error('Not signed in');
  }
  return { email: email.toLowerCase() };
}
