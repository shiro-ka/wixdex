import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// 単体テスト用の最小構成。SvelteKit/PWA プラグインは読み込まず、
// $lib エイリアスだけ手動解決する（純粋関数のテストに必要十分）。
export default defineConfig({
  resolve: {
    alias: {
      $lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
  },
});
