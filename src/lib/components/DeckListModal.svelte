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
  <div class="space-y-2">
    {#if decks.length === 0}
      <p class="text-gray-400 text-center py-8">保存されたデッキがありません</p>
    {:else}
      {#each decks as deck (deck.id)}
        <!-- 行の下地と hover は Row が持つ。中身は選ぶボタンと削除ボタンの2つ -->
        <div data-suisou-row class="flex w-full items-stretch">
          <button
            type="button"
            onclick={() => {
              onSelectDeck(deck);
              onClose();
            }}
            class="flex-1 text-left p-2"
          >
            <div class="font-medium">{deck.name}</div>
            <div class="text-gray-400 mt-1">
              メイン: {deck.mainCount}枚 / ルリグ: {deck.lrigCount}枚
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {new Date(deck.updatedAt * 1000).toLocaleString('ja-JP')}
            </div>
          </button>
          <button
            type="button"
            onclick={(e) => handleDelete(e, deck)}
            data-suisou-button="danger icon"
            class="self-center"
            title="デッキを削除"
          >
            <IconTrash />
          </button>
        </div>
      {/each}
    {/if}
  </div>
</BaseModal>
