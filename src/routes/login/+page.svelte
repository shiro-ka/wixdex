<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { startBlueskyAuth } from '$lib/utils/blueskyAuthClient';

  let { form, data }: { form: ActionData; data: PageData } = $props();

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
</script>

<svelte:head>
  <title>ログイン — wixdex</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-gray-950 p-4">
  <div class="w-full max-w-sm rounded-xl bg-gray-900 p-8 shadow-xl">
    <h1 class="mb-6 text-2xl font-bold text-white">ログイン</h1>

    {#if data.oauthError}
      <p class="mb-4 rounded-lg bg-red-900/50 px-4 py-3 text-sm text-red-300">{data.oauthError}</p>
    {/if}

    {#if form?.error}
      <p class="mb-4 rounded-lg bg-red-900/50 px-4 py-3 text-sm text-red-300">{form.error}</p>
    {/if}

    <form method="POST" class="space-y-4">
      <div>
        <label for="email" class="mb-1 block text-sm text-gray-300">メールアドレス</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          class="w-full rounded-lg bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label for="password" class="mb-1 block text-sm text-gray-300">パスワード</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          class="w-full rounded-lg bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        class="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-500 active:bg-blue-700"
      >
        ログイン
      </button>
    </form>

    <div class="my-6 flex items-center gap-3">
      <div class="h-px flex-1 bg-gray-700"></div>
      <span class="text-sm text-gray-500">または</span>
      <div class="h-px flex-1 bg-gray-700"></div>
    </div>

    <div class="space-y-3">
      <div>
        <label for="bluesky-handle" class="mb-1 block text-sm text-gray-300">Bluesky ハンドル</label>
        <input
          id="bluesky-handle"
          type="text"
          bind:value={blueskyHandle}
          placeholder="you.bsky.social"
          class="w-full rounded-lg bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          onkeydown={(e) => e.key === 'Enter' && loginWithBluesky()}
        />
      </div>
      {#if blueskyError}
        <p class="text-sm text-red-400">{blueskyError}</p>
      {/if}
      <button
        type="button"
        onclick={loginWithBluesky}
        disabled={blueskyLoading}
        class="w-full rounded-lg bg-sky-600 py-2 font-semibold text-white hover:bg-sky-500 disabled:opacity-50 active:bg-sky-700"
      >
        {blueskyLoading ? '接続中...' : 'Bluesky でログイン'}
      </button>
    </div>

    <p class="mt-6 text-center text-sm text-gray-400">
      アカウントをお持ちでない方は
      <a href="/signup" class="text-blue-400 hover:underline">新規登録</a>
    </p>
  </div>
</main>
