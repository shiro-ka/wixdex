<script lang="ts">
  import type { Card } from '$lib/types';
  import IconStar from '@tabler/icons-svelte/icons/star';
  import IconStarFilled from '@tabler/icons-svelte/icons/star-filled';
  import { cardImageUrl } from '$lib/utils/cardImages';

  interface Props {
    card: Card | null;
    onClose: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    isLoggedIn: boolean;
  }

  let { card, onClose, isFavorite, onToggleFavorite, isLoggedIn }: Props = $props();
</script>

{#if card}
  <div class="fixed inset-0 flex items-center justify-center z-50">
    <button
      class="absolute inset-0 bg-black/70"
      onclick={onClose}
      aria-label="閉じる"
    ></button>
    <div class="relative bg-gray-800 p-2 rounded-xl w-[90vw] max-w-4xl z-10">
      <div class="flex w-full items-stretch justify-center">
        <img
          src={cardImageUrl(card.image)}
          class="w-full aspect-[3/4] object-contain"
          alt={card.name}
        />
        <div class="w-32 flex flex-col items-center pt-2">
          {#if isLoggedIn}
          <button
            onclick={onToggleFavorite}
            class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-700 transition-colors"
            title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
          >
            {#if isFavorite}
              <IconStarFilled class="w-6 h-6 text-gray-300" />
            {:else}
              <IconStar class="w-6 h-6 text-gray-300" />
            {/if}
          </button>
          {/if}
        </div>
      </div>
      <div class="w-full h-16 flex items-center justify-center"></div>
    </div>
  </div>
{/if}
