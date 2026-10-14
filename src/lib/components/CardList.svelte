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
  import { createCardGestures } from '$lib/utils/cardTouchGestures';

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
    cards,
    loading = false,
    loadError = null,
    onAdd,
    onAddMultiple,
    onCardHover,
    onAddToCandidate,
    onRemoveFromCandidate,
    candidateFilter,
    onCardClick,
    showLifeBurst,
    showCandidateIcon,
    candidateCards,
    rotateLandscape,
  }: Props = $props();

  const COLS = 3;
  const GAP = 8;
  const PAD_X = 8;
  const STRIP_W = 64;
  const STRIP_GAP = 8;
  const STRIP_STRIDE = STRIP_W + STRIP_GAP;

  let scrollEl = $state<HTMLDivElement | null>(null);
  let isMd = $state(false);
  let containerWidth = $state(0);

  let colWidth = $derived(
    containerWidth > 0 ? (containerWidth - PAD_X * 2 - GAP * (COLS - 1)) / COLS : 0,
  );
  let estRowHeight = $derived(colWidth > 0 ? colWidth * (17 / 12) + 38 : 180);
  function laneLeft(lane: number): number {
    return PAD_X + lane * (colWidth + GAP);
  }

  let candidateKeySet = $derived(
    new Set(
      candidateCards.flatMap((c) => [c.cardID, c.image].filter((v): v is string => v != null)),
    ),
  );

  function isCardInCandidates(card: Card): boolean {
    return (
      (card.cardID != null && candidateKeySet.has(card.cardID)) || candidateKeySet.has(card.image)
    );
  }

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

  let prevCount = -1;
  $effect(() => {
    const count = cards.length;
    if (count !== prevCount) {
      prevCount = count;
      scrollEl?.scrollTo({ top: 0, left: 0 });
    }
  });

  function measure(
    node: HTMLDivElement,
    virtualizer: SvelteVirtualizer<HTMLDivElement, HTMLDivElement>,
  ) {
    virtualizer.measureElement(node);
    return {
      update(v: SvelteVirtualizer<HTMLDivElement, HTMLDivElement>) {
        v.measureElement(node);
      },
    };
  }

  onMount(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    isMd = mq.matches;
    const onMq = (e: MediaQueryListEvent) => {
      isMd = e.matches;
    };
    mq.addEventListener('change', onMq);

    if (scrollEl) containerWidth = scrollEl.clientWidth;
    const ro = new ResizeObserver((entries) => {
      containerWidth = entries[0].contentRect.width;
    });
    if (scrollEl) ro.observe(scrollEl);

    return () => {
      mq.removeEventListener('change', onMq);
      ro.disconnect();
    };
  });

  const gestures = createCardGestures<Card>({
    onSwipeUp: (card) => onAdd(card),
    onSwipeDown: (card) => onAddMultiple(card, 4),
    onHold: (card) => (candidateFilter ? onRemoveFromCandidate(card) : onAddToCandidate(card)),
    folderId: 'folder-button',
  });
</script>

