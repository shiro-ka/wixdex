<script lang="ts">
  let { message }: { message: string } = $props();
</script>

<div class="cover" data-suisou-layout="row middle">
  <div data-suisou-banner="error" role="alert" class="box">
    <h2 data-suisou-text="s20 w700" class="head">エラー</h2>
    <p>{message}</p>
    <button
      type="button"
      onclick={() => window.location.reload()}
      data-suisou-button="danger"
      class="act"
    >
      再読み込み
    </button>
  </div>
</div>

<style>
  .box {
    max-width: 28rem;
  }
  .head {
    margin-block-end: var(--suisou-space-2);
  }
  .act {
    margin-block-start: var(--suisou-space-3); /* Tailwind mt-4 = 16px */
  }

  /* 中身を覆い隠す膜なので、地は自分で持つ（body に任せられない） */
  .cover {
    background: var(--suisou-bg);
  }
</style>
