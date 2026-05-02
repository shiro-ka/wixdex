<script lang="ts">
  import type { DeckSummary } from '$lib/types';
  import BaseModal from './BaseModal.svelte';
  import IconTrash from '@tabler/icons-svelte/icons/trash';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    decks: DeckSummary[];
    onSelectDeck: (deck: DeckSummary) => void;
    onDeleteDeck: (deckId: string) => void;
  }

  let { isOpen, onClose, decks, onSelectDeck, onDeleteDeck }: Props = $props();

  function handleDelete(e: MouseEvent, deckId: string, deckName: string) {
    e.stopPropagation();
    if (window.confirm(`「${deckName}」を削除しますか？`)) {
      onDeleteDeck(deckId);
    }
  }
</script>

<BaseModal {isOpen} {onClose} title="デッキ一覧">
  <div class="space-y-2">
    {#if decks.length === 0}
      <p class="text-gray-400 text-center py-8">保存されたデッキがありません</p>
    {:else}
      {#each decks as deck (deck.id)}
        <div class="flex w-full bg-zinc-700/50 hover:bg-zinc-700 rounded-lg transition-colors">
          <button
            onclick={() => { onSelectDeck(deck); onClose(); }}
            class="flex-1 text-left p-4"
          >
            <div class="text-white font-medium">{deck.name}</div>
            <div class="text-sm text-gray-400 mt-1">
              メイン: {deck.mainCount}枚 / ルリグ: {deck.lrigCount}枚
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {new Date(deck.updatedAt * 1000).toLocaleString('ja-JP')}
            </div>
          </button>
          <button
            onclick={(e) => handleDelete(e, deck.id, deck.name)}
            class="flex items-center justify-center w-12 text-gray-400 hover:text-red-400 transition-colors"
            title="デッキを削除"
          >
            <IconTrash class="w-5 h-5" />
          </button>
        </div>
      {/each}
    {/if}
  </div>
</BaseModal>
