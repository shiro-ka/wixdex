<script lang="ts">
  import { marked } from 'marked';
  import BaseModal from './BaseModal.svelte';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    currentMemo: string;
    isLoggedIn: boolean;
    onSave: (name: string, memo: string) => void;
  }

  let { isOpen, onClose, currentName, currentMemo, isLoggedIn, onSave }: Props = $props();

  let name = $state('');
  let memo = $state('');
  let isEditMode = $state(false);
  let isNameEditMode = $state(false);

  // モーダルを開くたびに現在のデッキ名・メモへリセット（未保存の編集は破棄）
  $effect(() => {
    if (isOpen) {
      name = currentName;
      memo = currentMemo;
    }
  });

  function handleSaveClick() {
    if (!isLoggedIn) return;
    onSave(name, memo);
    onClose();
  }

  let renderedMemo = $derived(marked(memo || '*メモをクリックして編集*') as string);
</script>

<BaseModal {isOpen} {onClose} title="デッキ編集" maxWidth="lg">
  <div class="space-y-4">
    <!-- デッキ名 -->
    <div>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label class="block text-sm font-medium text-gray-300 mb-2">デッキ名</label>
      {#if !isLoggedIn}
        <div class="w-full px-3 py-2 bg-zinc-700/40 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed select-none">
          {name || 'デッキ名を入力'}
        </div>
      {:else if isNameEditMode}
        <!-- svelte-ignore a11y_autofocus -->
        <input
          type="text"
          bind:value={name}
          onblur={() => { isNameEditMode = false; }}
          autofocus
          class="w-full px-3 py-2 bg-zinc-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
          placeholder="デッキ名を入力"
        />
      {:else}
        <button
          type="button"
          onclick={() => { isNameEditMode = true; }}
          class="w-full px-3 py-2 bg-zinc-700 border border-gray-600 rounded-lg text-white text-left cursor-text hover:bg-zinc-700/80 transition-colors"
        >
          {name || 'デッキ名を入力'}
        </button>
      {/if}
    </div>

    <!-- メモ -->
    <div>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label class="block text-sm font-medium text-gray-300 mb-2">メモ</label>
      {#if !isLoggedIn}
        <div class="w-full min-h-[200px] px-3 py-2 bg-zinc-700/40 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed prose prose-invert prose-sm max-w-none select-none">
          {@html renderedMemo}
        </div>
      {:else if isEditMode}
        <!-- svelte-ignore a11y_autofocus -->
        <textarea
          bind:value={memo}
          onblur={() => { isEditMode = false; }}
          autofocus
          class="w-full min-h-[200px] px-3 py-2 bg-zinc-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 font-mono text-sm"
          placeholder="メモを入力（マークダウン対応）"
        ></textarea>
      {:else}
        <button
          type="button"
          onclick={() => { isEditMode = true; }}
          class="w-full min-h-[200px] px-3 py-2 bg-zinc-700 border border-gray-600 rounded-lg text-white text-left prose prose-invert prose-sm max-w-none cursor-text hover:bg-zinc-700/80 transition-colors"
        >
          {@html renderedMemo}
        </button>
      {/if}
      <p class="text-xs text-gray-500 mt-1">
        {#if !isLoggedIn}
          <a href="/login" class="text-orange-400 hover:text-orange-300 transition-colors">ログインするとデッキを保存できます</a>
        {:else}
          {isEditMode ? 'マークダウン記法が使えます' : 'クリックして編集'}
        {/if}
      </p>
    </div>

    <!-- 保存ボタン -->
    <button
      type="button"
      onclick={handleSaveClick}
      disabled={!isLoggedIn}
      class="w-full rounded-lg bg-orange-600 py-2 font-semibold text-white hover:bg-orange-500 active:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-orange-600"
    >
      保存
    </button>
  </div>
</BaseModal>
