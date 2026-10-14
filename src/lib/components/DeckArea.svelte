<script lang="ts">
  import LifeBurstIcon from './icons/LifeBurstIcon.svelte';
  import CardImage from './CardImage.svelte';
  import CardTile from './CardTile.svelte';
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
    mainDeck,
    lrigDeck,
    onCardHover,
    onAdd,
    onAddMultiple,
    onRemove,
    candidateCards,
    onRemoveFromCandidate,
    onCardClick,
    lifeBurstCount,
    showLifeBurst,
    rotateLandscape,
  }: Props = $props();

  interface TouchState {
    startY: number;
    startX: number;
    isVerticalSwipe: boolean;
    element: HTMLElement;
  }

  const touchStateMap = new Map<string, TouchState>();

  function withKeys(cards: Card[], prefix: string): { card: Card; key: string; index: number }[] {
    const seen = new Map<string, number>();
    return cards.map((card, index) => {
      const id = card.cardID ?? card.image;
      const n = seen.get(id) ?? 0;
      seen.set(id, n + 1);
      return { card, key: `${prefix}-${id}-${n}`, index };
    });
  }
  let lrigKeyed = $derived(withKeys(lrigDeck, 'lrig'));
  let mainKeyed = $derived(withKeys(mainDeck, 'main'));
  let candidateKeyed = $derived(withKeys(candidateCards, 'candidate'));

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

  function handleTouchEnd(
    e: TouchEvent,
    key: string,
    card: Card,
    index: number,
    deckType: 'main' | 'lrig',
  ) {
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

<div class="deck-side" data-suisou-layout="stack s:grow gap-2">
  <div class="deck-panel" data-suisou-tray>
    <div data-suisou-layout="row">
      <span data-suisou-text="fs-16 fw-500">Lrig Deck</span>
    </div>
    <div class="deck-grid lrig">
      {#each lrigKeyed as { card, key, index } (key)}
        <div
          role="presentation"
          ontouchstart={(e) => handleTouchStart(e, key)}
          ontouchmove={(e) => handleTouchMove(e, key)}
          ontouchend={(e) => handleTouchEnd(e, key, card, index, 'lrig')}
        >
          <CardImage
            {card}
            src={cardImageUrl(card.image)}
            class="card-img"
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

  <div class="deck-panel" data-suisou-tray>
    <div data-suisou-layout="row between">
      <span data-suisou-text="fs-16 fw-500">Main Deck</span>
      <div class="burst" data-suisou-layout="row gap-1">
        <LifeBurstIcon class="burst-icon" data-suisou="sub"/>
        <span data-suisou-layout="row middle" data-suisou-text="fs-14 s:fs-16" class="burst-num">{lifeBurstCount}</span
        >
      </div>
    </div>
    <div class="deck-grid main">
      {#each mainKeyed as { card, key, index } (key)}
        <div
          role="presentation"
          ontouchstart={(e) => handleTouchStart(e, key)}
          ontouchmove={(e) => handleTouchMove(e, key)}
          ontouchend={(e) => handleTouchEnd(e, key, card, index, 'main')}
        >
          <CardImage
            {card}
            src={cardImageUrl(card.image)}
            class="card-img"
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

  <div data-suisou-tray data-suisou-layout="stack" data-suisou="s>hidden" class="folder">
    <div class="panel-head" data-suisou-layout="row">
      <span data-suisou-text="fs-16 fw-500">Folder</span>
    </div>
    <div class="folder-grid" data-suisou-layout="grid gap-2">
      {#each candidateKeyed as { card, key } (key)}
        <CardTile
          {card}
          {showLifeBurst}
          {rotateLandscape}
          folderAction="remove"
          onHover={onCardHover}
          onClick={onCardClick}
          {onAdd}
          {onAddMultiple}
          onFolder={onRemoveFromCandidate}
        />
      {/each}
    </div>
  </div>
</div>

<style>

  .deck-side {
    padding-inline: var(--suisou-space-2);
    margin-block-end: var(--suisou-space-2);
  }
  @media (min-width: 768px) {
    .deck-side {
      margin-block-end: var(--suisou-space-1);
    }
  }

  .deck-panel {
    height: fit-content;
  }
  .panel-head {
    margin-block-end: var(--suisou-space-2);
  }

  .deck-side :global(.card-img) {
    width: 100%;
    object-fit: contain;
    cursor: pointer;
  }

  .burst :global(.burst-icon) {
    width: var(--suisou-size-icon-small);
    height: var(--suisou-size-icon-small);
  }
  .burst-num {
    width: 1rem;
    height: 1rem;
    padding-block-end: 2px;
  }
  @media (min-width: 768px) {
    .burst-num {
      width: 1.25rem;
      height: 1.25rem;
    }
  }

  .folder {
    overflow: hidden;
  }
  .folder-grid {
    overflow-y: auto;
  }

  .folder-grid {
    --suisou-grid-cols: repeat(5, minmax(0, 1fr));
    grid-auto-rows: min-content;
  }
  @media (min-width: 1280px) {
    .folder-grid {
      --suisou-grid-cols: repeat(6, minmax(0, 1fr));
    }
  }

  .folder {
    flex: 1 1 0;
    min-height: 0;
  }


  @media (min-width: 768px) {
    .burst {
      gap: 6px;
    }
  }


  .deck-panel {
    container-type: inline-size;
  }
  .deck-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    column-gap: var(--suisou-space-1);
    width: 100%;
  }

  .lrig {
    grid-template-rows: 1fr;
    min-height: calc((100cqw - 7 * var(--suisou-space-1)) * 17 / 96);
  }
  .main {
    grid-template-rows: repeat(5, 1fr);
    min-height: calc((100cqw - 7 * var(--suisou-space-1)) * 85 / 96);
  }

  .deck-grid > * {
    aspect-ratio: 12 / 17;
    display: flex;
    align-items: center;
  }
</style>
