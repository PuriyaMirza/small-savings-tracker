import type { MetadataRoute } from 'next';

// Served at /manifest.webmanifest. Lets "Add to Home Screen" install the app
// with its own name and icon, opening full-screen (no Safari bars).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Savings Tracker',
    short_name: 'Savings',
    description: 'Log money saved by skipping a purchase.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#111111',
    theme_color: '#111111',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
