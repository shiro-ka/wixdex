<script lang="ts">
  import type { Snippet } from 'svelte';
  import IconX from '@tabler/icons-svelte/icons/x';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: Snippet;
    maxWidth?: 'sm' | 'md' | 'lg';
  }

  let { isOpen, onClose, title, children, maxWidth = 'md' }: Props = $props();

  // ネイティブ <dialog> に任せる。ESC・フォーカスの閉じ込め・重なり順(top layer)・
  // 膜(::backdrop)は全部ブラウザの仕事。見た目は Suisou の overlay が持つ。
  let dialog = $state<HTMLDialogElement>();

  $effect(() => {
    if (dialog && !dialog.open) dialog.showModal();
  });
</script>

{#if isOpen}
  <dialog
    bind:this={dialog}
    class="modal {maxWidth}"
    data-suisou-surface="overlay"
    onclose={onClose}
    onclick={(e) => {
      // 膜のクリックで閉じる。膜のクリックは target が dialog 自身になる。
      // 中身と余白は .inner が受けるので、ここに来るのは膜だけ
      if (e.target === dialog) onClose();
    }}
  >
    <div class="inner" data-suisou-layout="stack">
      <div data-suisou-layout="row between">
        <h2 data-suisou-text="s20 w700">{title}</h2>
        <button data-suisou-button="icon" type="button" onclick={onClose} aria-label="閉じる">
          <IconX />
        </button>
      </div>
      {@render children()}
    </div>
  </dialog>
{/if}

<style>
  /* モーダル固有の仕事だけ: 幅の上限・はみ出しの巻物・膜クリックの判定領域。
     色・罫・角丸・膜・出入りは Suisou の overlay。 */
  .modal {
    width: min(92vw, var(--modal-max, 28rem));
    max-height: 90dvh;
    overflow-y: auto;
    padding: 0; /* 余白は .inner が持つ。縁のクリックを膜と誤判定させない */
  }
  .sm {
    --modal-max: 24rem;
  }
  .md {
    --modal-max: 28rem;
  }
  .lg {
    --modal-max: 32rem;
  }
  .inner {
    padding: var(--suisou-space-3);
  }
</style>
