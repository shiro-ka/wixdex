<script lang="ts">
  import type { ActionData, PageData } from './$types';

  let { form, data }: { form: ActionData; data: PageData } = $props();
</script>

<svelte:head>
  <title>パスワード再設定 — wixdex</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-zinc-900 p-4">
  <div class="w-full max-w-md" data-suisou-surface="panel">
    <h1 class="mb-6 text-center text-xl font-bold text-white">パスワード再設定</h1>

    {#if !data.valid || (form && 'expired' in form && form.expired)}
      <p data-suisou-banner="error" role="alert" class="mb-6">
        このリンクは無効か、有効期限（30分）が切れています。
      </p>
      <a href="/login" data-suisou-button="outline wide"> ログイン画面へ戻る </a>
    {:else}
      {#if form?.error}
        <p data-suisou-banner="error" role="alert" class="mb-4">{form.error}</p>
      {/if}
      <form method="POST" class="space-y-4">
        <div>
          <label for="password" class="mb-1 block text-zinc-300"
            >新しいパスワード（8文字以上）</label
          >
          <input
            id="password"
            name="password"
            type="password"
            required
            minlength="8"
            maxlength="128"
            autocomplete="new-password"
            data-suisou-field="block"
          />
        </div>
        <button type="submit" data-suisou-button="outline wide"> パスワードを設定する </button>
      </form>
    {/if}
  </div>
</main>
