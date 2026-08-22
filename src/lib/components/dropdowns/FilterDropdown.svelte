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
      timer = setTimeout(() => {
        shouldRender = false;
        isClosing = false;
      }, 200);
    }
    return () => clearTimeout(timer);
  });
</script>

{#if shouldRender}
  <!-- モバイル/タブレット専用のドロップダウン。PC(lg以上)は常時表示パネルが担当するので隠す。
       PCでは activeDropdown が常に非nullになるため、lg:hidden が無いとPCでもこの overlay が開いてしまう。 -->
  <!-- 上から降りるシート。Suisou に無い形なので位置と出入りは現場が持ち、
       面の色と罫はトークンで受ける。3回目の現場が出たら Suisou 昇格を検討 -->
  <div
    class="sheet lg:hidden fixed top-0 left-0 w-dvw z-50 p-4 {isClosing
      ? 'animate-slide-up'
      : 'animate-slide-down'}"
  >
    <div class="max-w-screen-md mx-auto {isClosing ? 'animate-fade-out' : 'animate-fade-in'}">
      <div data-suisou-layout="row between" class="mb-2">
        <h3 data-suisou-text="s14 w700">{title}</h3>
        <button
          type="button"
          onclick={onClearAll}
          data-suisou-button="icon"
          aria-label="チェック全解除"
        >
          <IconCircleCheck />
        </button>
      </div>
      <div>{@render children()}</div>
      <button type="button" onclick={onClose} data-suisou-button="wide" class="mt-4">
        <IconChevronUp />
        <span>閉じる</span>
      </button>
    </div>
  </div>
{/if}

<style>
  /* 面は overlay（頁の手前に浮く層）。縁まで届くシートなので角丸は持たず、
     下辺の罫1本だけで区切る ―― surface="drawer" が左辺でやるのと同じ理屈 */
  .sheet {
    background: var(--suisou-overlay);
    border-bottom: 1px solid var(--suisou-line-strong);
  }
</style>
