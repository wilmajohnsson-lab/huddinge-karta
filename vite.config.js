import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      // Inject registration as an external deferred script (CSP safe — no inline JS)
      injectRegister: 'script-defer',
      // We manage public/manifest.json manually so the icons list stays in one place
      manifest: false,
      workbox: {
        // Pre-cache built app shell (JS, CSS, HTML, fonts, icons)
        globPatterns: [
          '**/*.{js,css,html,woff2}',
          'favicon.svg',
          'icons/*.png',
          'manifest.json',
        ],
        // Don't precache large media assets – let them be fetched on demand
        globIgnores: ['og-image.*', 'data/**', '**/*.otf'],
        runtimeCaching: [
          // CartoCDN map tiles — CacheFirst, 7-day TTL, up to 500 tiles
          {
            urlPattern: /^https:\/\/[a-d]\.basemaps\.cartocdn\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tile-cache',
              expiration: { maxEntries: 500, maxAgeSeconds: 7 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // items.json — NetworkFirst (5-second timeout, then cached copy)
          {
            urlPattern: /\/data\/items\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'data-cache',
              networkTimeoutSeconds: 5,
              expiration: { maxAgeSeconds: 5 * 60 },
            },
          },
          // Unsplash event images — CacheFirst, 7-day TTL, up to 100 images
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
