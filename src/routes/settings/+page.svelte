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

<main class="min-h-dvh">
  <PageHeader />

  <div data-suisou-layout="stack container gap-4" class="page">
    <h1 data-suisou-text="s24 md:s28 w700">設定</h1>

    <div class="cols">
      <!-- アカウント概要 -->
      <div data-suisou-surface="panel" data-suisou-layout="stack gap-1">
        <p data-suisou-text="sub">表示名</p>
        <p>{data.user.displayName}</p>
        {#if data.user.email}
          <p data-suisou-text="sub">
            メール: <span data-suisou-text="sub">{data.user.email}</span>
          </p>
        {/if}
        {#if data.user.blueskyHandle}
          <p data-suisou-text="sub">
            Bluesky: <a
              href="https://bsky.app/profile/{data.user.blueskyHandle}"
              target="_blank"
              rel="noopener noreferrer"
              data-suisou-link>@{data.user.blueskyHandle}</a
            >
          </p>
        {/if}
      </div>

      <!-- ユーザー名 / ページURL -->
      <section data-suisou-surface="panel" data-suisou-layout="stack gap-2">
        <h2 data-suisou-text="s16 w700">ページURL</h2>
        {#if canEditUsername}
          {#if f?.action === 'changeUsername'}
            {#if f?.error}
              <p data-suisou-text="error">{f.error}</p>
            {:else if f?.success}
              <p data-suisou-text="success">ユーザー名を変更しました。</p>
            {/if}
          {/if}
          <form method="POST" action="?/changeUsername" data-suisou-layout="stack gap-2">
            <div class="flex gap-2">
              <div class="flex-1" data-suisou-button-group>
                <span data-suisou-affix>/@</span>
                <input
                  name="username"
                  type="text"
                  required
                  bind:value={username}
                  autocapitalize="none"
                  autocomplete="off"
                  spellcheck="false"
                  data-suisou-field
                  placeholder="your_name"
                />
              </div>
              <button
                type="button"
                onclick={() => (username = randomUsername())}
                title="おまかせ生成"
                data-suisou-button="plain icon"
              >
                <IconDice />
              </button>
            </div>
            <p data-suisou-text="sub s12">
              英小文字・数字・ハイフン・アンダースコア。変更すると古いURLは無効になります。
            </p>
            <button type="submit" data-suisou-button="outline"> 保存する </button>
          </form>
        {:else if data.user.blueskyHandle}
          <p data-suisou-text="sub">
            あなたのページURLは Bluesky ハンドルです:
            <span>/@{data.user.blueskyHandle}</span>
          </p>
          <p data-suisou-text="sub s12">ハンドルの変更は Bluesky 側で行えます。</p>
        {/if}
      </section>

      {#if data.user.email}
        <section data-suisou-surface="panel" data-suisou-layout="stack gap-2">
          <h2 data-suisou-text="s16 w700">パスワード変更</h2>
          {#if f?.action === 'changePassword'}
            {#if f?.error}
              <p data-suisou-text="error">{f.error}</p>
            {:else if f?.success}
              <p data-suisou-text="success">パスワードを変更しました。</p>
            {/if}
          {/if}
          <form method="POST" action="?/changePassword" data-suisou-layout="stack gap-2">
            <div data-suisou-layout="stack gap-1">
              <label for="currentPassword" data-suisou-text="sub">現在のパスワード</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                data-suisou-field="block"
              />
            </div>
            <div data-suisou-layout="stack gap-1">
              <label for="newPassword" data-suisou-text="sub">新しいパスワード（8〜128文字）</label
              >
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minlength="8"
                data-suisou-field="block"
              />
            </div>
            <button type="submit" data-suisou-button="outline"> 変更する </button>
          </form>
        </section>
      {/if}

      <section data-suisou-surface="panel" data-suisou-layout="stack gap-2">
        <h2 data-suisou-text="s16 w700">Bluesky 連携</h2>
        {#if f?.action === 'unlinkBluesky'}
          {#if f?.error}
            <p data-suisou-text="error">{f.error}</p>
          {:else if f?.success}
            <p data-suisou-text="success">Bluesky 連携を解除しました。</p>
          {/if}
        {/if}
        {#if data.user.blueskyHandle}
          <p data-suisou-text="sub">@{data.user.blueskyHandle} と連携中</p>
          <form method="POST" action="?/unlinkBluesky">
            <button type="submit" data-suisou-button="danger">連携解除</button>
          </form>
        {:else}
          <div data-suisou-layout="stack gap-2">
            <input
              type="text"
              bind:value={blueskyHandle}
              placeholder="you.bsky.social"
              data-suisou-field="block"
            />
            {#if blueskyLinkError}
              <p data-suisou-text="error">{blueskyLinkError}</p>
            {/if}
            <button
              type="button"
              onclick={linkBluesky}
              disabled={blueskyLoading}
              data-suisou-button="outline"
            >
              {blueskyLoading ? '接続中...' : 'Bluesky を連携する'}
            </button>
          </div>
        {/if}
      </section>
    </div>

    <button type="button" data-suisou-button="plain" onclick={logout}>
      ログアウト
    </button>
  </div>
</main>

<style>
  .page {
    --suisou-measure: 56rem;
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
