<script lang="ts">
  import type { Card } from '$lib/types';
  import StarIcon from './icons/StarIcon.svelte';
  import { cardImageUrl } from '$lib/utils/cardImages';

  interface Props {
    card: Card | null;
    onClose: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
  }

  let { card, onClose, isFavorite, onToggleFavorite }: Props = $props();
</script>

{#if card}
  <div
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    onclick={onClose}
  >
    <div
      class="bg-gray-800 p-2 rounded-xl w-[90vw] max-w-4xl"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex w-full items-stretch justify-center">
        <img
          src={cardImageUrl(card.image)}
          class="w-full aspect-[3/4] object-contain"
          alt={card.name}
        />
        <div class="w-32 flex flex-col items-center pt-2">
          <button
            onclick={onToggleFavorite}
            class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-colors"
            title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
          >
            <StarIcon filled={isFavorite} class="w-6 h-6 text-gray-300" />
          </button>
        </div>
      </div>
      <div class="w-full h-16 flex items-center justify-center"></div>
    </div>
  </div>
{/if}
