/**
 * Only one Google account may use the app. The allowed address lives in the
 * ALLOWED_EMAIL env var (never in code). Comparison ignores case and spaces.
 */
export function isAllowedEmail(
  email: string | null | undefined,
  emailVerified: boolean | undefined,
  allowed: string | undefined = process.env.ALLOWED_EMAIL,
): boolean {
  if (!email || !allowed || emailVerified !== true) return false;
  return email.trim().toLowerCase() === allowed.trim().toLowerCase();
}
