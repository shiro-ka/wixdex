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
    <p data-suisou-text="sub">保存していない変更があります。どうしますか？</p>
    <div class="flex flex-col gap-2">
      <!-- 強さの3段: 目的の一本は outline、対等な代替は plain（罫だけ）、
           逃げ道は基本形（幽霊）。全部 wide で縦に積む -->
      <button type="button" onclick={onSave} data-suisou-button="outline wide"
        >保存して閉じる</button
      >
      <button type="button" onclick={onDiscard} data-suisou-button="plain wide"
        >破棄して閉じる</button
      >
      <button type="button" onclick={onCancel} data-suisou-button="wide">キャンセル</button>
    </div>
  </div>
</BaseModal>
