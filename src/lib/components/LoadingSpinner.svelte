<div class="fixed inset-0 flex items-center justify-center cover">
  <div class="text-center">
    <!-- Suisou の Spinner（2026-08-22 に部品化）。手書きの輪は
         「動きを減らす」設定を見ておらず、回りっぱなしだった -->
    <div
      data-suisou-spinner
      style="--suisou-spinner: 4rem"
      class="mx-auto mb-4"
      role="status"
      aria-label="カードデータを読み込んでいます"
    ></div>
    <p class="text-lg">カードデータを読み込んでいます...</p>
  </div>
</div>

<style>
  /* 中身を覆い隠す膜なので、地は自分で持つ（body に任せられない） */
  .cover {
    background: var(--suisou-bg);
  }
</style>
