<script lang="ts">
  import LifeBurstIcon from './icons/LifeBurstIcon.svelte';
  import IconPlus from '@tabler/icons-svelte/icons/plus';
  import IconFolderX from '@tabler/icons-svelte/icons/folder-x';
  import IconNumber4 from '@tabler/icons-svelte/icons/number-4';
  import CardImage from './CardImage.svelte';
  import type { Card } from '$lib/types';
  import { cardImageUrl } from '$lib/utils/cardImages';

  interface Props {
    mainDeck: Card[];
    lrigDeck: Card[];
    onCardHover: (card: Card | null) => void;
    onAdd: (card: Card) => void;
    onAddMultiple: (card: Card, count: number) => void;
    onRemove: (card: Card, index?: number, deckType?: 'main' | 'lrig') => void;
    candidateCards: Card[];
    onRemoveFromCandidate: (card: Card) => void;
    onCardClick: (card: Card) => void;
    lifeBurstCount: number;
    showLifeBurst: boolean;
    rotateLandscape: boolean;
  }

  let {
    mainDeck, lrigDeck, onCardHover, onAdd, onAddMultiple, onRemove,
    candidateCards, onRemoveFromCandidate, onCardClick, lifeBurstCount, showLifeBurst,
    rotateLandscape,
  }: Props = $props();

  interface TouchState {
    startY: number;
    startX: number;
    isVerticalSwipe: boolean;
    element: HTMLElement;
  }

  const touchStateMap = new Map<string, TouchState>();

  function handleWheel(e: WheelEvent, card: Card, index: number, deckType: 'main' | 'lrig') {
    e.preventDefault();
    const threshold = 30;
    if (e.deltaY < -threshold) onAdd(card);
    else if (e.deltaY > threshold) onRemove(card, index, deckType);
  }

  function handleTouchStart(e: TouchEvent, key: string) {
    const el = e.currentTarget as HTMLElement;
    touchStateMap.set(key, {
      startY: e.touches[0].clientY,
      startX: e.touches[0].clientX,
      isVerticalSwipe: false,
      element: el,
    });
    el.style.transition = 'none';
  }

  function handleTouchMove(e: TouchEvent, key: string) {
    const state = touchStateMap.get(key);
    if (!state) return;
    const deltaY = Math.abs(state.startY - e.touches[0].clientY);
    const deltaX = Math.abs(state.startX - e.touches[0].clientX);
    if (deltaY > deltaX && deltaY > 15) {
      e.preventDefault();
      state.isVerticalSwipe = true;
      const signedDeltaY = state.startY - e.touches[0].clientY;
      state.element.style.transform = `translateY(${Math.max(-10, Math.min(10, -signedDeltaY))}px)`;
    }
  }

  function handleTouchEnd(e: TouchEvent, key: string, card: Card, index: number, deckType: 'main' | 'lrig') {
    const state = touchStateMap.get(key);
    if (!state) return;
    const deltaY = state.startY - e.changedTouches[0].clientY;
    state.element.style.transition = 'transform 0.2s ease-out';
    state.element.style.transform = 'translateY(0)';
    if (state.isVerticalSwipe) {
      if (deltaY > 30) onAdd(card);
      else if (deltaY < -30) onRemove(card, index, deckType);
    }
    touchStateMap.delete(key);
  }
</script>

