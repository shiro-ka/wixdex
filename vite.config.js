import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/wixdex/',
  plugins: [
    react(),
    tailwindcss(),
    svgr(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['wixdex.png', 'assets/**/*'],
      manifest: {
        name: 'wixdex - WIXOSSデッキビルダー',
        short_name: 'wixdex',
        description: 'WIXOSSのデッキ構築ツール',
        theme_color: '#f97316',
        background_color: '#18181b',
        display: 'standalone',
        start_url: '/wixdex/',
        scope: '/wixdex/',
        icons: [
          {
            src: '/wixdex/wixdex.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg}'],
        globIgnores: ['**/assets/cards_img/**', '**/assets/cards_json/**'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
        runtimeCaching: [
          {
            urlPattern: /\/assets\/cards_json\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'card-data-cache',
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7日間
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/assets\/cards_img\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'card-images-cache',
              expiration: {
                maxEntries: 1000,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90日（カード画像は変更されないので長く保持）
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
});
