import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
  plugins: [
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
          {
            // カード画像(R2)。CacheFirst で一度取得したら以降はキャッシュから即配信。
            // R2は Vary: Origin を付けるので ignoreVary で URL のみでマッチ。
            // R2側に immutable Cache-Control も焼き済み（再検証を止める）。
            urlPattern: ({ url }) => url.hostname === 'pub-eaed63f9ee4b4b0e806344bd5b464e65.r2.dev',
            handler: 'CacheFirst',
            options: {
              cacheName: 'card-images-v2',
              expiration: { maxEntries: 1500, maxAgeSeconds: 60 * 60 * 24 * 180 },
              matchOptions: { ignoreVary: true },
            },
          },
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
        // ★ページ（ナビゲーション）は常にネットから取る。SW でキャッシュしない。
        //
        //   もとは navigateFallback（既定の '/'）が効いていて、SW が「/ へのアクセスは
        //   キャッシュ済みの / を返す」ルートを登録していた。ところが globPatterns は
        //   js/css/画像しか拾っておらず、HTML はキャッシュに1件も入らない
        //   （ビルド時に prerendered/**/*.{html,json} が一致しないという警告が出ていた）。
        //   Workbox はキャッシュに無い URL を渡されると例外を投げるので、
        //   **新しい SW がインストールに失敗し、古い SW が居座って更新が永久に届かなくなる**。
        //   実際 dev も本番も、配信中の sw.js は precache 46件すべてが非 HTML だった。
        //
        //   ページを常にネットから取れば、この矛盾ごと消える。JS/CSS・カード画像・
        //   カードDB のキャッシュは残るので体感速度は落ちない。完全オフラインでの
        //   起動だけができなくなる（しろさま判断、2026-08-21）。
        navigateFallback: null,
      },
    }),
  ],
});
