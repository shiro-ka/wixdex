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
  <div data-suisou-layout="stack">
    {#if decks.length === 0}
      <p class="state" data-suisou-text="center" data-suisou="note">保存されたデッキがありません</p>
    {:else}
      {#each decks as deck (deck.id)}
        <div data-suisou-item data-suisou-layout="row stretch gap-0">
          <button type="button" onclick={() => { onSelectDeck(deck); onClose(); }} data-suisou-button="block" data-suisou-layout="stack gap-1 grow" data-suisou-text="start" class="pick">
            <div data-suisou-text="fw-500">{deck.name}</div>
            <div data-suisou="note">
              メイン: {deck.mainCount}枚 / ルリグ: {deck.lrigCount}枚
            </div>
            <div data-suisou-text="fs-12" data-suisou="note">
              {new Date(deck.updatedAt * 1000).toLocaleString('ja-JP')}
            </div>
          </button>
          <button
            type="button"
            onclick={(e) => handleDelete(e, deck)}
            data-suisou-button="outline icon"
            data-suisou="error"
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
