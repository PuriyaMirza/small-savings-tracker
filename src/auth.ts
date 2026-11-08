import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { isAllowedEmail } from '@/lib/allowlist';

/**
 * Auth.js config. Reads AUTH_SECRET, AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET
 * from the environment automatically; ALLOWED_EMAIL is our own.
 * Sessions are signed, encrypted cookies (no database needed).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: '/signin',
    error: '/signin', // e.g. ?error=AccessDenied for a non-allowed account
  },
  callbacks: {
    // Runs once at login: refuse every Google account except the allowed one.
    signIn({ profile }) {
      return isAllowedEmail(profile?.email, profile?.email_verified as boolean | undefined);
    },
    // Runs in proxy.ts on every request: no session → redirect to /signin.
    authorized({ auth }) {
      return isAllowedEmail(auth?.user?.email, true);
    },
  },
});
