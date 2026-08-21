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

<main class="flex min-h-screen items-center justify-center bg-zinc-900 p-4">
  <div
    class="grid w-full max-w-4xl min-h-[45rem] overflow-hidden lg:grid-cols-2"
    data-suisou-surface="panel bleed"
  >
    <!-- 左: ブランディング（PCのみ。zincダーク、オレンジは差し色のみ） -->
    <div
      class="hidden flex-col justify-between border-r border-gray-600/30 bg-zinc-600/10 p-10 lg:flex"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">
          wix<span class="text-orange-500">dex</span>
        </h1>
        <p class="mt-3 text-zinc-400">WIXOSS デッキビルダー</p>
      </div>
      <ul class="space-y-2.5 text-zinc-400">
        <li data-suisou-layout="row">
          <span class="text-orange-500">▸</span> カードを集めてデッキを構築
        </li>
        <li data-suisou-layout="row">
          <span class="text-orange-500">▸</span> デッキを公開してシェア
        </li>
        <li data-suisou-layout="row">
          <span class="text-orange-500">▸</span> Bluesky 連携でかんたんログイン
        </li>
      </ul>
    </div>

    <!-- 右: 認証フォーム -->
    <div class="p-7 sm:p-10">
      <h1 class="mb-5 text-center text-xl font-bold text-white lg:hidden">wixdex</h1>

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
        <p class="mb-4 text-zinc-400">
          登録したメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
        </p>
        <form method="POST" action="?/forgotPassword" class="space-y-4">
          <div>
            <label for="forgot-email" class="mb-1 block text-zinc-300">メールアドレス</label>
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
          class="mt-4 block w-full text-center text-zinc-400 transition-colors hover:text-zinc-200"
        >
          ← ログインに戻る
        </button>
      {:else}
        <!-- メール認証フォーム。action でログイン/登録を切替 -->
        <form method="POST" action="?/{mode}" class="space-y-4">
          {#if mode === 'register'}
            <div>
              <label for="displayName" class="mb-1 block text-zinc-300">表示名</label>
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
              <label for="username" class="mb-1 block text-zinc-300">
                ユーザー名 <span class="text-zinc-500">(URLになります: /@…)</span>
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
                <p class="mt-1 text-xs text-zinc-400">確認中…</p>
              {:else if usernameStatus === 'ok'}
                <p class="mt-1 text-xs text-green-400">{usernameMsg}</p>
              {:else if usernameStatus === 'taken'}
                <p class="mt-1 text-xs text-red-400">{usernameMsg}</p>
              {:else}
                <p class="mt-1 text-xs text-zinc-500">
                  英小文字・数字・ハイフン・アンダースコア（後から変更できます）
                </p>
              {/if}
            </div>
          {/if}
          {#if mode === 'register'}
            <div>
              <label for="email" class="mb-1 block text-zinc-300">メールアドレス</label>
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
              <label for="identifier" class="mb-1 block text-zinc-300"
                >メールアドレス または ユーザー名</label
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
            <label for="password" class="mb-1 block text-zinc-300">
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
            class="mt-3 block w-full text-center text-zinc-400 transition-colors hover:text-zinc-200"
          >
            パスワードをお忘れですか？
          </button>
        {/if}
      {/if}

      {#if mode !== 'forgot'}
        <div data-suisou-layout="row" class="my-6">
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
            data-suisou-button="outline wide"
          >
            <IconBrandBluesky class="h-5 w-5" />
            {blueskyLoading ? '接続中...' : 'Bluesky で続ける'}
          </button>
          {#if blueskyError}
            <p class="text-red-400">{blueskyError}</p>
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
