<script lang="ts">
  import type { ActionData, PageData } from './$types';

  let { form, data }: { form: ActionData; data: PageData } = $props();

  const inputClass =
    'w-full rounded-lg bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/70 transition';
</script>

<svelte:head>
  <title>パスワード再設定 — wixdex</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-zinc-900 p-4">
  <div class="w-full max-w-md rounded-2xl border border-gray-600/30 bg-zinc-600/10 p-7 sm:p-10">
    <h1 class="mb-6 text-center text-xl font-bold text-white">パスワード再設定</h1>

    {#if !data.valid || (form && 'expired' in form && form.expired)}
      <p class="mb-6 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300">
        このリンクは無効か、有効期限（30分）が切れています。
      </p>
      <a
        href="/login"
        class="block w-full rounded-lg bg-orange-500 py-2.5 text-center font-semibold text-white transition-colors hover:bg-orange-600"
      >
        ログイン画面へ戻る
      </a>
    {:else}
      {#if form?.error}
        <p class="mb-4 rounded-lg bg-red-900/40 px-4 py-3 text-sm text-red-300">{form.error}</p>
      {/if}
      <form method="POST" class="space-y-4">
        <div>
          <label for="password" class="mb-1 block text-sm text-zinc-300"
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
            class={inputClass}
          />
        </div>
        <button
          type="submit"
          class="w-full rounded-lg bg-orange-500 py-2.5 font-semibold text-white transition-colors hover:bg-orange-600 active:bg-orange-700"
        >
          パスワードを設定する
        </button>
      </form>
    {/if}
  </div>
</main>