{#snippet cardCell(card: Card, withButtons: boolean)}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="cell-box"
    class:framed={withButtons}
    class:strip={!withButtons}
    data-suisou-layout={withButtons ? 'stack gap-0' : 'stack middle gap-0'}
    ontouchstart={(e) => gestures.start(e, card)}
    ontouchmove={(e) => gestures.move(e, card)}
    ontouchend={(e) => gestures.end(e, card)}
  >
    {#if withButtons}
      <div class="card-slot" data-suisou-layout="row">
        <CardImage
          {card}
          src={cardImageUrl(card.image)}
          class="card-img"
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
      <div class="cell-bar" data-suisou-layout="row middle stretch gap-0">
        <button class="cell" data-suisou-button onclick={() => onAdd(card)} title="デッキに1枚追加">
          <IconPlus />
        </button>
        {#if isMainDeckCard(card)}
          <button
            class="cell"
            data-suisou-button
            onclick={() => onAddMultiple(card, 4)}
            title="デッキに4枚追加"
          >
            <IconBoxMultiple4 />
          </button>
        {/if}
        <button
          class="cell"
          data-suisou-button
          onclick={() => {
            if (candidateFilter) onRemoveFromCandidate(card);
            else onAddToCandidate(card);
          }}
          title={candidateFilter ? '候補カードから削除' : '候補カードに追加'}
        >
          {#if candidateFilter}<IconFolderX />{:else}<IconFolderPlus />{/if}
        </button>
      </div>
    {:else}
      <CardImage
        {card}
        src={cardImageUrl(card.image)}
        class="card-img"
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
  class="scroller"
  class:grid-mode={isMd}
  class:strip-mode={!isMd}
  style="touch-action: {isMd ? 'pan-y' : 'pan-x'}"
>
  {#if loading}
    <div class="state" data-suisou-layout="row middle">
      <progress
        style="--suisou-size-spinner: 2.5rem"
        aria-label="読み込み中"
      ></progress>
    </div>
  {:else if loadError}
    <div class="state pad" data-suisou-layout="row middle" data-suisou-text="center" data-suisou="error">
      {loadError}
    </div>
  {:else if isMd}
    <div class="virt" style="height: {$gridV.getTotalSize()}px">
      {#each $gridV.getVirtualItems() as row (cards[row.index]?.cardID ?? cards[row.index]?.image ?? row.index)}
        {@const card = cards[row.index]}
        {#if card}
          <div
            data-index={row.index}
            use:measure={$gridV}
            class="virt-item gap-b"
            style="left: {Math.round(
              laneLeft(row.lane),
            )}px; width: {colWidth}px; transform: translateY({Math.round(row.start)}px)"
          >
            {@render cardCell(card, true)}
          </div>
        {/if}
      {/each}
    </div>
  {:else}
    <div class="virt" style="width: {$stripV.getTotalSize()}px">
      {#each $stripV.getVirtualItems() as item (cards[item.index]?.cardID ?? cards[item.index]?.image ?? item.index)}
        {@const card = cards[item.index]}
        {#if card}
          <div
            class="virt-item tall"
            style="left: 0; width: {STRIP_W}px; transform: translateX({Math.round(item.start)}px)"
          >
            {@render cardCell(card, false)}
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .cell-box {
    height: 100%;
  }
  .framed {
    border: 1px solid var(--suisou-color-line-weak);
    border-radius: var(--suisou-radius);
  }
  .strip {
    width: 4rem;
  }

  .card-slot {
    aspect-ratio: 12 / 17;
  }
  .scroller :global(.card-img) {
    width: 100%;
    object-fit: contain;
  }
  .cell-bar {
    height: 1.75rem;
    --suisou-size-icon: var(--suisou-size-icon-small);
  }

  .state {
    width: 100%;
    height: 8rem;
  }
  .state.pad {
    padding-inline: var(--suisou-space-3);
  }

  .scroller {
    min-height: 0;
    max-width: 100%;
    padding-block: 12px;
    margin-block-end: var(--suisou-space-1);
  }
  .scroller.grid-mode {
    border: 1px solid var(--suisou-color-line-weak);
    border-radius: 0.75rem;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .scroller.strip-mode {
    overflow-x: auto;
    overflow-y: hidden;
  }

  .virt {
    position: relative;
  }
  .strip-mode .virt {
    height: 100%;
  }
  .virt-item {
    position: absolute;
    top: 0;
  }
  .virt-item.gap-b {
    padding-block-end: var(--suisou-space-2);
  }
  .virt-item.tall {
    height: 100%;
  }

  .scroller {
    flex: 1 1 0;
  }

  .cell {
    flex: 1 1 auto;
    height: 100%;
    padding: 0;
    min-width: 0;
  }
</style>
