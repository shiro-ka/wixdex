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
        theme_color: '#f97316',
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
              cacheName: 'card-images-v1',
              expiration: { maxEntries: 1500, maxAgeSeconds: 60 * 60 * 24 * 180 },
            },
          },
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
        // SSR/サーバー必須ルートは SPA シェルへフォールバックさせない。
        // (/@… = 公開プロフィール/共有デッキ, /settings = 認証必須, /login = フォームアクション)
        navigateFallbackDenylist: [/^\/api\//, /^\/login/, /^\/settings/, /^\/@/],
      },
    }),
  ],
});
