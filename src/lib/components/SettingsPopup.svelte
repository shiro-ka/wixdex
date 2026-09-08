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
      <div data-suisou-layout="stack gap-2">
        <button type="button" class="toggle cursor-pointer w-full" aria-pressed={showLifeBurst} onclick={onToggleLifeBurst} data-suisou-layout="row gap-2">
          <CheckboxIcon
            checked={showLifeBurst}
            class="w-5 h-5 flex-shrink-0"
          />
          <span>LBアイコンを表示</span>
        </button>
        <button type="button" class="toggle cursor-pointer w-full" aria-pressed={showCandidateIcon} onclick={onToggleCandidateIcon} data-suisou-layout="row gap-2">
          <CheckboxIcon
            checked={showCandidateIcon}
            class="w-5 h-5 flex-shrink-0"
          />
          <span>候補カードアイコンを表示</span>
        </button>
        <button type="button" class="toggle cursor-pointer w-full" aria-pressed={rotateLandscape} onclick={onToggleRotateLandscape} data-suisou-layout="row gap-2">
          <CheckboxIcon
            checked={rotateLandscape}
            class="w-5 h-5 flex-shrink-0"
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

  /* ★色は aria-pressed から引く。旧実装は同じ状態を三項式でもう一度書いていて、
     「押されているか」がボタンの属性と色の式の2箇所にあった（二重管理）。
     Suisou の「状態は標準の属性を借りる」に寄せて、式を消して CSS 側で受ける。 */
  .toggle :global(svg) {
    color: var(--suisou-text-sub);
    transition: color var(--suisou-motion-fast) var(--suisou-ease);
  }
  .toggle:hover :global(svg) {
    color: var(--suisou-text-main);
  }
  .toggle[aria-pressed="true"] :global(svg) {
    color: var(--suisou-accent);
  }
</style>
