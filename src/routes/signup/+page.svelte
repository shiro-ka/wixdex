<script lang="ts">
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
  <title>アカウント作成 — wixdex</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-gray-950 p-4">
  <div class="w-full max-w-sm rounded-xl bg-gray-900 p-8 shadow-xl">
    <h1 class="mb-6 text-2xl font-bold text-white">アカウント作成</h1>

    {#if form?.error}
      <p class="mb-4 rounded-lg bg-red-900/50 px-4 py-3 text-sm text-red-300">{form.error}</p>
    {/if}

    <form method="POST" class="space-y-4">
      <div>
        <label for="displayName" class="mb-1 block text-sm text-gray-300">表示名</label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          maxlength="64"
          class="w-full rounded-lg bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="あなたの名前"
        />
      </div>
      <div>
        <label for="email" class="mb-1 block text-sm text-gray-300">メールアドレス</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          class="w-full rounded-lg bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label for="password" class="mb-1 block text-sm text-gray-300">パスワード（8文字以上）</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minlength="8"
          class="w-full rounded-lg bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        class="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-500 active:bg-blue-700"
      >
        登録する
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-400">
      すでにアカウントをお持ちの方は
      <a href="/login" class="text-blue-400 hover:underline">ログイン</a>
    </p>
  </div>
</main>
