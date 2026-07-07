<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { createVirtualizer, type SvelteVirtualizer } from '@tanstack/svelte-virtual';
  import CardImage from './CardImage.svelte';
  import IconPlus from '@tabler/icons-svelte/icons/plus';
  import IconFolderPlus from '@tabler/icons-svelte/icons/folder-plus';
  import IconFolderX from '@tabler/icons-svelte/icons/folder-x';
  import IconBoxMultiple4 from '@tabler/icons-svelte/icons/box-multiple-4';
  import type { Card } from '$lib/types';
  import { cardImageUrl } from '$lib/utils/cardImages';
  import { isMainDeckCard } from '$lib/utils/cardTypeUtils';

  interface Props {
    cards: Card[];
    loading?: boolean;
    loadError?: string | null;
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
    rotateLandscape: boolean;
  }

  let {
    cards, loading = false, loadError = null,
    onAdd, onAddMultiple, onCardHover,
    onAddToCandidate, onRemoveFromCandidate,
    candidateFilter, onCardClick,
    showLifeBurst, showCandidateIcon, candidateCards, rotateLandscape,
  }: Props = $props();

  // ── virtualization geometry ────────────────────────────────
  // Desktop: a 3-column vertical grid handled by TanStack's `lanes`.
  // Mobile: a single-row horizontal strip.
  const COLS = 3;
  const GAP = 8;          // gap between grid columns/rows (px)
  const PAD_X = 8;        // horizontal inset of the grid (px)
  const STRIP_W = 64;     // mobile card width (w-16)
  const STRIP_GAP = 8;    // mobile gap between cards
  const STRIP_STRIDE = STRIP_W + STRIP_GAP;

  let scrollEl = $state<HTMLDivElement | null>(null);
  let isMd = $state(false);
  let containerWidth = $state(0);

  let colWidth = $derived(
    containerWidth > 0 ? (containerWidth - PAD_X * 2 - GAP * (COLS - 1)) / COLS : 0,
  );
  // Estimate only — measureElement reports the real height once a row renders.
  let estRowHeight = $derived(colWidth > 0 ? colWidth * (17 / 12) + 42 : 180);
  function laneLeft(lane: number): number {
    return PAD_X + lane * (colWidth + GAP);
  }

  // O(1) candidate lookup
  let candidateKeySet = $derived(new Set(
    candidateCards.flatMap(c => [c.cardID, c.image].filter((v): v is string => v != null))
  ));

  function isCardInCandidates(card: Card): boolean {
    return (card.cardID != null && candidateKeySet.has(card.cardID)) || candidateKeySet.has(card.image);
  }

  // ── TanStack virtualizers (one per layout, only the active one mounts) ──
  // `count` starts at 0; the $effect below keeps it (and the other options) in
  // sync with the reactive `cards` once the component is live.
  const gridV = createVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: 0,
    getScrollElement: () => scrollEl,
    estimateSize: () => estRowHeight,
    overscan: 12,
    lanes: COLS,
  });

  const stripV = createVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: 0,
    getScrollElement: () => scrollEl,
    estimateSize: () => STRIP_STRIDE,
    overscan: 10,
    horizontal: true,
  });

  // Keep the active virtualizer's options in sync. `get()` reads the instance
  // without adding a lasting subscription (the template already subscribes via
  // `$gridV` / `$stripV`), so this never re-mounts or loops.
  $effect(() => {
    const count = cards.length;
    if (isMd) {
      const est = estRowHeight;
      get(gridV).setOptions({
        count,
        getScrollElement: () => scrollEl,
        estimateSize: () => est,
        overscan: 12,
        lanes: COLS,
      });
    } else {
      get(stripV).setOptions({
        count,
        getScrollElement: () => scrollEl,
        estimateSize: () => STRIP_STRIDE,
        overscan: 10,
        horizontal: true,
      });
    }
  });

  // A new filter result starts from the top. Keyed on length so unrelated
  // updates (e.g. stashing a card while the filter is unchanged) don't jump
  // the scroll position.
  let prevCount = -1;
  $effect(() => {
    const count = cards.length;
    if (count !== prevCount) {
      prevCount = count;
      scrollEl?.scrollTo({ top: 0, left: 0 });
    }
  });

  function measure(node: HTMLDivElement, virtualizer: SvelteVirtualizer<HTMLDivElement, HTMLDivElement>) {
    virtualizer.measureElement(node);
    return {
      update(v: SvelteVirtualizer<HTMLDivElement, HTMLDivElement>) { v.measureElement(node); },
    };
  }

  onMount(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    isMd = mq.matches;
    const onMq = (e: MediaQueryListEvent) => { isMd = e.matches; };
    mq.addEventListener('change', onMq);

    // Seed the width synchronously so the first grid layout isn't zero-width
    // while we wait for the ResizeObserver's first async callback.
    if (scrollEl) containerWidth = scrollEl.clientWidth;
    const ro = new ResizeObserver(entries => {
      containerWidth = entries[0].contentRect.width;
    });
    if (scrollEl) ro.observe(scrollEl);

    return () => {
      mq.removeEventListener('change', onMq);
      ro.disconnect();
    };
  });

  // ── touch gestures (swipe to add / hold over folder to stash) ──
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

  function getImg(node: HTMLElement): HTMLImageElement | null {
    return node.querySelector('img');
  }

  function handleTouchStart(e: TouchEvent, _card: Card) {
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

{#snippet cardCell(card: Card, withButtons: boolean)}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="flex flex-col {withButtons ? 'w-full border border-gray-600/50 rounded-lg' : 'w-16 justify-center'} h-full"
    ontouchstart={(e) => handleTouchStart(e, card)}
    ontouchmove={(e) => handleTouchMove(e, card)}
    ontouchend={(e) => handleTouchEnd(e, card)}
  >
    {#if withButtons}
      <div class="flex items-center w-full aspect-[12/17]">
        <CardImage
          {card}
          src={cardImageUrl(card.image)}
          class="object-contain"
          alt={card.name}
          {showLifeBurst}
          {showCandidateIcon}
          {rotateLandscape}
          isInCandidates={isCardInCandidates(card)}
          fadeToken={cards}
          onmouseenter={() => onCardHover(card)}
          onclick={() => onCardClick(card)}
        />
      </div>
      <div class="flex justify-center w-full h-8">
        <button
          class="flex flex-1 text-gray-400 hover:text-gray-100 transition-all items-center justify-center"
          onclick={() => onAdd(card)} title="デッキに1枚追加"
        >
          <IconPlus class="w-5 h-5" />
        </button>
        {#if isMainDeckCard(card)}
          <button
            class="flex flex-1 text-gray-400 hover:text-gray-100 transition-all items-center justify-center"
            onclick={() => onAddMultiple(card, 4)} title="デッキに4枚追加"
          >
            <IconBoxMultiple4 class="w-5 h-5" />
          </button>
        {/if}
        <button
          class="flex flex-1 text-gray-400 hover:text-gray-100 transition-all items-center justify-center"
          onclick={() => { if (candidateFilter) onRemoveFromCandidate(card); else onAddToCandidate(card); }}
          title={candidateFilter ? '候補カードから削除' : '候補カードに追加'}
        >
          {#if candidateFilter}
            <IconFolderX class="w-5 h-5" />
          {:else}
            <IconFolderPlus class="w-5 h-5" />
          {/if}
        </button>
      </div>
    {:else}
      <CardImage
        {card}
        src={cardImageUrl(card.image)}
        class="object-contain"
        alt={card.name}
        {showLifeBurst}
        {showCandidateIcon}
        {rotateLandscape}
        isInCandidates={isCardInCandidates(card)}
        fadeToken={cards}
        onmouseenter={() => onCardHover(card)}
        onclick={() => onCardClick(card)}
      />
    {/if}
  </div>
{/snippet}

<div
  bind:this={scrollEl}
  class="flex-1 min-h-0 max-w-full py-3 mb-1 {isMd
    ? 'rounded-xl border border-gray-600/50 overflow-y-auto overflow-x-hidden'
    : 'overflow-x-auto overflow-y-hidden'}"
  style="touch-action: {isMd ? 'pan-y' : 'pan-x'}"
>
  {#if loading}
    <div class="flex items-center justify-center w-full h-32">
      <div class="w-10 h-10 border-3 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  {:else if loadError}
    <div class="flex items-center justify-center w-full h-32 text-red-400 text-sm px-4 text-center">{loadError}</div>
  {:else if isMd}
    <!-- Desktop: virtualized 3-column grid -->
    <div class="relative w-full" style="height: {$gridV.getTotalSize()}px">
      {#each $gridV.getVirtualItems() as row (cards[row.index]?.cardID ?? cards[row.index]?.image ?? row.index)}
        {@const card = cards[row.index]}
        {#if card}
          <div
            data-index={row.index}
            use:measure={$gridV}
            class="absolute top-0 pb-2"
            style="left: {Math.round(laneLeft(row.lane))}px; width: {colWidth}px; transform: translateY({Math.round(row.start)}px)"
          >
            {@render cardCell(card, true)}
          </div>
        {/if}
      {/each}
    </div>
  {:else}
    <!-- Mobile: virtualized horizontal strip -->
    <div class="relative h-full" style="width: {$stripV.getTotalSize()}px">
      {#each $stripV.getVirtualItems() as item (cards[item.index]?.cardID ?? cards[item.index]?.image ?? item.index)}
        {@const card = cards[item.index]}
        {#if card}
          <div
            class="absolute top-0 h-full"
            style="left: 0; width: {STRIP_W}px; transform: translateX({Math.round(item.start)}px)"
          >
            {@render cardCell(card, false)}
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>
