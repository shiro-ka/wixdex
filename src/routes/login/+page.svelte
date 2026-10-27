<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import { startBlueskyAuth } from '$lib/utils/blueskyAuthClient';
  import IconBrandBluesky from '@tabler/icons-svelte/icons/brand-bluesky';
  import IconDice from '@tabler/icons-svelte/icons/dice-5';
  import { untrack } from 'svelte';
  import { randomUsername } from '$lib/utils/atName';

  let { form, data }: { form: ActionData; data: PageData } = $props();

  let mode = $state<'login' | 'register' | 'forgot'>(
    untrack(() =>
      form?.mode === 'register' ? 'register' : form?.mode === 'forgot' ? 'forgot' : 'login',
    ),
  );

  let username = $state('');

  let usernameStatus = $state<'idle' | 'checking' | 'ok' | 'taken'>('idle');
  let usernameMsg = $state('');
  let checkSeq = 0;

  function resetUsernameCheck() {
    usernameStatus = 'idle';
    usernameMsg = '';
    checkSeq++;
  }

  async function checkUsername() {
    const u = username.trim();
    if (!u) {
      resetUsernameCheck();
      return;
    }
    const seq = ++checkSeq;
    usernameStatus = 'checking';
    usernameMsg = '';
    try {
      const res = await fetch(`/api/username-check?u=${encodeURIComponent(u)}`);
      const data = (await res.json()) as { available: boolean; error?: string };
      if (seq !== checkSeq) return;
      if (data.available) {
        usernameStatus = 'ok';
        usernameMsg = 'このユーザー名は使えます';
      } else {
        usernameStatus = 'taken';
        usernameMsg = data.error ?? 'このユーザー名は使用できません。';
      }
    } catch {
      if (seq !== checkSeq) return;
      resetUsernameCheck();
    }
  }

  let blueskyHandle = $state('');
  let blueskyLoading = $state(false);
  let blueskyError = $state('');
  let showHandleInput = $state(false);

  async function loginWithBluesky(handle?: string) {
    blueskyLoading = true;
    blueskyError = '';
    const result = await startBlueskyAuth(handle);
    if (!result.ok) blueskyError = result.error;
    blueskyLoading = false;
  }
</script>

<svelte:head>
  <title>{mode === 'login' ? 'ログイン' : '新規登録'} — wixdex</title>
</svelte:head>

