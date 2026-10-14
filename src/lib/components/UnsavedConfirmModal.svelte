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
  <div data-suisou-layout="stack gap-3">
    <p data-suisou="sub">保存していない変更があります。どうしますか？</p>
    <div data-suisou-layout="stack gap-2">
      <button type="button" onclick={onSave} data-suisou-button="outline" data-suisou="accent w-full"
        >保存して閉じる</button
      >
      <button type="button" onclick={onDiscard} data-suisou-button="outline" data-suisou="w-full"
        >破棄して閉じる</button
      >
      <button type="button" onclick={onCancel} data-suisou-button data-suisou="w-full">キャンセル</button>
    </div>
  </div>
</BaseModal>
