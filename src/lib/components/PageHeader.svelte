<script lang="ts">
  import type { Snippet } from 'svelte';

  // サブページ共通の全幅トップバー。黒背景に浮いた印象を消し、ページとして成立させる。
  let { right }: { right?: Snippet } = $props();
</script>

<header class="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
  <div class="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
    <a href="/" class="text-lg font-bold tracking-tight text-white hover:text-zinc-300 transition-colors">
      wixdex
    </a>
    {#if right}
      <div class="flex items-center gap-2">{@render right()}</div>
    {/if}
  </div>
</header>
