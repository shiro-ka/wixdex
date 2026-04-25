import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'wixdex - WIXOSSデッキビルダー',
        short_name: 'wixdex',
        description: 'WIXOSSのデッキ構築ツール',
        start_url: '/',
        display: 'standalone',
        background_color: '#18181b',
        theme_color: '#f97316',
        icons: [
          {
            src: '/wixdex.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
        runtimeCaching: [
          // R2 カード画像 — PUBLIC_CARD_IMAGE_BASE_URL のホスト名に合わせて有効化
          // {
          //   urlPattern: ({ url }) => url.hostname === 'images.<独自ドメイン>',
          //   handler: 'CacheFirst',
          //   options: {
          //     cacheName: 'card-images-v1',
          //     expiration: { maxEntries: 1500, maxAgeSeconds: 60 * 60 * 24 * 180 },
          //   },
          // },
          {
            urlPattern: /\/assets\/cards_json\/.*\.json$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'card-data-v1',
              expiration: { maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkOnly',
          },
        ],
        navigateFallbackDenylist: [/^\/api\//, /^\/login/, /^\/signup/, /^\/auth\//],
      },
    }),
  ],
});
