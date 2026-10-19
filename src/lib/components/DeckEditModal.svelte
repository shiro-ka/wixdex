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

  let renderedMemo = $derived(browser ? renderMemoHtml(memo) : '');
</script>

<BaseModal {isOpen} {onClose} title="デッキ編集" maxWidth="lg">
  <div data-suisou-layout="stack gap-3">
    <div>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label data-suisou-text="fs-14 fw-500" data-suisou="note">デッキ名</label>
      {#if !isLoggedIn}
        <input type="text" disabled value={name} placeholder="デッキ名を入力" data-suisou="w-full" />
      {:else if isNameEditMode}
        <!-- svelte-ignore a11y_autofocus -->
        <input
          type="text"
          bind:value={name}
          onblur={() => {
            isNameEditMode = false;
          }}
          autofocus
          data-suisou="w-full"
          placeholder="デッキ名を入力"
        />
      {:else}
        <button
          type="button"
          onclick={() => {
            isNameEditMode = true;
          }}
          data-suisou-text="start" class="field text-cursor"
        >
          {name || 'デッキ名を入力'}
        </button>
      {/if}
    </div>

    <div>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label data-suisou-text="fs-14 fw-500" data-suisou="note">メモ</label>
      {#if !isLoggedIn}
        <div
          data-suisou-text="typeset"
          aria-disabled="true"
          class="field tall no-pick"
        >
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
          data-suisou="w-full"
          class="tall mono"
          placeholder="メモを入力（マークダウン対応）"
        ></textarea>
      {:else}
        <button
          type="button"
          onclick={() => {
            isEditMode = true;
          }}
          data-suisou-text="typeset start" class="field tall text-cursor"
        >
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html renderedMemo}
        </button>
      {/if}
      <p data-suisou-text="fs-12" data-suisou="note" class="note">
        {#if !isLoggedIn}
          <a href="/login" data-suisou-text="link">ログインするとデッキを保存できます</a>
        {:else}
          {isEditMode ? 'マークダウン記法が使えます' : 'クリックして編集'}
        {/if}
      </p>
    </div>

    <button
      type="button"
      onclick={handleSaveClick}
      disabled={!isLoggedIn}
      data-suisou-button="outline"
      data-suisou="accent w-full"
    >
      保存
    </button>
  </div>
</BaseModal>

<style>
  .field {
    display: block;
    width: 100%;
    padding: calc((var(--suisou-size-button) - 1lh) / 2 - 1px) var(--suisou-space-2);
    border: 1px solid var(--suisou-color-line-strong);
    border-radius: var(--suisou-radius);
    background: var(--suisou-color-field);
    color: var(--suisou-color-text);
  }
  .field[aria-disabled='true'] {
    border-color: var(--suisou-color-line-weak);
    background: transparent;
    color: var(--suisou-color-text-disabled);
  }
  .tall {
    min-height: 200px;
  }
  .mono {
    font-family: var(--suisou-font-mono);
  }
  .no-pick {
    user-select: none;
  }
  .text-cursor {
    cursor: text;
  }

  .note {
    margin-block-start: var(--suisou-space-1);
  }
</style>
