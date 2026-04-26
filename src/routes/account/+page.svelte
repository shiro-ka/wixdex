<script lang="ts">
  import type { PageData } from './$types';
  import { startBlueskyAuth } from '$lib/utils/blueskyAuthClient';

  let { data, form }: { data: PageData; form: unknown } = $props();

  // Narrow the opaque form result to a known shape
  const f = $derived(form as { error?: string; success?: boolean; action?: string } | null);

  let blueskyHandle = $state('');
  let blueskyLoading = $state(false);
  let blueskyLinkError = $state('');

  async function linkBluesky() {
    blueskyLoading = true;
    blueskyLinkError = '';
    const result = await startBlueskyAuth(blueskyHandle);
    if (!result.ok) blueskyLinkError = result.error;
    blueskyLoading = false;
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }
</script>

<svelte:head>
  <title>アカウント — wixdex</title>
</svelte:head>

<main class="mx-auto max-w-lg p-6">
  <h1 class="mb-6 text-2xl font-bold text-white">アカウント設定</h1>

  <div class="mb-4 rounded-xl bg-gray-900 p-6">
    <p class="text-sm text-gray-400">表示名</p>
    <p class="text-white">{data.user.displayName}</p>
    {#if data.user.email}
      <p class="mt-1 text-sm text-gray-400">メール: {data.user.email}</p>
    {/if}
    {#if data.user.blueskyHandle}
      <p class="mt-1 text-sm text-gray-400">Bluesky: @{data.user.blueskyHandle}</p>
    {/if}
  </div>

  {#if data.user.email}
    <section class="mb-6 rounded-xl bg-gray-900 p-6">
      <h2 class="mb-4 text-lg font-semibold text-white">パスワード変更</h2>
      {#if f?.action === 'changePassword'}
        {#if f?.error}
          <p class="mb-3 text-sm text-red-400">{f.error}</p>
        {:else if f?.success}
          <p class="mb-3 text-sm text-green-400">パスワードを変更しました。</p>
        {/if}
      {/if}
      <form method="POST" action="?/changePassword" class="space-y-3">
        <div>
          <label for="currentPassword" class="mb-1 block text-sm text-gray-300">現在のパスワード</label>
          <input id="currentPassword" name="currentPassword" type="password" required
            class="w-full rounded-lg bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label for="newPassword" class="mb-1 block text-sm text-gray-300">新しいパスワード（8文字以上）</label>
          <input id="newPassword" name="newPassword" type="password" required minlength="8"
            class="w-full rounded-lg bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit"
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
          変更する
        </button>
      </form>
    </section>
  {/if}

  <section class="mb-6 rounded-xl bg-gray-900 p-6">
    <h2 class="mb-4 text-lg font-semibold text-white">Bluesky 連携</h2>
    {#if f?.action === 'unlinkBluesky'}
      {#if f?.error}
        <p class="mb-3 text-sm text-red-400">{f.error}</p>
      {:else if f?.success}
        <p class="mb-3 text-sm text-green-400">Bluesky 連携を解除しました。</p>
      {/if}
    {/if}
    {#if data.user.blueskyHandle}
      <p class="mb-3 text-sm text-gray-300">@{data.user.blueskyHandle} と連携中</p>
      <form method="POST" action="?/unlinkBluesky">
        <button type="submit"
          class="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
          連携解除
        </button>
      </form>
    {:else}
      <div class="space-y-3">
        <input type="text" bind:value={blueskyHandle} placeholder="you.bsky.social"
          class="w-full rounded-lg bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500" />
        {#if blueskyLinkError}
          <p class="text-sm text-red-400">{blueskyLinkError}</p>
        {/if}
        <button type="button" onclick={linkBluesky} disabled={blueskyLoading}
          class="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50">
          {blueskyLoading ? '接続中...' : 'Bluesky を連携する'}
        </button>
      </div>
    {/if}
  </section>

  <button type="button" onclick={logout}
    class="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-700">
    ログアウト
  </button>
</main>
