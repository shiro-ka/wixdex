<script lang="ts">
  import type { SavedDeck } from '$lib/types';
  import BaseModal from './BaseModal.svelte';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    decks: SavedDeck[];
    onSelectDeck: (deck: SavedDeck) => void;
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
              メイン: {deck.mainDeck.length}枚 / ルリグ: {deck.lrigDeck.length}枚
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {new Date(deck.updatedAt).toLocaleString('ja-JP')}
            </div>
          </button>
          <button
            onclick={(e) => handleDelete(e, deck.id, deck.name)}
            class="flex items-center justify-center w-12 text-gray-400 hover:text-red-400 transition-colors"
            title="デッキを削除"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M4 7l16 0" />
              <path d="M10 11l0 6" />
              <path d="M14 11l0 6" />
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </svg>
          </button>
        </div>
      {/each}
    {/if}
  </div>
</BaseModal>
