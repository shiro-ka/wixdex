<script lang="ts">
  import type { Snippet } from 'svelte';
  import CircleCheckIcon from '../icons/CircleCheckIcon.svelte';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: Snippet;
    onClearAll: () => void;
  }

  let { isOpen, onClose, title, children, onClearAll }: Props = $props();

  let isClosing = $state(false);
  let shouldRender = $state(false);
  let timer: ReturnType<typeof setTimeout>;

  $effect(() => {
    if (isOpen) {
      shouldRender = true;
      clearTimeout(timer);
      isClosing = false;
    } else if (shouldRender) {
      isClosing = true;
      timer = setTimeout(() => { shouldRender = false; isClosing = false; }, 200);
    }
    return () => clearTimeout(timer);
  });
</script>

{#if shouldRender}
  <div class="fixed top-0 left-0 w-dvw bg-zinc-800 border-b border-gray-700 shadow-lg z-50 p-4 {isClosing ? 'animate-slide-up' : 'animate-slide-down'}">
    <div class="max-w-screen-md mx-auto {isClosing ? 'animate-fade-out' : 'animate-fade-in'}">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-white text-sm font-semibold">{title}</h3>
        <button onclick={onClearAll}
          class="!text-gray-400 hover:!text-gray-300 !bg-transparent hover:bg-gray-700/50 rounded-lg p-1 transition-all"
          aria-label="チェック全解除">
          <CircleCheckIcon />
        </button>
      </div>
      <div>{@render children()}</div>
      <button onclick={onClose}
        class="w-full mt-4 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-lg p-2 transition-all flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
        <span class="text-sm">閉じる</span>
      </button>
    </div>
  </div>
{/if}
