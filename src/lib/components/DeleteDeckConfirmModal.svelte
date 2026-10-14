<script lang="ts">
  import BaseModal from './BaseModal.svelte';

  interface Props {
    isOpen: boolean;
    deckName: string;
    /** 削除対象が「今開いているデッキ」かつ未保存の変更があるとき true */
    hasUnsavedChanges: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }

  let { isOpen, deckName, hasUnsavedChanges, onConfirm, onCancel }: Props = $props();
</script>

<BaseModal {isOpen} onClose={onCancel} title="デッキを削除" maxWidth="sm">
  <div data-suisou-layout="stack gap-3">
    <p data-suisou="sub">「{deckName}」を削除しますか？</p>
    {#if hasUnsavedChanges}
      <!-- 注意の文言なので warning（accent の橙ではなく意味色）。 -->
      <p data-suisou="warning">このデッキには未保存の変更があります。削除すると失われます。</p>
    {/if}
    <div data-suisou-layout="stack gap-2">
      <button type="button" onclick={onConfirm} data-suisou-button="outline" data-suisou="error w-full">削除する</button>
      <button type="button" onclick={onCancel} data-suisou-button data-suisou="w-full">キャンセル</button>
    </div>
  </div>
</BaseModal>
