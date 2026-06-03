<script lang="ts">
  import BaseModal from './BaseModal.svelte';

  interface Props {
    isOpen: boolean;
    onCancel: () => void;
    onSave: () => void;
    onDiscard: () => void;
  }

  let { isOpen, onCancel, onSave, onDiscard }: Props = $props();
</script>

<BaseModal {isOpen} onClose={onCancel} title="未保存の変更があります" maxWidth="sm">
  <div class="space-y-4">
    <p class="text-gray-300">保存していない変更があります。どうしますか？</p>
    <div class="flex flex-col gap-2">
      <button
        type="button"
        onclick={onSave}
        class="w-full rounded-lg bg-orange-600 py-2 font-semibold text-white hover:bg-orange-500 active:bg-orange-700 transition-colors"
      >
        保存して閉じる
      </button>
      <button
        type="button"
        onclick={onDiscard}
        class="w-full rounded-lg bg-zinc-700 py-2 font-semibold text-white hover:bg-zinc-600 active:bg-zinc-800 transition-colors"
      >
        破棄して閉じる
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
