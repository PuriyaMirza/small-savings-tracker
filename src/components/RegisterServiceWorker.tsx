'use client';

import { useEffect } from 'react';

/** Registers /sw.js (offline page only) in production builds. */
export default function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Not fatal: the app works without it, just no custom offline page.
    });
  }, []);
  return null;
}
