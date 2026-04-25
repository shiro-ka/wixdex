<script lang="ts">
  import CheckboxIcon from './icons/CheckboxIcon.svelte';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    searchCardName: boolean;
    searchCardText: boolean;
    onToggleSearchCardName: () => void;
    onToggleSearchCardText: () => void;
  }

  let { isOpen, onClose, searchCardName, searchCardText, onToggleSearchCardName, onToggleSearchCardText }: Props = $props();

  let isClosing = $state(false);
  let shouldRender = $state(false);
  let timer: ReturnType<typeof setTimeout>;

  $effect(() => {
    if (isOpen) {
      shouldRender = true;
      clearTimeout(timer);
      isClosing = false;
    } else {
      isClosing = true;
      timer = setTimeout(() => { shouldRender = false; }, 200);
    }
    return () => clearTimeout(timer);
  });

  function handleClose() {
    isClosing = true;
    setTimeout(onClose, 200);
  }
</script>

{#if shouldRender}
  <button class="fixed inset-0 z-30 transition-opacity duration-200 cursor-default {isClosing ? 'opacity-0' : 'opacity-100'}"
    onclick={handleClose} aria-label="閉じる"></button>
  <div class="absolute bottom-full left-0 mb-2 w-64 bg-zinc-800 border border-neutral-700 rounded-lg shadow-xl z-40 transition-all duration-200 {isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}">
    <div class="p-4">
      <h3 class="text-white text-sm font-semibold mb-3">テキスト検索設定</h3>
      <div class="space-y-2">
        <button type="button" class="group flex items-center space-x-2 text-white cursor-pointer w-full" onclick={onToggleSearchCardName}>
          <CheckboxIcon
            checked={searchCardName}
            class="w-5 h-5 flex-shrink-0 transition-colors {searchCardName ? 'text-orange-400' : 'text-gray-400 group-hover:text-gray-300'}"
          />
          <span class="text-sm">カード名</span>
        </button>
        <button type="button" class="group flex items-center space-x-2 text-white cursor-pointer w-full" onclick={onToggleSearchCardText}>
          <CheckboxIcon
            checked={searchCardText}
            class="w-5 h-5 flex-shrink-0 transition-colors {searchCardText ? 'text-orange-400' : 'text-gray-400 group-hover:text-gray-300'}"
          />
          <span class="text-sm">テキスト</span>
        </button>
      </div>
    </div>
  </div>
{/if}
