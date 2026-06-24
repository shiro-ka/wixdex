<script lang="ts">
  import { page } from '$app/state';

  const message = $derived(
    page.status === 404
      ? 'お探しのページは見つかりませんでした。'
      : (page.error?.message ?? 'エラーが発生しました。'),
  );
</script>

<svelte:head>
  <title>{page.status} — wixdex</title>
</svelte:head>

<main
  class="flex min-h-dvh flex-col items-center justify-center gap-5 bg-zinc-900 px-4 text-center text-white"
>
  <img src="/404.png" alt="エラー {page.status}" class="h-auto w-[70vw] max-w-[600px]" />

  <p class="text-3xl font-bold text-green-500">{page.status}</p>

  <p class="text-zinc-400">{message}</p>

  <a
    href="/"
    class="mt-2 rounded-lg bg-orange-600 px-5 py-2 text-sm font-medium transition-colors hover:bg-orange-500"
  >
    ホームへ戻る
  </a>
</main>
