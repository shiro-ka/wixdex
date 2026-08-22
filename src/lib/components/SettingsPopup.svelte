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

  let {
    isOpen,
    onClose,
    showLifeBurst,
    onToggleLifeBurst,
    showCandidateIcon,
    onToggleCandidateIcon,
    rotateLandscape,
    onToggleRotateLandscape,
  }: Props = $props();

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
      timer = setTimeout(() => {
        shouldRender = false;
      }, 200);
    }
    return () => clearTimeout(timer);
  });

  function handleClose() {
    isClosing = true;
    setTimeout(onClose, 200);
  }
</script>

{#if shouldRender}
  <button
    class="fixed inset-0 z-30 transition-opacity duration-200 cursor-default {isClosing
      ? 'opacity-0'
      : 'opacity-100'}"
    onclick={handleClose}
    aria-label="閉じる"
  ></button>
  <div
    data-suisou-surface="overlay"
    class="popup absolute bottom-full left-0 mb-2 w-64 z-40 transition-all duration-200 {isClosing
      ? 'opacity-0 scale-95'
      : 'opacity-100 scale-100'}"
  >
    <div>
      <h3 data-suisou-text="s14 w700" class="mb-2">設定</h3>
      <div class="space-y-2">
        <button
          type="button"
          class="group flex items-center space-x-2 cursor-pointer w-full"
          aria-pressed={showLifeBurst}
          onclick={onToggleLifeBurst}
        >
          <CheckboxIcon
            checked={showLifeBurst}
            class="w-5 h-5 flex-shrink-0 transition-colors {showLifeBurst
              ? 'text-orange-400'
              : 'text-gray-400 group-hover:text-gray-300'}"
          />
          <span>LBアイコンを表示</span>
        </button>
        <button
          type="button"
          class="group flex items-center space-x-2 cursor-pointer w-full"
          aria-pressed={showCandidateIcon}
          onclick={onToggleCandidateIcon}
        >
          <CheckboxIcon
            checked={showCandidateIcon}
            class="w-5 h-5 flex-shrink-0 transition-colors {showCandidateIcon
              ? 'text-orange-400'
              : 'text-gray-400 group-hover:text-gray-300'}"
          />
          <span>候補カードアイコンを表示</span>
        </button>
        <button
          type="button"
          class="group flex items-center space-x-2 cursor-pointer w-full"
          aria-pressed={rotateLandscape}
          onclick={onToggleRotateLandscape}
        >
          <CheckboxIcon
            checked={rotateLandscape}
            class="w-5 h-5 flex-shrink-0 transition-colors {rotateLandscape
              ? 'text-orange-400'
              : 'text-gray-400 group-hover:text-gray-300'}"
          />
          <span>横向きのカードを縦に表示</span>
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* 位置と幅は現場のもの。面・罫・角丸は surface="overlay" が持つ。
     dialog ではないので position を上書きして錨（ボタンの上）に留める */
  .popup {
    position: absolute;
    margin: 0 0 var(--suisou-space-2) 0;
  }
</style>
