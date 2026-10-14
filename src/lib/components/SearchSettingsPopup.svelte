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

  let {
    isOpen,
    onClose,
    searchCardName,
    searchCardText,
    onToggleSearchCardName,
    onToggleSearchCardText,
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
    class="veil"
    class:fade={isClosing}
    onclick={handleClose}
    aria-label="閉じる"
  ></button>
  <div
    data-suisou-tray
    class="popup anim"
    class:fade={isClosing}
  >
    <div>
      <h3 data-suisou-text="fs-14 fw-700">テキスト検索設定</h3>
      <div data-suisou-layout="stack gap-2">
        <button type="button" class="toggle" aria-pressed={searchCardName} onclick={onToggleSearchCardName} data-suisou-layout="row gap-2">
          <CheckboxIcon
            checked={searchCardName}
          />
          <span>カード名</span>
        </button>
        <button type="button" class="toggle" aria-pressed={searchCardText} onclick={onToggleSearchCardText} data-suisou-layout="row gap-2">
          <CheckboxIcon
            checked={searchCardText}
          />
          <span>テキスト</span>
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .veil {
    position: fixed;
    inset: 0;
    z-index: 30;
    cursor: default;
    transition: opacity var(--suisou-duration) var(--suisou-ease);
  }
  .fade {
    opacity: 0;
  }

  .anim {
    transition:
      opacity var(--suisou-duration) var(--suisou-ease),
      transform var(--suisou-duration) var(--suisou-ease);
  }
  .anim.fade {
    transform: scale(0.95);
  }

  .toggle {
    width: 100%;
    cursor: pointer;
    justify-content: flex-start;
  }
  .popup {
    position: absolute;
    bottom: 100%;
    left: 0;
    width: 16rem;
    z-index: 40;
    margin: 0 0 var(--suisou-space-2) 0;
  }

  .toggle :global(svg) {
    color: var(--suisou-color-text-sub);
    transition: color var(--suisou-duration-fast) var(--suisou-ease);
  }
  .toggle:hover :global(svg) {
    color: var(--suisou-color-text);
  }
  .toggle[aria-pressed="true"] :global(svg) {
    color: var(--suisou-color-accent);
  }
</style>
