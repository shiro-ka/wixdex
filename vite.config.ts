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
      // SvelteKitでは自動injectが効かないため +layout.svelte で virtual:pwa-register を明示登録する。
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
        // OS の自動回転設定に従う（横レイアウトも活かす）。
        // 「基本回らない・回したいとき回せる」は端末側の自動回転トグルで実現する。
        orientation: 'any',
        categories: ['games', 'utilities'],
        background_color: '#18181b',
        // ステータスバー/ナビバー色にも使われる。ダークアプリなので暗色で統一（オレンジは画面内のアクセントに留める）。
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
          // ⚠️ カード画像(R2)は SW で握らない（あえてルールを書かない＝SW素通り）。
          // 症状: TWA/PWA でモーダル画像がオンライン時だけ遅く、機内モードにすると速かった。
          // ＝SWがオンライン時に画像取得を遅延させていた（CacheFirstでも online で network に行く挙動）。
          // 一方プレーンなブラウザは速い＝ブラウザのネイティブHTTPキャッシュ経路は速い。
          // R2に immutable Cache-Control を焼いた今、ネイティブキャッシュだけで完璧に効くので、
          // SWを通さずブラウザに任せる方が速い（速いブラウザと同じ経路になる）。
          {
            // カードDBは数MB。SWRだと毎回裏で再DLしてしまうので CacheFirst で再DLを止める。
            // 新セットは新URL=キャッシュミスで必ず取得される。既存ファイルの訂正を即反映したいときは
            // cacheName を card-data-v3, v4… と上げてクライアントに再取得させる。
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
        // SSR/サーバー必須ルートは SPA シェルへフォールバックさせない。
        // (/@… = 公開プロフィール/共有デッキ, /settings = 認証必須, /login = フォームアクション)
        navigateFallbackDenylist: [/^\/api\//, /^\/login/, /^\/settings/, /^\/@/],
      },
    }),
  ],
});
