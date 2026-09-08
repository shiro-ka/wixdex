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

<main class="min-h-dvh justify-center px-4 text-center" data-suisou-layout="stack gap-3">
  <img src="/404.png" alt="エラー {page.status}" class="h-auto w-[70vw] max-w-[600px]" />

  <p data-suisou-text="s32 w700 success">{page.status}</p>

  <p data-suisou-text="sub">{message}</p>

  <a href="/" data-suisou-button="outline">ホームへ戻る</a>
</main>
