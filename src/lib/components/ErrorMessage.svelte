<script lang="ts">
  let { message }: { message: string } = $props();
</script>

<div class="fixed inset-0 flex items-center justify-center bg-zinc-900">
  <div class="bg-red-900/50 border border-red-500 rounded-lg p-6 max-w-md">
    <h2 class="text-white text-xl font-bold mb-2">エラー</h2>
    <p class="text-red-200">{message}</p>
    <button
      onclick={() => window.location.reload()}
      class="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
    >再読み込み</button>
  </div>
</div>
