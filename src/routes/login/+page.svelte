<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { startBlueskyAuth } from '$lib/utils/blueskyAuthClient';
  import IconBrandBluesky from '@tabler/icons-svelte/icons/brand-bluesky';
  import IconDice from '@tabler/icons-svelte/icons/dice-5';
  import { untrack } from 'svelte';
  import { randomUsername } from '$lib/utils/atName';

  let { form, data }: { form: ActionData; data: PageData } = $props();

  // ログイン / 新規登録 の切替。フォームがどちらかでエラーを返したらそのタブを開く（初期値のみ参照）。
  let mode = $state<'login' | 'register'>(
    untrack(() => (form?.mode === 'register' ? 'register' : 'login')),
  );

  let username = $state('');

  let blueskyHandle = $state('');
  let blueskyLoading = $state(false);
  let blueskyError = $state('');

  async function loginWithBluesky() {
    blueskyLoading = true;
    blueskyError = '';
    const result = await startBlueskyAuth(blueskyHandle);
    if (!result.ok) blueskyError = result.error;
    blueskyLoading = false;
  }

  const inputClass =
    'w-full rounded-lg bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70 transition';
</script>

<svelte:head>
  <title>{mode === 'login' ? 'ログイン' : '新規登録'} — wixdex</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
  <div class="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-7 shadow-xl">
    <h1 class="mb-5 text-center text-xl font-bold text-white">wixdex</h1>

    <!-- タブ切替 -->
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

    {#if data.oauthError}
      <p class="mb-4 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300">{data.oauthError}</p>
    {/if}
    {#if form?.error}
      <p class="mb-4 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300">{form.error}</p>
    {/if}

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
          パスワード{mode === 'register' ? '（8文字以上）' : ''}
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

    <div class="my-6 flex items-center gap-3">
      <div class="h-px flex-1 bg-zinc-800"></div>
      <span class="text-xs text-zinc-500">または</span>
      <div class="h-px flex-1 bg-zinc-800"></div>
    </div>

    <!-- Bluesky（ログイン・登録共通。OAuth側で新規/既存を吸収） -->
    <div class="space-y-3">
      <input
        id="bluesky-handle"
        type="text"
        bind:value={blueskyHandle}
        placeholder="you.bsky.social"
        autocomplete="off"
        class={inputClass}
        onkeydown={(e) => e.key === 'Enter' && loginWithBluesky()}
      />
      {#if blueskyError}
        <p class="text-sm text-red-400">{blueskyError}</p>
      {/if}
      <button
        type="button"
        onclick={loginWithBluesky}
        disabled={blueskyLoading}
        class="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 py-2.5 font-semibold text-white transition-colors hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50"
      >
        <IconBrandBluesky class="h-5 w-5" />
        {blueskyLoading ? '接続中...' : 'Bluesky で続ける'}
      </button>
    </div>
  </div>
</main>
