<script lang="ts">
  import { browser } from '$app/environment';
  import { renderMemoHtml } from '$lib/utils/markdown';
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

  // marked→DOMPurify で無害化。DOMPurify はブラウザ DOM が必要なため browser ガード。
  // モーダルは CSR でのみ表示されるので SSR では空文字で十分。
  let renderedMemo = $derived(browser ? renderMemoHtml(memo) : '');
</script>

<BaseModal {isOpen} {onClose} title="デッキ編集" maxWidth="lg">
  <div data-suisou-layout="stack gap-3">
    <!-- デッキ名 -->
    <div>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label data-suisou-text="s14 w500 sub" class="block mb-2">デッキ名</label>
      {#if !isLoggedIn}
        <div data-suisou-field aria-disabled="true" class="select-none">
          {name || 'デッキ名を入力'}
        </div>
      {:else if isNameEditMode}
        <!-- svelte-ignore a11y_autofocus -->
        <input
          type="text"
          bind:value={name}
          onblur={() => {
            isNameEditMode = false;
          }}
          autofocus
          data-suisou-field="block"
          placeholder="デッキ名を入力"
        />
      {:else}
        <button
          type="button"
          onclick={() => {
            isNameEditMode = true;
          }}
          data-suisou-field="block"
          class="text-left cursor-text"
        >
          {name || 'デッキ名を入力'}
        </button>
      {/if}
    </div>

    <!-- メモ -->
    <div>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label data-suisou-text="s14 w500 sub" class="block mb-2">メモ</label>
      {#if !isLoggedIn}
        <div
          data-suisou-field
          data-suisou-prose="tight"
          aria-disabled="true"
          class="min-h-[200px] select-none"
        >
          <!-- renderedMemo は DOMPurify.sanitize 済み（script/イベントハンドラ除去） -->
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html renderedMemo}
        </div>
      {:else if isEditMode}
        <!-- svelte-ignore a11y_autofocus -->
        <textarea
          bind:value={memo}
          onblur={() => {
            isEditMode = false;
          }}
          autofocus
          data-suisou-field="block"
          class="min-h-[200px] font-mono"
          placeholder="メモを入力（マークダウン対応）"
        ></textarea>
      {:else}
        <button
          type="button"
          onclick={() => {
            isEditMode = true;
          }}
          data-suisou-field="block"
          data-suisou-prose="tight"
          class="min-h-[200px] text-left cursor-text"
        >
          <!-- renderedMemo は DOMPurify.sanitize 済み（script/イベントハンドラ除去） -->
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html renderedMemo}
        </button>
      {/if}
      <p class="mt-1" data-suisou-text="sub s12">
        {#if !isLoggedIn}
          <a href="/login" data-suisou-link>ログインするとデッキを保存できます</a>
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
      data-suisou-button="outline wide"
    >
      保存
    </button>
  </div>
</BaseModal>
