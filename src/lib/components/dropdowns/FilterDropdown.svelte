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
  <div
    data-suisou="m:hidden"
    class="sheet {isClosing
      ? 'animate-slide-up'
      : 'animate-slide-down'}"
  >
    <div class="inner {isClosing ? 'animate-fade-out' : 'animate-fade-in'}">
      <div data-suisou-layout="row between" class="head">
        <h3 data-suisou-text="fs-14 fw-700">{title}</h3>
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
      <button type="button" onclick={onClose} data-suisou-button data-suisou="w-full" class="done">
        <IconChevronUp />
        <span>閉じる</span>
      </button>
    </div>
  </div>
{/if}

<style>
  .sheet {
    position: fixed;
    top: 0;
    left: 0;
    width: 100dvw;
    z-index: 50;
    padding: var(--suisou-space-3);
  }
  .inner {
    max-width: 48rem;
    margin-inline: auto;
  }
  .head {
    margin-block-end: var(--suisou-space-2);
  }
  .done {
    margin-block-start: var(--suisou-space-3);
  }

  .sheet {
    background: var(--suisou-color-panel);
    border-bottom: 1px solid var(--suisou-color-line-strong);
  }
</style>