<div class="flex flex-col px-2 mb-2 md:mb-1 md:flex-2">
  <!-- ルリグデッキ -->
  <div class="h-fit px-4 py-2 mb-2 bg-zinc-600/10 border border-gray-600/30 rounded-xl">
    <div class="flex w-full">
      <span class="text-base md:text-lg">Lrig Deck</span>
    </div>
    <div class="lrigDeck grid w-full h-[calc(32dvw-4rem)] sm:h-[8rem] lg:h-[calc(11dvw-3rem)] xl:h-[6rem] grid-cols-[repeat(8,_1fr)] grid-rows-[1fr] gap-x-1">
      {#each lrigDeck as card, index (`lrig-${card.cardID}-${index}`)}
        <div class="flex items-center" role="presentation"
          ontouchstart={(e) => handleTouchStart(e, `lrig-${card.cardID}-${index}`)}
          ontouchmove={(e) => handleTouchMove(e, `lrig-${card.cardID}-${index}`)}
          ontouchend={(e) => handleTouchEnd(e, `lrig-${card.cardID}-${index}`, card, index, 'lrig')}
        >
          <CardImage
            {card}
            src={cardImageUrl(card.image)}
            class="w-full object-contain cursor-pointer"
            alt={card.name}
            {showLifeBurst}
            {rotateLandscape}
            fade={false}
            onmouseenter={() => onCardHover(card)}
            onwheel={(e) => handleWheel(e, card, index, 'lrig')}
            onclick={() => onCardClick(card)}
          />
        </div>
      {/each}
    </div>
  </div>

  <!-- メインデッキ -->
  <div class="h-fit px-4 py-2 mb-2 bg-zinc-600/10 border border-gray-600/30 rounded-xl">
    <div class="flex w-full justify-between items-center">
      <span class="text-base md:text-lg">Main Deck</span>
      <div class="flex items-center gap-1 md:gap-1.5">
        <LifeBurstIcon class="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
        <span class="flex items-center justify-center w-4 h-4 md:w-5 md:h-5 pb-[2px] text-sm md:text-base">{lifeBurstCount}</span>
      </div>
    </div>
    <div class="mainDeck grid w-full h-[calc(90dvw-4rem)] lg:h-[calc(36dvw-3rem)] xl:h-[26rem] grid-cols-[repeat(8,_1fr)] grid-rows-[repeat(5,_1fr)] gap-x-1">
      {#each mainDeck as card, index (`main-${card.cardID}-${index}`)}
        <div class="flex items-center" role="presentation"
          ontouchstart={(e) => handleTouchStart(e, `main-${card.cardID}-${index}`)}
          ontouchmove={(e) => handleTouchMove(e, `main-${card.cardID}-${index}`)}
          ontouchend={(e) => handleTouchEnd(e, `main-${card.cardID}-${index}`, card, index, 'main')}
        >
          <CardImage
            {card}
            src={cardImageUrl(card.image)}
            class="w-full object-contain cursor-pointer"
            alt={card.name}
            {showLifeBurst}
            {rotateLandscape}
            fade={false}
            onmouseenter={() => onCardHover(card)}
            onwheel={(e) => handleWheel(e, card, index, 'main')}
            onclick={() => onCardClick(card)}
          />
        </div>
      {/each}
    </div>
  </div>

  <!-- 候補カード (Folder) - PC のみ表示 -->
  <div class="hidden md:flex flex-col flex-1 px-4 py-2 rounded-xl bg-zinc-600/10 border border-gray-600/30 overflow-hidden">
    <div class="flex w-full mb-2">
      <span class="text-base md:text-lg">Folder</span>
    </div>
    <div class="grid grid-cols-5 auto-rows-min gap-2 w-full overflow-y-auto xl:grid-cols-6">
      {#each candidateCards as card, index (`candidate-${card.cardID}-${index}`)}
        <div class="flex flex-col w-full border border-gray-600/50 rounded-lg">
          <div class="flex items-center w-full aspect-[12/17]">
            <CardImage
              {card}
              src={cardImageUrl(card.image)}
              class="object-contain cursor-pointer"
              alt={card.name}
              {showLifeBurst}
              {rotateLandscape}
              onmouseenter={() => onCardHover(card)}
              onclick={() => onCardClick(card)}
            />
          </div>
          <div class="flex justify-center w-full h-8">
            <button class="flex flex-1 text-gray-400 hover:text-gray-100 transition-all items-center justify-center"
              onclick={() => onAdd(card)} title="デッキに1枚追加">
              <IconPlus class="w-[18px] h-[18px]" />
            </button>
            <button class="flex flex-1 text-gray-400 hover:text-gray-100 transition-all items-center justify-center"
              onclick={() => onAddMultiple(card, 4)} title="デッキに4枚追加">
              <IconNumber4 class="w-[18px] h-[18px]" />
            </button>
            <button class="flex flex-1 text-gray-400 hover:text-gray-100 transition-all items-center justify-center"
              onclick={() => onRemoveFromCandidate(card)} title="候補カードから削除">
              <IconFolderX class="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
