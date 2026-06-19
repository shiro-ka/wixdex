<script lang="ts">
  import CheckboxIcon from './icons/CheckboxIcon.svelte';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    showLifeBurst: boolean;
    onToggleLifeBurst: () => void;
    showCandidateIcon: boolean;
    onToggleCandidateIcon: () => void;
    rotateLandscape: boolean;
    onToggleRotateLandscape: () => void;
  }

  let { isOpen, onClose, showLifeBurst, onToggleLifeBurst, showCandidateIcon, onToggleCandidateIcon, rotateLandscape, onToggleRotateLandscape }: Props = $props();

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
      <h3 class="text-white text-sm font-semibold mb-3">設定</h3>
      <div class="space-y-2">
        <button type="button" class="group flex items-center space-x-2 text-white cursor-pointer w-full" onclick={onToggleLifeBurst}>
          <CheckboxIcon
            checked={showLifeBurst}
            class="w-5 h-5 flex-shrink-0 transition-colors {showLifeBurst ? 'text-orange-400' : 'text-gray-400 group-hover:text-gray-300'}"
          />
          <span class="text-sm">LBアイコンを表示</span>
        </button>
        <button type="button" class="group flex items-center space-x-2 text-white cursor-pointer w-full" onclick={onToggleCandidateIcon}>
          <CheckboxIcon
            checked={showCandidateIcon}
            class="w-5 h-5 flex-shrink-0 transition-colors {showCandidateIcon ? 'text-orange-400' : 'text-gray-400 group-hover:text-gray-300'}"
          />
          <span class="text-sm">候補カードアイコンを表示</span>
        </button>
        <button type="button" class="group flex items-center space-x-2 text-white cursor-pointer w-full" onclick={onToggleRotateLandscape}>
          <CheckboxIcon
            checked={rotateLandscape}
            class="w-5 h-5 flex-shrink-0 transition-colors {rotateLandscape ? 'text-orange-400' : 'text-gray-400 group-hover:text-gray-300'}"
          />
          <span class="text-sm">横向きのカードを縦に表示</span>
        </button>
      </div>
    </div>
  </div>
{/if}
