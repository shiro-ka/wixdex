<script lang="ts">
  import type { PageData } from './$types';
  import { startBlueskyAuth } from '$lib/utils/blueskyAuthClient';
  import IconDice from '@tabler/icons-svelte/icons/dice-5';
  import { randomUsername } from '$lib/utils/atName';
  import { untrack } from 'svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import { logout } from '$lib/utils/logout';

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
</script>

<svelte:head>
  <title>設定 — wixdex</title>
</svelte:head>

<main data-suisou="min-screen">
  <PageHeader />

  <div data-suisou-layout="stack gap-4" data-suisou="container-m" class="page">
    <h1 data-suisou-text="fs-24 s:fs-28 fw-700">設定</h1>

    <div class="cols">
      <!-- アカウント概要 -->
      <div data-suisou-tray data-suisou-layout="stack gap-1">
        <p data-suisou="sub">表示名</p>
        <p>{data.user.displayName}</p>
        {#if data.user.email}
          <p data-suisou="sub">
            メール: <span data-suisou="sub">{data.user.email}</span>
          </p>
        {/if}
        {#if data.user.blueskyHandle}
          <p data-suisou="sub">
            Bluesky: <a
              href="https://bsky.app/profile/{data.user.blueskyHandle}"
              target="_blank"
              rel="noopener noreferrer"
              data-suisou-text="link">@{data.user.blueskyHandle}</a
            >
          </p>
        {/if}
      </div>

      <!-- ユーザー名 / ページURL -->
      <section data-suisou-tray data-suisou-layout="stack gap-2">
        <h2 data-suisou-text="fs-16 fw-700">ページURL</h2>
        {#if canEditUsername}
          {#if f?.action === 'changeUsername'}
            {#if f?.error}
              <p data-suisou="error">{f.error}</p>
            {:else if f?.success}
              <p data-suisou="success">ユーザー名を変更しました。</p>
            {/if}
          {/if}
          <form method="POST" action="?/changeUsername" data-suisou-layout="stack gap-2">
            <div data-suisou-layout="row">
              <div data-suisou-layout="grow" data-suisou-item="field">
                <span>/@</span>
                <input
                  name="username"
                  type="text"
                  required
                  bind:value={username}
                  autocapitalize="none"
                  autocomplete="off"
                  spellcheck="false"
                  placeholder="your_name"
                />
              </div>
              <button
                type="button"
                onclick={() => (username = randomUsername())}
                title="おまかせ生成"
                data-suisou-button="outline icon"
              >
                <IconDice />
              </button>
            </div>
            <p data-suisou-text="fs-12" data-suisou="sub">
              英小文字・数字・ハイフン・アンダースコア。変更すると古いURLは無効になります。
            </p>
            <button type="submit" data-suisou-button="outline" data-suisou="accent"> 保存する </button>
          </form>
        {:else if data.user.blueskyHandle}
          <p data-suisou="sub">
            あなたのページURLは Bluesky ハンドルです:
            <span>/@{data.user.blueskyHandle}</span>
          </p>
          <p data-suisou-text="fs-12" data-suisou="sub">ハンドルの変更は Bluesky 側で行えます。</p>
        {/if}
      </section>

      {#if data.user.email}
        <section data-suisou-tray data-suisou-layout="stack gap-2">
          <h2 data-suisou-text="fs-16 fw-700">パスワード変更</h2>
          {#if f?.action === 'changePassword'}
            {#if f?.error}
              <p data-suisou="error">{f.error}</p>
            {:else if f?.success}
              <p data-suisou="success">パスワードを変更しました。</p>
            {/if}
          {/if}
          <form method="POST" action="?/changePassword" data-suisou-layout="stack gap-2">
            <div data-suisou-layout="stack gap-1">
              <label for="currentPassword" data-suisou="sub">現在のパスワード</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                data-suisou="w-full"
              />
            </div>
            <div data-suisou-layout="stack gap-1">
              <label for="newPassword" data-suisou="sub">新しいパスワード（8〜128文字）</label
              >
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minlength="8"
                data-suisou="w-full"
              />
            </div>
            <button type="submit" data-suisou-button="outline" data-suisou="accent"> 変更する </button>
          </form>
        </section>
      {/if}

      <section data-suisou-tray data-suisou-layout="stack gap-2">
        <h2 data-suisou-text="fs-16 fw-700">Bluesky 連携</h2>
        {#if f?.action === 'unlinkBluesky'}
          {#if f?.error}
            <p data-suisou="error">{f.error}</p>
          {:else if f?.success}
            <p data-suisou="success">Bluesky 連携を解除しました。</p>
          {/if}
        {/if}
        {#if data.user.blueskyHandle}
          <p data-suisou="sub">@{data.user.blueskyHandle} と連携中</p>
          <form method="POST" action="?/unlinkBluesky">
            <button type="submit" data-suisou-button="outline" data-suisou="error">連携解除</button>
          </form>
        {:else}
          <div data-suisou-layout="stack gap-2">
            <input
              type="text"
              bind:value={blueskyHandle}
              placeholder="you.bsky.social"
              data-suisou="w-full"
            />
            {#if blueskyLinkError}
              <p data-suisou="error">{blueskyLinkError}</p>
            {/if}
            <button
              type="button"
              onclick={linkBluesky}
              disabled={blueskyLoading}
              data-suisou-button="outline"
              data-suisou="accent"
            >
              {blueskyLoading ? '接続中...' : 'Bluesky を連携する'}
            </button>
          </div>
        {/if}
      </section>
    </div>

    <button type="button" data-suisou-button="outline" onclick={logout}>
      ログアウト
    </button>
  </div>
</main>

<style>

  .page {
    padding: var(--suisou-space-4) var(--suisou-space-3);
  }
  /* ★2列の格子。Suisou の even は「子の数だけ列を作る」ので、
     **列数を固定する語が無い**（ここは4枚を2列に置きたい）。→ 申し送り */
  .cols {
    display: grid;
    align-items: start;
    gap: var(--suisou-space-3);
  }
  @media (width >= 1024px) {
    .cols {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
