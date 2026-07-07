<script lang="ts">
  import type { Snippet } from 'svelte';
  import IconCircleCheck from '@tabler/icons-svelte/icons/circle-check';
  import IconChevronUp from '@tabler/icons-svelte/icons/chevron-up';

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
  <!-- モバイル/タブレット専用のドロップダウン。PC(lg以上)は常時表示パネルが担当するので隠す。
       PCでは activeDropdown が常に非nullになるため、lg:hidden が無いとPCでもこの overlay が開いてしまう。 -->
  <div class="lg:hidden fixed top-0 left-0 w-dvw bg-zinc-800 border-b border-gray-700 shadow-lg z-50 p-4 {isClosing ? 'animate-slide-up' : 'animate-slide-down'}">
    <div class="max-w-screen-md mx-auto {isClosing ? 'animate-fade-out' : 'animate-fade-in'}">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-white text-sm font-semibold">{title}</h3>
        <button onclick={onClearAll}
          class="!text-gray-400 hover:!text-gray-300 !bg-transparent hover:bg-gray-700/50 rounded-lg p-1 transition-all"
          aria-label="チェック全解除">
          <IconCircleCheck class="w-5 h-5" />
        </button>
      </div>
      <div>{@render children()}</div>
      <button onclick={onClose}
        class="w-full mt-4 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-lg p-2 transition-all flex items-center justify-center gap-2">
        <IconChevronUp class="w-5 h-5" />
        <span class="text-sm">閉じる</span>
      </button>
    </div>
  </div>
{/if}
