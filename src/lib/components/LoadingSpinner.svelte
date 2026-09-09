<div class="cover" data-suisou-layout="row middle">
  <div data-suisou-text="center">
    <!-- Suisou の Spinner（2026-08-22 に部品化）。手書きの輪は
         「動きを減らす」設定を見ておらず、回りっぱなしだった -->
    <div
      data-suisou-spinner
      style="--suisou-spinner: 4rem"
      class="mark"
      role="status"
      aria-label="カードデータを読み込んでいます"
    ></div>
    <p data-suisou-text="s20">カードデータを読み込んでいます...</p>
  </div>
</div>

<style>
  .mark {
    margin-inline: auto;
    margin-block-end: var(--suisou-space-3); /* Tailwind mb-4 = 16px */
  }

  /* 中身を覆い隠す膜なので、地は自分で持つ（body に任せられない） */
  .cover {
    background: var(--suisou-bg);
  }
</style>
