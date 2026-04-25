<script lang="ts">
  import CardImage from './CardImage.svelte';
  import PlusIcon from './icons/PlusIcon.svelte';
  import FolderIcon from './icons/FolderIcon.svelte';
  import type { Card } from '$lib/types';

  interface Props {
    cards: Card[];
    onAdd: (card: Card) => void;
    onAddMultiple: (card: Card, count: number) => void;
    onRemove: (card: Card) => void;
    onCardHover: (card: Card | null) => void;
    onAddToCandidate: (card: Card) => void;
    onRemoveFromCandidate: (card: Card) => void;
    candidateFilter: boolean;
    onCardClick: (card: Card) => void;
    showLifeBurst: boolean;
    showCandidateIcon: boolean;
    candidateCards: Card[];
  }

  let {
    cards, onAdd, onAddMultiple, onCardHover,
    onAddToCandidate, onRemoveFromCandidate,
    candidateFilter, onCardClick,
    showLifeBurst, showCandidateIcon, candidateCards,
  }: Props = $props();

  interface TouchState {
    startY: number;
    startX: number;
    startTime: number;
    isVerticalSwipe: boolean;
    isHolding: boolean;
    isOverFolder: boolean;
    holdTimer: ReturnType<typeof setTimeout> | null;
  }

  const touchStates = new Map<HTMLElement, TouchState>();

  function isCardInCandidates(card: Card): boolean {
    return candidateCards.some(c => (!!c.id && c.id === card.id) || c.image === card.image);
  }

  function getImg(node: HTMLElement): HTMLImageElement | null {
    return node.querySelector('img');
  }

  function handleTouchStart(e: TouchEvent, card: Card) {
    const node = e.currentTarget as HTMLElement;
    const touch = e.touches[0];
    touchStates.set(node, {
      startY: touch.clientY,
      startX: touch.clientX,
      startTime: Date.now(),
      isVerticalSwipe: false,
      isHolding: false,
      isOverFolder: false,
      holdTimer: null,
    });
    const img = getImg(node);
    if (img) img.style.transition = 'none';
  }

  function handleTouchMove(e: TouchEvent, card: Card) {
    const node = e.currentTarget as HTMLElement;
    const state = touchStates.get(node);
    if (!state || state.isHolding) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = Math.abs(state.startY - currentY);
    const deltaX = Math.abs(state.startX - currentX);

    const touchedEl = document.elementFromPoint(currentX, currentY);
    const folderBtn = document.getElementById('folder-button');
    const isOverFolder = !!folderBtn && (touchedEl === folderBtn || folderBtn.contains(touchedEl));

    if (isOverFolder && !state.holdTimer) {
      state.isOverFolder = true;
      state.holdTimer = setTimeout(() => {
        if (state.isOverFolder) {
          state.isHolding = true;
          state.isVerticalSwipe = false;
          if (candidateFilter) onRemoveFromCandidate(card);
          else onAddToCandidate(card);
          if (folderBtn) {
            folderBtn.style.transform = 'scale(1.1)';
            setTimeout(() => { folderBtn.style.transform = 'scale(1)'; }, 200);
          }
        }
      }, 700);
    }

    if (!isOverFolder && state.holdTimer) {
      clearTimeout(state.holdTimer);
      state.holdTimer = null;
      state.isOverFolder = false;
    }

    if (deltaY > deltaX && deltaY > 5 && !isOverFolder) {
      e.preventDefault();
      state.isVerticalSwipe = true;
      if (state.holdTimer) { clearTimeout(state.holdTimer); state.holdTimer = null; state.isOverFolder = false; }
      const img = getImg(node);
      if (img) {
        const translateY = Math.max(-10, Math.min(10, -(state.startY - currentY)));
        img.style.transform = `translateY(${translateY}px)`;
      }
    }
  }

  function handleTouchEnd(e: TouchEvent, card: Card) {
    const node = e.currentTarget as HTMLElement;
    const state = touchStates.get(node);
    if (!state) return;

    if (state.holdTimer) { clearTimeout(state.holdTimer); state.holdTimer = null; }

    const img = getImg(node);
    if (img) {
      img.style.transition = 'transform 0.2s ease-out';
      img.style.transform = 'translateY(0)';
    }

    if (state.isHolding) { state.isHolding = false; state.isOverFolder = false; touchStates.delete(node); return; }

    if (state.isVerticalSwipe) {
      const deltaY = state.startY - e.changedTouches[0].clientY;
      if (deltaY > 30) onAdd(card);
      else if (deltaY < -30) onAddMultiple(card, 4);
    }
    touchStates.delete(node);
  }
</script>

<div
  class="flex flex-1 gap-2 max-w-full py-3 mb-1 overflow-x-auto md:grid md:grid-cols-3 md:auto-rows-min md:px-2 md:rounded-xl md:border-1 md:border-gray-600/50 md:overflow-y-auto md:overflow-x-hidden"
  style="touch-action: pan-x"
>
  {#each cards as card, index (card.id ? `${card.id}-${index}` : `${card.image}-${index}`)}
    <div>
      <div
        class="flex flex-col items-center justify-center w-16 h-full cursor-pointer md:w-full"
        ontouchstart={(e) => handleTouchStart(e, card)}
        ontouchmove={(e) => handleTouchMove(e, card)}
        ontouchend={(e) => handleTouchEnd(e, card)}
      >
        <div class="hidden md:flex items-center w-full aspect-[12/17]">
          <CardImage
            {card}
            src="/assets/cards_img/{card.image}"
            class="object-contain"
            alt={card.name}
            {showLifeBurst}
            {showCandidateIcon}
            isInCandidates={isCardInCandidates(card)}
            onmouseenter={() => onCardHover(card)}
            onclick={() => onCardClick(card)}
          />
        </div>
        <CardImage
          {card}
          src="/assets/cards_img/{card.image}"
          class="object-contain md:hidden"
          alt={card.name}
          {showLifeBurst}
          {showCandidateIcon}
          isInCandidates={isCardInCandidates(card)}
          onmouseenter={() => onCardHover(card)}
          onclick={() => onCardClick(card)}
        />
        <div class="hidden md:flex justify-center gap-2 w-full h-8">
          <button
            class="flex flex-1 items-center justify-center p-0 rounded-lg bg-zinc-600/10 hover:bg-zinc-500/30 border border-gray-600/50 transition-all"
            onclick={() => onAdd(card)} title="デッキに1枚追加"
          >
            <PlusIcon class="w-5 h-5 text-gray-400" />
          </button>
          <button
            class="flex flex-1 items-center justify-center p-0 rounded-lg bg-zinc-600/10 hover:bg-zinc-500/30 border border-gray-600/50 transition-all"
            onclick={() => onAddMultiple(card, 4)} title="デッキに4枚追加"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-gray-400">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M15 20v-15l-8 11h10" />
            </svg>
          </button>
          <button
            class="flex flex-1 items-center justify-center p-0 rounded-lg bg-zinc-600/10 hover:bg-zinc-500/30 border border-gray-600/50 transition-all"
            onclick={() => { candidateFilter ? onRemoveFromCandidate(card) : onAddToCandidate(card); }}
            title={candidateFilter ? '候補カードから削除' : '候補カードに追加'}
          >
            <FolderIcon mode={candidateFilter ? 'remove' : 'add'} class="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  {/each}
</div>
