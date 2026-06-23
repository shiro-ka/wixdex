<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { startBlueskyAuth } from '$lib/utils/blueskyAuthClient';
  import IconBrandBluesky from '@tabler/icons-svelte/icons/brand-bluesky';
  import IconDice from '@tabler/icons-svelte/icons/dice-5';
  import { untrack } from 'svelte';
  import { randomUsername } from '$lib/utils/atName';

  let { form, data }: { form: ActionData; data: PageData } = $props();

  // ログイン / 新規登録 / パスワード再設定 の切替。フォームが返したモードで初期タブを開く（初期値のみ参照）。
  let mode = $state<'login' | 'register' | 'forgot'>(
    untrack(() =>
      form?.mode === 'register' ? 'register' : form?.mode === 'forgot' ? 'forgot' : 'login',
    ),
  );

  let username = $state('');

  let blueskyHandle = $state('');
  let blueskyLoading = $state(false);
  let blueskyError = $state('');
  let showHandleInput = $state(false); // 別PDS用のハンドル入力（通常は隠す）

  async function loginWithBluesky(handle?: string) {
    blueskyLoading = true;
    blueskyError = '';
    const result = await startBlueskyAuth(handle);
    if (!result.ok) blueskyError = result.error;
    blueskyLoading = false;
  }

  const inputClass =
    'w-full rounded-lg bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70 transition';
</script>

