<script lang="ts">
  import type { PageData } from './$types';
  import { startBlueskyAuth } from '$lib/utils/blueskyAuthClient';
  import IconDice from '@tabler/icons-svelte/icons/dice-5';
  import { randomUsername } from '$lib/utils/atName';
  import { untrack } from 'svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { logout } from '$lib/utils/logout';
  import { ctaOutline } from '$lib/styles';
  import clsx from 'clsx';

  let { data, form }: { data: PageData; form: unknown } = $props();

  const f = $derived(form as { error?: string; success?: boolean; action?: string } | null);

  // メアド勢のみ username を編集可。pure-bsky勢(emailなし)はハンドルが固定URL。
  const canEditUsername = $derived(!!data.user.email);
  let username = $state(untrack(() => data.user.username ?? ''));

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

  const inputClass =
    'w-full rounded-lg bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70 transition';
</script>

<svelte:head>
  <title>設定 — wixdex</title>
</svelte:head>

<main class="min-h-dvh bg-zinc-900 text-white">
  <PageHeader />

  <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
    <h1 class="mb-6 text-2xl font-bold sm:text-3xl">設定</h1>

    <div class="grid items-start gap-4 lg:grid-cols-2">
    <!-- アカウント概要 -->
    <div class="rounded-xl border border-gray-600/30 bg-zinc-600/10 p-5">
      <p class="text-sm text-zinc-400">表示名</p>
      <p class="text-white">{data.user.displayName}</p>
      {#if data.user.email}
        <p class="mt-2 text-sm text-zinc-400">メール: <span class="text-zinc-300">{data.user.email}</span></p>
      {/if}
      {#if data.user.blueskyHandle}
        <p class="mt-1 text-sm text-zinc-400">
          Bluesky: <a href="https://bsky.app/profile/{data.user.blueskyHandle}" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300">@{data.user.blueskyHandle}</a>
        </p>
      {/if}
    </div>

    <!-- ユーザー名 / ページURL -->
    <section class="rounded-xl border border-gray-600/30 bg-zinc-600/10 p-5">
      <h2 class="mb-3 text-lg font-semibold">ページURL</h2>
      {#if canEditUsername}
        {#if f?.action === 'changeUsername'}
          {#if f?.error}
            <p class="mb-3 text-sm text-red-400">{f.error}</p>
          {:else if f?.success}
            <p class="mb-3 text-sm text-green-400">ユーザー名を変更しました。</p>
          {/if}
        {/if}
        <form method="POST" action="?/changeUsername" class="space-y-2">
          <div class="flex gap-2">
            <div class="flex flex-1 items-center rounded-lg bg-zinc-800 focus-within:ring-2 focus-within:ring-orange-500/70">
              <span class="pl-3 text-zinc-500">/@</span>
              <input
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
          <p class="text-xs text-zinc-500">英小文字・数字・ハイフン・アンダースコア。変更すると古いURLは無効になります。</p>
          <button type="submit" class={clsx(ctaOutline, 'px-4 py-2 text-sm font-semibold')}>
            保存する
          </button>
        </form>
      {:else if data.user.blueskyHandle}
        <p class="text-sm text-zinc-300">
          あなたのページURLは Bluesky ハンドルです:
          <span class="text-white">/@{data.user.blueskyHandle}</span>
        </p>
        <p class="mt-1 text-xs text-zinc-500">ハンドルの変更は Bluesky 側で行えます。</p>
      {/if}
    </section>

    {#if data.user.email}
      <section class="rounded-xl border border-gray-600/30 bg-zinc-600/10 p-5">
        <h2 class="mb-3 text-lg font-semibold">パスワード変更</h2>
        {#if f?.action === 'changePassword'}
          {#if f?.error}
            <p class="mb-3 text-sm text-red-400">{f.error}</p>
          {:else if f?.success}
            <p class="mb-3 text-sm text-green-400">パスワードを変更しました。</p>
          {/if}
        {/if}
        <form method="POST" action="?/changePassword" class="space-y-3">
          <div>
            <label for="currentPassword" class="mb-1 block text-sm text-zinc-300">現在のパスワード</label>
            <input id="currentPassword" name="currentPassword" type="password" required class={inputClass} />
          </div>
          <div>
            <label for="newPassword" class="mb-1 block text-sm text-zinc-300">新しいパスワード（8〜128文字）</label>
            <input id="newPassword" name="newPassword" type="password" required minlength="8" class={inputClass} />
          </div>
          <button type="submit" class={clsx(ctaOutline, 'px-4 py-2 text-sm font-semibold')}>
            変更する
          </button>
        </form>
      </section>
    {/if}

    <section class="rounded-xl border border-gray-600/30 bg-zinc-600/10 p-5">
      <h2 class="mb-3 text-lg font-semibold">Bluesky 連携</h2>
      {#if f?.action === 'unlinkBluesky'}
        {#if f?.error}
          <p class="mb-3 text-sm text-red-400">{f.error}</p>
        {:else if f?.success}
          <p class="mb-3 text-sm text-green-400">Bluesky 連携を解除しました。</p>
        {/if}
      {/if}
      {#if data.user.blueskyHandle}
        <p class="mb-3 text-sm text-zinc-300">@{data.user.blueskyHandle} と連携中</p>
        <form method="POST" action="?/unlinkBluesky">
          <button type="submit" class="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
            連携解除
          </button>
        </form>
      {:else}
        <div class="space-y-3">
          <input type="text" bind:value={blueskyHandle} placeholder="you.bsky.social" class={inputClass} />
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
    </div>

    <button type="button" onclick={logout}
      class="mt-6 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-700">
      ログアウト
    </button>
  </div>
</main>
