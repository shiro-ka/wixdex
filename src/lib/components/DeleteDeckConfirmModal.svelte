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
  <div class="space-y-4">
    <p class="text-gray-300">「{deckName}」を削除しますか？</p>
    {#if hasUnsavedChanges}
      <p class="text-sm text-orange-400">
        このデッキには未保存の変更があります。削除すると失われます。
      </p>
    {/if}
    <div class="flex flex-col gap-2">
      <button
        type="button"
        onclick={onConfirm}
        class="w-full rounded-lg bg-red-600 py-2 font-semibold text-white hover:bg-red-500 active:bg-red-700 transition-colors"
      >
        削除する
      </button>
      <button
        type="button"
        onclick={onCancel}
        class="w-full rounded-lg py-2 font-medium text-gray-400 hover:text-gray-200 transition-colors"
      >
        キャンセル
      </button>
    </div>
  </div>
</BaseModal>
