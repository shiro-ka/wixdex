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

  // ユーザー名の事前判定（フォーカスを外した時に確認）。
  // 入力中は idle に戻し、blur / おまかせ生成のたびに /api/username-check へ問い合わせる。
  let usernameStatus = $state<'idle' | 'checking' | 'ok' | 'taken'>('idle');
  let usernameMsg = $state('');
  let checkSeq = 0; // 古い応答が新しい結果を上書きしないように

  function resetUsernameCheck() {
    usernameStatus = 'idle';
    usernameMsg = '';
    checkSeq++; // 進行中の応答を無効化
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
      if (seq !== checkSeq) return; // 入力が変わった/別の確認が走った → この応答は破棄
      if (data.available) {
        usernameStatus = 'ok';
        usernameMsg = 'このユーザー名は使えます';
      } else {
        usernameStatus = 'taken';
        usernameMsg = data.error ?? 'このユーザー名は使用できません。';
      }
    } catch {
      if (seq !== checkSeq) return;
      resetUsernameCheck(); // 通信失敗時は黙ってヒント表示に戻す（登録時に最終判定される）
    }
  }

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
</script>

<svelte:head>
  <title>{mode === 'login' ? 'ログイン' : '新規登録'} — wixdex</title>
</svelte:head>

<main class="min-h-screen justify-center p-4" data-suisou-layout="row">
  <div
    class="grid w-full max-w-4xl min-h-[45rem] overflow-hidden lg:grid-cols-2"
    data-suisou-surface="panel bleed"
  >
    <!-- 左: ブランディング（PCのみ。zincダーク、オレンジは差し色のみ） -->
    <div
      class="hidden flex-col justify-between border-r p-10 lg:flex aside"
    >
      <div>
        <h1 class="tracking-tight" data-suisou-text="s28 w700">
          wix<span data-suisou-text="accent">dex</span>
        </h1>
        <p class="mt-3" data-suisou-text="sub">WIXOSS デッキビルダー</p>
      </div>
      <ul class="space-y-2.5" data-suisou-text="sub">
        <li data-suisou-layout="row">
          <span data-suisou-text="accent">▸</span> カードを集めてデッキを構築
        </li>
        <li data-suisou-layout="row">
          <span data-suisou-text="accent">▸</span> デッキを公開してシェア
        </li>
        <li data-suisou-layout="row">
          <span data-suisou-text="accent">▸</span> Bluesky 連携でかんたんログイン
        </li>
      </ul>
    </div>

    <!-- 右: 認証フォーム -->
    <div class="p-7 sm:p-10">
      <h1 class="mb-5 text-center lg:hidden" data-suisou-text="s20 w700">wixdex</h1>

      <!-- タブ切替（再設定モードでは隠す） -->
      {#if mode !== 'forgot'}
        <div class="mb-6" data-suisou-button-group="even">
          <button
            type="button"
            data-suisou-button="neutral"
            aria-pressed={mode === 'login'}
            onclick={() => (mode = 'login')}
          >
            ログイン
          </button>
          <button
            type="button"
            data-suisou-button="neutral"
            aria-pressed={mode === 'register'}
            onclick={() => (mode = 'register')}
          >
            新規登録
          </button>
        </div>
      {/if}

      {#if data.oauthError}
        <p data-suisou-banner="error" role="alert" class="mb-4">
          {data.oauthError}
        </p>
      {/if}
      {#if data.resetDone}
        <p data-suisou-banner="success" role="status" class="mb-4">
          パスワードを再設定しました。新しいパスワードでログインしてください。
        </p>
      {/if}
      {#if form && 'error' in form && form.error}
        <p data-suisou-banner="error" role="alert" class="mb-4">{form.error}</p>
      {/if}
      {#if form && form.mode === 'forgot' && 'success' in form && form.success}
        <p data-suisou-banner="success" role="status" class="mb-4">
          入力されたメールアドレスが登録されていれば、再設定用のリンクを送信しました。メールをご確認ください。
        </p>
      {/if}

      {#if mode === 'forgot'}
        <!-- パスワード再設定: メールアドレス入力 -->
        <p class="mb-4" data-suisou-text="sub">
          登録したメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
        </p>
        <form method="POST" action="?/forgotPassword" class="space-y-4">
          <div>
            <label for="forgot-email" class="mb-1 block" data-suisou-text="sub">メールアドレス</label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              required
              autocomplete="email"
              data-suisou-field="block"
              placeholder="you@example.com"
            />
          </div>
          <button type="submit" data-suisou-button="outline wide">再設定リンクを送る</button>
        </form>
        <button
          type="button"
          onclick={() => (mode = 'login')}
          class="mt-4 block w-full text-center transition-colors back" data-suisou-text="sub">
          ← ログインに戻る
        </button>
      {:else}
        <!-- メール認証フォーム。action でログイン/登録を切替 -->
        <form method="POST" action="?/{mode}" class="space-y-4">
          {#if mode === 'register'}
            <div>
              <label for="displayName" class="mb-1 block" data-suisou-text="sub">表示名</label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                maxlength="64"
                data-suisou-field="block"
                placeholder="あなたの名前"
              />
            </div>
            <div>
              <label for="username" class="mb-1 block" data-suisou-text="sub">
                ユーザー名 <span data-suisou-text="sub">(URLになります: /@…)</span>
              </label>
              <div class="flex gap-2">
                <div class="flex-1" data-suisou-button-group>
                  <span data-suisou-affix>@</span>
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
                    data-suisou-field
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
                  data-suisou-button="plain icon"
                >
                  <IconDice />
                </button>
              </div>
              {#if usernameStatus === 'checking'}
                <p class="mt-1" data-suisou-text="sub s12">確認中…</p>
              {:else if usernameStatus === 'ok'}
                <p class="mt-1" data-suisou-text="success s12">{usernameMsg}</p>
              {:else if usernameStatus === 'taken'}
                <p class="mt-1" data-suisou-text="error s12">{usernameMsg}</p>
              {:else}
                <p class="mt-1" data-suisou-text="sub s12">
                  英小文字・数字・ハイフン・アンダースコア（後から変更できます）
                </p>
              {/if}
            </div>
          {/if}
          {#if mode === 'register'}
            <div>
              <label for="email" class="mb-1 block" data-suisou-text="sub">メールアドレス</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autocomplete="email"
                data-suisou-field="block"
                placeholder="you@example.com"
              />
            </div>
          {:else}
            <div>
              <label for="identifier" class="mb-1 block" data-suisou-text="sub">メールアドレス または ユーザー名</label
              >
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                autocapitalize="none"
                autocomplete="username"
                spellcheck="false"
                data-suisou-field="block"
                placeholder="you@example.com / your_name"
              />
            </div>
          {/if}
          <div>
            <label for="password" class="mb-1 block" data-suisou-text="sub">
              パスワード{mode === 'register' ? '（8〜128文字）' : ''}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minlength={mode === 'register' ? 8 : undefined}
              autocomplete={mode === 'register' ? 'new-password' : 'current-password'}
              data-suisou-field="block"
            />
          </div>
          <button type="submit" data-suisou-button="outline wide">
            {mode === 'login' ? 'ログイン' : 'アカウント作成'}
          </button>
        </form>

        {#if mode === 'login'}
          <button
            type="button"
            onclick={() => (mode = 'forgot')}
            data-suisou-button="wide"
            class="mt-3"
          >
            パスワードをお忘れですか？
          </button>
        {/if}
      {/if}

      {#if mode !== 'forgot'}
        <div data-suisou-layout="row" class="my-6">
          <div class="h-px flex-1 hr"></div>
          <span data-suisou-text="sub s12">または</span>
          <div class="h-px flex-1 hr"></div>
        </div>

        <!-- Bluesky（ログイン・登録共通。bsky.social へ直行＝ハンドル入力不要） -->
        <div class="space-y-3">
          <button
            type="button"
            onclick={() => loginWithBluesky()}
            disabled={blueskyLoading}
            data-suisou-button="outline wide"
          >
            <IconBrandBluesky class="h-5 w-5" />
            {blueskyLoading ? '接続中...' : 'Bluesky で続ける'}
          </button>
          {#if blueskyError}
            <p data-suisou-text="error">{blueskyError}</p>
          {/if}

          <!-- bsky.social 以外のPDS利用者向け（普段は隠す） -->
          <button type="button" onclick={() => (showHandleInput = !showHandleInput)} data-suisou-button="wide" data-suisou-text="s12">
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
                data-suisou-field="block"
                onkeydown={(e) => e.key === 'Enter' && loginWithBluesky(blueskyHandle)}
              />
              <button
                type="button"
                data-suisou-button="plain wide"
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
  /* 「または」の左右に伸びる線。旧実装は panel の色を線に使っていた */
  .hr {
    background: var(--suisou-line-weak);
  }
  /* 左の紹介カラム。薄く敷いて罫で区切る */
  .aside {
    background: var(--suisou-hover-surface);
    border-color: var(--suisou-line-weak);
  }
  .back:hover {
    color: var(--suisou-text-main);
  }
</style>