<svelte:head>
  <title>{mode === 'login' ? 'ログイン' : '新規登録'} — wixdex</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-zinc-900 p-4">
  <div class="grid w-full max-w-4xl min-h-[45rem] overflow-hidden rounded-2xl border border-gray-600/30 bg-zinc-600/10 shadow-xl lg:grid-cols-2">
    <!-- 左: ブランディング（PCのみ。zincダーク、オレンジは差し色のみ） -->
    <div class="hidden flex-col justify-between border-r border-gray-600/30 bg-zinc-600/10 p-10 lg:flex">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">wix<span class="text-orange-500">dex</span></h1>
        <p class="mt-3 text-zinc-400">WIXOSS デッキビルダー</p>
      </div>
      <ul class="space-y-2.5 text-sm text-zinc-400">
        <li class="flex items-center gap-2"><span class="text-orange-500">▸</span> カードを集めてデッキを構築</li>
        <li class="flex items-center gap-2"><span class="text-orange-500">▸</span> デッキを公開してシェア</li>
        <li class="flex items-center gap-2"><span class="text-orange-500">▸</span> Bluesky 連携でかんたんログイン</li>
      </ul>
    </div>

    <!-- 右: 認証フォーム -->
    <div class="p-7 sm:p-10">
    <h1 class="mb-5 text-center text-xl font-bold text-white lg:hidden">wixdex</h1>

    <!-- タブ切替（再設定モードでは隠す） -->
    {#if mode !== 'forgot'}
      <div class="mb-6 flex rounded-lg bg-zinc-800/60 p-1">
        <button
          type="button"
          onclick={() => (mode = 'login')}
          class="flex-1 rounded-md py-2 text-sm font-medium transition-colors {mode === 'login'
            ? 'bg-zinc-700 text-white'
            : 'text-zinc-400 hover:text-zinc-200'}"
        >
          ログイン
        </button>
        <button
          type="button"
          onclick={() => (mode = 'register')}
          class="flex-1 rounded-md py-2 text-sm font-medium transition-colors {mode === 'register'
            ? 'bg-zinc-700 text-white'
            : 'text-zinc-400 hover:text-zinc-200'}"
        >
          新規登録
        </button>
      </div>
    {/if}

    {#if data.oauthError}
      <p class="mb-4 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300">{data.oauthError}</p>
    {/if}
    {#if data.resetDone}
      <p class="mb-4 rounded-lg bg-green-900/40 px-4 py-3 text-sm text-green-300">
        パスワードを再設定しました。新しいパスワードでログインしてください。
      </p>
    {/if}
    {#if form && 'error' in form && form.error}
      <p class="mb-4 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300">{form.error}</p>
    {/if}
    {#if form && form.mode === 'forgot' && 'success' in form && form.success}
      <p class="mb-4 rounded-lg bg-green-900/40 px-4 py-3 text-sm text-green-300">
        入力されたメールアドレスが登録されていれば、再設定用のリンクを送信しました。メールをご確認ください。
      </p>
    {/if}

    {#if mode === 'forgot'}
      <!-- パスワード再設定: メールアドレス入力 -->
      <p class="mb-4 text-sm text-zinc-400">
        登録したメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
      </p>
      <form method="POST" action="?/forgotPassword" class="space-y-4">
        <div>
          <label for="forgot-email" class="mb-1 block text-sm text-zinc-300">メールアドレス</label>
          <input
            id="forgot-email"
            name="email"
            type="email"
            required
            autocomplete="email"
            class={inputClass}
            placeholder="you@example.com"
          />
        </div>
        <button
          type="submit"
          class="w-full rounded-lg bg-orange-500 py-2.5 font-semibold text-white transition-colors hover:bg-orange-600 active:bg-orange-700"
        >
          再設定リンクを送る
        </button>
      </form>
      <button
        type="button"
        onclick={() => (mode = 'login')}
        class="mt-4 block w-full text-center text-sm text-zinc-400 transition-colors hover:text-zinc-200"
      >
        ← ログインに戻る
      </button>
    {:else}
    <!-- メール認証フォーム。action でログイン/登録を切替 -->
    <form method="POST" action="?/{mode}" class="space-y-4">
      {#if mode === 'register'}
        <div>
          <label for="displayName" class="mb-1 block text-sm text-zinc-300">表示名</label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            maxlength="64"
            class={inputClass}
            placeholder="あなたの名前"
          />
        </div>
        <div>
          <label for="username" class="mb-1 block text-sm text-zinc-300">
            ユーザー名 <span class="text-zinc-500">(URLになります: /@…)</span>
          </label>
          <div class="flex gap-2">
            <div class="flex flex-1 items-center rounded-lg bg-zinc-800 focus-within:ring-2 focus-within:ring-orange-500/70">
              <span class="pl-3 text-zinc-500">@</span>
              <input
                id="username"
                name="username"
                type="text"
                required
                bind:value={username}
                autocapitalize="none"
                autocomplete="off"
                spellcheck="false"
                class="w-full bg-transparent px-1.5 py-2 text-white placeholder-zinc-500 focus:outline-none"
                placeholder="your_name"
              />
            </div>
            <button
              type="button"
              onclick={() => (username = randomUsername())}
              title="おまかせ生成"
              class="flex shrink-0 items-center justify-center rounded-lg bg-zinc-800 px-3 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
            >
              <IconDice class="h-5 w-5" />
            </button>
          </div>
          <p class="mt-1 text-xs text-zinc-500">英小文字・数字・ハイフン・アンダースコア（後から変更できます）</p>
        </div>
      {/if}
      <div>
        <label for="email" class="mb-1 block text-sm text-zinc-300">メールアドレス</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autocomplete="email"
          class={inputClass}
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label for="password" class="mb-1 block text-sm text-zinc-300">
          パスワード{mode === 'register' ? '（8〜128文字）' : ''}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minlength={mode === 'register' ? 8 : undefined}
          autocomplete={mode === 'register' ? 'new-password' : 'current-password'}
          class={inputClass}
        />
      </div>
      <button
        type="submit"
        class="w-full rounded-lg bg-orange-500 py-2.5 font-semibold text-white transition-colors hover:bg-orange-600 active:bg-orange-700"
      >
        {mode === 'login' ? 'ログイン' : 'アカウント作成'}
      </button>
    </form>

    {#if mode === 'login'}
      <button
        type="button"
        onclick={() => (mode = 'forgot')}
        class="mt-3 block w-full text-center text-sm text-zinc-400 transition-colors hover:text-zinc-200"
      >
        パスワードをお忘れですか？
      </button>
    {/if}
    {/if}

    {#if mode !== 'forgot'}
    <div class="my-6 flex items-center gap-3">
      <div class="h-px flex-1 bg-zinc-800"></div>
      <span class="text-xs text-zinc-500">または</span>
      <div class="h-px flex-1 bg-zinc-800"></div>
    </div>

    <!-- Bluesky（ログイン・登録共通。bsky.social へ直行＝ハンドル入力不要） -->
    <div class="space-y-3">
      <button
        type="button"
        onclick={() => loginWithBluesky()}
        disabled={blueskyLoading}
        class="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 py-2.5 font-semibold text-white transition-colors hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50"
      >
        <IconBrandBluesky class="h-5 w-5" />
        {blueskyLoading ? '接続中...' : 'Bluesky で続ける'}
      </button>
      {#if blueskyError}
        <p class="text-sm text-red-400">{blueskyError}</p>
      {/if}

      <!-- bsky.social 以外のPDS利用者向け（普段は隠す） -->
      <button
        type="button"
        onclick={() => (showHandleInput = !showHandleInput)}
        class="block w-full text-center text-xs text-zinc-500 transition-colors hover:text-zinc-300"
      >
        別のサーバー(PDS)のアカウント
      </button>
      {#if showHandleInput}
        <div class="space-y-2">
          <input
            id="bluesky-handle"
            type="text"
            bind:value={blueskyHandle}
            placeholder="you.example.com"
            autocapitalize="none"
            autocomplete="off"
            spellcheck="false"
            class={inputClass}
            onkeydown={(e) => e.key === 'Enter' && loginWithBluesky(blueskyHandle)}
          />
          <button
            type="button"
            onclick={() => loginWithBluesky(blueskyHandle)}
            disabled={blueskyLoading}
            class="w-full rounded-lg bg-zinc-700 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600 disabled:opacity-50"
          >
            このハンドルで続ける
          </button>
        </div>
      {/if}
    </div>
    {/if}
    </div>
  </div>
</main>
