<script lang="ts">
  import type { ActionData, PageData } from './$types';

  let { form, data }: { form: ActionData; data: PageData } = $props();
</script>

<svelte:head>
  <title>パスワード再設定 — wixdex</title>
</svelte:head>

<main class="page" data-suisou-layout="row middle" data-suisou="min-screen">
  <div class="box" data-suisou-tray data-suisou-layout="stack gap-3">
    <h1 data-suisou-text="fs-20 fw-700 center">パスワード再設定</h1>

    {#if !data.valid || (form && 'expired' in form && form.expired)}
      <p data-suisou-item="notice" data-suisou="error" role="alert">
        このリンクは無効か、有効期限（30分）が切れています。
      </p>
      <a href="/login" data-suisou-button="outline" data-suisou="accent w-full"> ログイン画面へ戻る </a>
    {:else}
      {#if form?.error}
        <p data-suisou-item="notice" data-suisou="error" role="alert">{form.error}</p>
      {/if}
      <form method="POST" data-suisou-layout="stack gap-3">
        <div data-suisou-layout="stack gap-1">
          <label for="password" data-suisou="sub">新しいパスワード（8文字以上）</label
          >
          <input
            id="password"
            name="password"
            type="password"
            required
            minlength="8"
            maxlength="128"
            autocomplete="new-password"
            data-suisou="w-full"
          />
        </div>
        <button type="submit" data-suisou-button="outline" data-suisou="accent w-full"> パスワードを設定する </button>
      </form>
    {/if}
  </div>
</main>

<style>
  .page {
    padding: var(--suisou-space-3);
  }
  .box {
    width: 100%;
    max-width: 28rem;
  }
</style>
