<script lang="ts">
  import { marked } from 'marked';
  import BaseModal from './BaseModal.svelte';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    currentMemo: string;
    onSave: (name: string, memo: string) => void;
  }

  let { isOpen, onClose, currentName, currentMemo, onSave }: Props = $props();

  let name = $state('');
  let memo = $state('');
  let isEditMode = $state(false);
  let isNameEditMode = $state(false);

  $effect(() => {
    name = currentName;
    memo = currentMemo;
  });

  function handleClose() {
    onSave(name, memo);
    onClose();
  }

  let renderedMemo = $derived(marked(memo || '*メモをクリックして編集*') as string);
</script>

<BaseModal {isOpen} onClose={handleClose} title="デッキ編集" maxWidth="lg">
  <div class="space-y-4">
    <!-- デッキ名 -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">デッキ名</label>
      {#if isNameEditMode}
        <input
          type="text"
          bind:value={name}
          onblur={() => { isNameEditMode = false; }}
          autofocus
          class="w-full px-3 py-2 bg-zinc-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
          placeholder="デッキ名を入力"
        />
      {:else}
        <div
          onclick={() => { isNameEditMode = true; }}
          class="w-full px-3 py-2 bg-zinc-700 border border-gray-600 rounded-lg text-white cursor-text hover:bg-zinc-700/80 transition-colors"
        >
          {name || 'デッキ名を入力'}
        </div>
      {/if}
    </div>

    <!-- メモ -->
    <div>
      <label class="block text-sm font-medium text-gray-300 mb-2">メモ</label>
      {#if isEditMode}
        <textarea
          bind:value={memo}
          onblur={() => { isEditMode = false; }}
          autofocus
          class="w-full min-h-[200px] px-3 py-2 bg-zinc-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 font-mono text-sm"
          placeholder="メモを入力（マークダウン対応）"
        ></textarea>
      {:else}
        <div
          onclick={() => { isEditMode = true; }}
          class="w-full min-h-[200px] px-3 py-2 bg-zinc-700 border border-gray-600 rounded-lg text-white prose prose-invert prose-sm max-w-none cursor-text hover:bg-zinc-700/80 transition-colors"
        >
          {@html renderedMemo}
        </div>
      {/if}
      <p class="text-xs text-gray-500 mt-1">
        {isEditMode ? 'マークダウン記法が使えます（クリック外で保存）' : 'クリックして編集'}
      </p>
    </div>
  </div>
</BaseModal>
