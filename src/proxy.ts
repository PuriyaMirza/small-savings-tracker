// Runs before every matched request. Auth.js's `auth` wrapper calls the
// `authorized` callback in src/auth.ts and redirects to /signin when it fails.
export { auth as proxy } from '@/auth';

export const config = {
  // Everything except Auth.js's own routes, the sign-in page, static files,
  // and the public PWA files (manifest, icons, service worker, offline page).
  matcher: [
    '/((?!api/auth|signin|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon|apple-icon|sw.js|offline.html).*)',
  ],
};