<main class="page" data-suisou-layout="row middle" data-suisou="min-screen">
  <div
    class="split"
    data-suisou-tray
    data-suisou-layout="grid gap-0"
  >
    <div
      data-suisou-layout="stack between"
      data-suisou="bd-end m>hidden" class="aside"
    >
      <div>
        <h1 class="brand-name" data-suisou-text="fs-28 fw-700">
          wix<span data-suisou="accent">dex</span>
        </h1>
        <p data-suisou="note">WIXOSS デッキビルダー</p>
      </div>
      <ul data-suisou-layout="stack" data-suisou="note">
        <li data-suisou-layout="row">
          <span data-suisou="accent">▸</span> カードを集めてデッキを構築
        </li>
        <li data-suisou-layout="row">
          <span data-suisou="accent">▸</span> デッキを公開してシェア
        </li>
        <li data-suisou-layout="row">
          <span data-suisou="accent">▸</span> Bluesky 連携でかんたんログイン
        </li>
      </ul>
    </div>

    <div data-suisou-layout="stack gap-3" class="form-col">
      <h1 data-suisou-text="fs-20 fw-700 center" data-suisou="m:hidden">wixdex</h1>

      {#if mode !== 'forgot'}
        <div data-suisou-tray data-suisou-layout="row gap-0">
          <button
            type="button"
            data-suisou-button
            data-suisou-layout="grow"
            aria-pressed={mode === 'login'}
            onclick={() => (mode = 'login')}
          >
            ログイン
          </button>
          <button
            type="button"
            data-suisou-button
            data-suisou-layout="grow"
            aria-pressed={mode === 'register'}
            onclick={() => (mode = 'register')}
          >
            新規登録
          </button>
        </div>
      {/if}

      {#if data.oauthError}
        <p data-suisou-item="notice" data-suisou="error" role="alert">
          {data.oauthError}
        </p>
      {/if}
      {#if data.resetDone}
        <p data-suisou-item="notice" data-suisou="success" role="status">
          パスワードを再設定しました。新しいパスワードでログインしてください。
        </p>
      {/if}
      {#if form && 'error' in form && form.error}
        <p data-suisou-item="notice" data-suisou="error" role="alert">{form.error}</p>
      {/if}
      {#if form && form.mode === 'forgot' && 'success' in form && form.success}
        <p data-suisou-item="notice" data-suisou="success" role="status">
          入力されたメールアドレスが登録されていれば、再設定用のリンクを送信しました。メールをご確認ください。
        </p>
      {/if}

      {#if mode === 'forgot'}
        <p data-suisou="note">
          登録したメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
        </p>
        <form method="POST" action="?/forgotPassword" data-suisou-layout="stack gap-3">
          <div data-suisou-layout="stack gap-1">
            <label for="forgot-email" data-suisou="note">メールアドレス</label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              required
              autocomplete="email"
              data-suisou="w-full"
              placeholder="you@example.com"
            />
          </div>
          <button type="submit" data-suisou-button="outline" data-suisou="accent w-full">再設定リンクを送る</button>
        </form>
        <button
          type="button"
          onclick={() => (mode = 'login')}
          class="back" data-suisou-text="center" data-suisou="note">
          ← ログインに戻る
        </button>
      {:else}
        <form method="POST" action="?/{mode}" data-suisou-layout="stack gap-3">
          {#if mode === 'register'}
            <div data-suisou-layout="stack gap-1">
              <label for="displayName" data-suisou="note">表示名</label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                maxlength="64"
                data-suisou="w-full"
                placeholder="あなたの名前"
              />
            </div>
            <div data-suisou-layout="stack gap-1">
              <label for="username" data-suisou="note">
                ユーザー名 <span data-suisou="note">(URLになります: /@…)</span>
              </label>
              <div data-suisou-layout="row">
                <div data-suisou-layout="grow" data-suisou-item="field">
                  <span>@</span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    bind:value={username}
                    oninput={resetUsernameCheck}
                    onblur={checkUsername}
                    autocapitalize="none"
                    autocomplete="off"
                    spellcheck="false"
                    placeholder="your_name"
                  />
                </div>
                <button
                  type="button"
                  onclick={() => {
                    username = randomUsername();
                    checkUsername();
                  }}
                  title="おまかせ生成"
                  data-suisou-button="outline icon"
                >
                  <IconDice />
                </button>
              </div>
              {#if usernameStatus === 'checking'}
                <p data-suisou-text="fs-12" data-suisou="note">確認中…</p>
              {:else if usernameStatus === 'ok'}
                <p data-suisou-text="fs-12" data-suisou="success">{usernameMsg}</p>
              {:else if usernameStatus === 'taken'}
                <p data-suisou-text="fs-12" data-suisou="error">{usernameMsg}</p>
              {:else}
                <p data-suisou-text="fs-12" data-suisou="note">
                  英小文字・数字・ハイフン・アンダースコア（後から変更できます）
                </p>
              {/if}
            </div>
          {/if}
          {#if mode === 'register'}
            <div data-suisou-layout="stack gap-1">
              <label for="email" data-suisou="note">メールアドレス</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autocomplete="email"
                data-suisou="w-full"
                placeholder="you@example.com"
              />
            </div>
          {:else}
            <div data-suisou-layout="stack gap-1">
              <label for="identifier" data-suisou="note">メールアドレス または ユーザー名</label
              >
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                autocapitalize="none"
                autocomplete="username"
                spellcheck="false"
                data-suisou="w-full"
                placeholder="you@example.com / your_name"
              />
            </div>
          {/if}
          <div data-suisou-layout="stack gap-1">
            <label for="password" data-suisou="note">
              パスワード{mode === 'register' ? '（8〜128文字）' : ''}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minlength={mode === 'register' ? 8 : undefined}
              autocomplete={mode === 'register' ? 'new-password' : 'current-password'}
              data-suisou="w-full"
            />
          </div>
          <button type="submit" data-suisou-button="outline" data-suisou="accent w-full">
            {mode === 'login' ? 'ログイン' : 'アカウント作成'}
          </button>
        </form>

        {#if mode === 'login'}
          <button
            type="button"
            onclick={() => (mode = 'forgot')}
            data-suisou-button
            data-suisou="w-full"
            
          >
            パスワードをお忘れですか？
          </button>
        {/if}
      {/if}

      {#if mode !== 'forgot'}
        <div data-suisou-layout="row" class="or">
          <div class="hr" data-suisou-layout="grow"></div>
          <span data-suisou-text="fs-12" data-suisou="note">または</span>
          <div class="hr" data-suisou-layout="grow"></div>
        </div>

        <div data-suisou-layout="stack">
          <button
            type="button"
            onclick={() => loginWithBluesky()}
            disabled={blueskyLoading}
            data-suisou-button="outline"
            data-suisou="accent w-full"
          >
            <IconBrandBluesky />
            {blueskyLoading ? '接続中...' : 'Bluesky で続ける'}
          </button>
          {#if blueskyError}
            <p data-suisou="error">{blueskyError}</p>
          {/if}

          <button type="button" onclick={() => (showHandleInput = !showHandleInput)} data-suisou-button data-suisou-text="fs-12" data-suisou="w-full">
            別のサーバー(PDS)のアカウント
          </button>
          {#if showHandleInput}
            <div data-suisou-layout="stack">
              <input
                id="bluesky-handle"
                type="text"
                bind:value={blueskyHandle}
                placeholder="you.example.com"
                autocapitalize="none"
                autocomplete="off"
                spellcheck="false"
                data-suisou="w-full"
                onkeydown={(e) => e.key === 'Enter' && loginWithBluesky(blueskyHandle)}
              />
              <button
                type="button"
                data-suisou-button="outline"
                data-suisou="w-full"
                onclick={() => loginWithBluesky(blueskyHandle)}
                disabled={blueskyLoading}
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

<style>

  .page {
    padding: var(--suisou-space-3);
  }
  .split {
    width: 100%;
    max-width: 56rem;
    min-height: 45rem;
    overflow: hidden;
  }
  .aside {
    padding: 2.5rem;
  }
  .brand-name {
    letter-spacing: -0.025em;
  }
  .back {
    display: block;
    width: 100%;
    transition: color var(--suisou-duration-fast) var(--suisou-ease);
  }

  .split {
    --suisou-grid-cols: repeat(1, minmax(0, 1fr));
  }
  @media (min-width: 1024px) {
    .split {
      --suisou-grid-cols: repeat(2, minmax(0, 1fr));
    }
  }

  .hr {
    height: 1px;
    background: var(--suisou-color-line-weak);
  }
  .aside {
    background: var(--suisou-color-hover);
    border-color: var(--suisou-color-line-weak);
  }
  .back:hover {
    color: var(--suisou-color-text);
  }

  .form-col {
    padding: var(--suisou-space-4);
  }
  @media (width >= 640px) {
    .form-col {
      padding: var(--suisou-space-4) calc(var(--suisou-space-4) * 1.7);
    }
  }
  .or {
    margin-block: var(--suisou-space-2);
  }
</style>
