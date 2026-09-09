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

<main data-suisou-text="center" class="page" data-suisou-layout="stack gap-3 screen middle">
  <img src="/404.png" alt="エラー {page.status}" class="art" />

  <p data-suisou-text="s32 w700 success">{page.status}</p>

  <p data-suisou-text="sub">{message}</p>

  <a href="/" data-suisou-button="outline">ホームへ戻る</a>
</main>

<style>
  .page {
    padding-inline: var(--suisou-space-3); /* Tailwind px-4 = 16px */
  }
  .art {
    height: auto;
    width: 70vw;
    max-width: 600px;
  }
</style>
