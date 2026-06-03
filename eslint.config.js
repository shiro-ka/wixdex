import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import svelteConfig from './svelte.config.js';

export default ts.config(
  {
    ignores: [
      '.svelte-kit/',
      'build/',
      'dist/',
      '.wrangler/',
      'node_modules/',
      'static/',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // TypeScript が未定義参照を見るので no-undef は無効化（型/グローバルの誤検知回避）
      'no-undef': 'off',
      // _ 始まりの引数・変数は意図的な未使用として許容
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // 当アプリは Set/Map を「新インスタンス再代入」で反応させる方式を採用しており、
      // 非リアクティブなローカル Map にも誤検知が出るため無効化（状態ストア移行時に再検討）。
      'svelte/prefer-svelte-reactivity': 'off',
      // base path を使わない静的リンクのみ。resolve() の強制は不要。
      'svelte/no-navigation-without-resolve': 'off',
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        extraFileExtensions: ['.svelte'],
        svelteConfig,
      },
    },
  },
);
