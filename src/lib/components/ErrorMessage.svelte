<script lang="ts">
  let { message }: { message: string } = $props();
</script>

<div class="fixed inset-0 justify-center cover" data-suisou-layout="row">
  <div data-suisou-banner="error" role="alert" class="max-w-md">
    <h2 data-suisou-text="s20 w700" class="mb-2">エラー</h2>
    <p>{message}</p>
    <button
      type="button"
      onclick={() => window.location.reload()}
      data-suisou-button="danger"
      class="mt-4"
    >
      再読み込み
    </button>
  </div>
</div>

<style>
  /* 中身を覆い隠す膜なので、地は自分で持つ（body に任せられない） */
  .cover {
    background: var(--suisou-bg);
  }
</style>
