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

<main data-suisou-layout="stack gap-3 middle center" data-suisou-text="center" data-suisou="min-screen" class="page">
  <img src="/404.png" alt="エラー {page.status}" class="art" />

  <p data-suisou-text="fs-32 fw-700" data-suisou="success">{page.status}</p>

  <p data-suisou="note">{message}</p>

  <a href="/" data-suisou-button="outline" data-suisou="accent">ホームへ戻る</a>
</main>

<style>
  .page {
    padding-inline: var(--suisou-space-3);
  }
  .art {
    height: auto;
    width: 70vw;
    max-width: 600px;
  }
</style>
