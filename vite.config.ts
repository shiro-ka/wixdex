import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: {
        id: '/',
        name: 'wixdex - WIXOSSデッキビルダー',
        short_name: 'wixdex',
        description: 'WIXOSSのデッキ構築ツール',
        lang: 'ja',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        categories: ['games', 'utilities'],
        background_color: '#18181b',
        theme_color: '#18181b',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname === 'pub-eaed63f9ee4b4b0e806344bd5b464e65.r2.dev',
            handler: 'CacheFirst',
            options: {
              cacheName: 'card-images-v2',
              expiration: { maxEntries: 1500, maxAgeSeconds: 60 * 60 * 24 * 180 },
              matchOptions: { ignoreVary: true },
            },
          },
          {
            urlPattern: /\/assets\/cards_json\/.*\.json$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'card-data-v2',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkOnly',
          },
        ],
        navigateFallback: null,
      },
    }),
  ],
});
