<script lang="ts">
  import type { DeckSummary } from '$lib/types';
  import BaseModal from './BaseModal.svelte';
  import IconTrash from '@tabler/icons-svelte/icons/trash';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    decks: DeckSummary[];
    onSelectDeck: (deck: DeckSummary) => void;
    onRequestDeleteDeck: (deck: DeckSummary) => void;
  }

  let { isOpen, onClose, decks, onSelectDeck, onRequestDeleteDeck }: Props = $props();

  function handleDelete(e: MouseEvent, deck: DeckSummary) {
    e.stopPropagation();
    onRequestDeleteDeck(deck);
  }
</script>

<BaseModal {isOpen} {onClose} title="デッキ一覧">
  <div data-suisou-layout="stack gap-2">
    {#if decks.length === 0}
      <p class="state" data-suisou-text="sub center">保存されたデッキがありません</p>
    {:else}
      {#each decks as deck (deck.id)}
        <!-- 行の下地と hover は Row が持つ。中身は選ぶボタンと削除ボタンの2つ -->
        <div data-suisou-row data-suisou-layout="row stretch gap-0">
          <button type="button" onclick={() => { onSelectDeck(deck); onClose(); }} data-suisou-text="start" class="pick" data-suisou-layout="stack gap-1 grow">
            <div data-suisou-text="w500">{deck.name}</div>
            <div data-suisou-text="sub">
              メイン: {deck.mainCount}枚 / ルリグ: {deck.lrigCount}枚
            </div>
            <div data-suisou-text="sub s12">
              {new Date(deck.updatedAt * 1000).toLocaleString('ja-JP')}
            </div>
          </button>
          <button
            type="button"
            onclick={(e) => handleDelete(e, deck)}
            data-suisou-button="danger icon"
            class="mid"
            title="デッキを削除"
          >
            <IconTrash />
          </button>
        </div>
      {/each}
    {/if}
  </div>
</BaseModal>

<style>
  .state {
    padding-block: var(--suisou-space-4);
  }
  .pick {
    padding: var(--suisou-space-2);
  }
  .mid {
    align-self: center;
  }
</style>
