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

  // ── virtualization geometry ────────────────────────────────
  // Desktop: a 3-column vertical grid handled by TanStack's `lanes`.
  // Mobile: a single-row horizontal strip.
  const COLS = 3;
  const GAP = 8; // gap between grid columns/rows (px)
  const PAD_X = 8; // horizontal inset of the grid (px)
  const STRIP_W = 64; // mobile card width (w-16)
  const STRIP_GAP = 8; // mobile gap between cards
  const STRIP_STRIDE = STRIP_W + STRIP_GAP;

  let scrollEl = $state<HTMLDivElement | null>(null);
  let isMd = $state(false);
  let containerWidth = $state(0);

  let colWidth = $derived(
    containerWidth > 0 ? (containerWidth - PAD_X * 2 - GAP * (COLS - 1)) / COLS : 0,
  );
  // Estimate only — measureElement reports the real height once a row renders.
  // +50 はカード下のボタン行(h-10=40px)＋間隔ぶんの見込み。
  let estRowHeight = $derived(colWidth > 0 ? colWidth * (17 / 12) + 50 : 180);
  function laneLeft(lane: number): number {
    return PAD_X + lane * (colWidth + GAP);
  }

  // O(1) candidate lookup
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

    // Seed the width synchronously so the first grid layout isn't zero-width
    // while we wait for the ResizeObserver's first async callback.
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

  // ── touch gestures ────────────────────────────────────────
  // 指の読み取りは cardTouchGestures が持つ。ここでは払い・押さえに
  // 「デッキへ入れる / 候補へ入れる」という意味を与えるだけ。
  const gestures = createCardGestures<Card>({
    onSwipeUp: (card) => onAdd(card),
    onSwipeDown: (card) => onAddMultiple(card, 4), // 下へ払うと同名の上限まで一気に
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
      <div
        data-suisou-spinner
        style="--suisou-size-spinner: 2.5rem"
        role="status"
        aria-label="読み込み中"
      ></div>
    </div>
  {:else if loadError}
    <div class="state pad" data-suisou-layout="row middle" data-suisou-text="center" data-suisou="error">
      {loadError}
    </div>
  {:else if isMd}
    <!-- Desktop: virtualized 3-column grid -->
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
    <!-- Mobile: virtualized horizontal strip -->
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
  /* 一覧（升目）の枠。罫だけで囲う ―― 面を上げると一覧がうるさくなる */
  .framed {
    border: 1px solid var(--suisou-color-line-weak);
    border-radius: var(--suisou-radius);
  }
  /* 帯（横スクロール）のときは枠を持たず、幅だけ決める */
  .strip {
    width: 4rem;
  }

  .card-slot {
    aspect-ratio: 12 / 17;
  }
  /* ★子コンポーネントに渡した class には Svelte の scoped ハッシュが付かない。
     子側のセレクタは祖先を scoped にして :global で受ける。 */
  .scroller :global(.card-img) {
    width: 100%;
    object-fit: contain;
  }
  .cell-bar {
    height: 2.5rem;
  }

  /* 読み込み中・失敗の表示欄 */
  .state {
    width: 100%;
    height: 8rem;
  }
  .state.pad {
    padding-inline: var(--suisou-space-3);
  }

  /* 巻物。広い画面は縦に積んで囲い、狭い画面は横に流す帯になる */
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

  /* 仮想スクロールの土台と行。位置は JS が style で入れる */
  .virt {
    position: relative;
  }
  /* ★帯（スマホ）の土台は帯の高さいっぱい。JS が入れるのは幅だけなので、何もしないと高さ 0 になる。
     すると行・セルも高さ 0 になり、stack middle が画像を 0 の線の上下にはみ出させて、
     帯の overflow で切れていた（2026-09-13 発覚。升目は JS が高さを入れるので対象外） */
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

  /* ★親が data-suisou-layout を持つと :where([data-suisou-layout]) > * { flex: none }
     が効くので、子は既定で伸びない。伸ばすのは現場の CSS の仕事。 */
  .scroller {
    flex: 1 1 0;
  }

  /* 升目に広がるボタン。セルの高さ(h-10)は仮想リストの計測に効くので動かさない。
     ★ここは連結（button-group）ではない ―― 3つのボタンを枠なしで並べているだけなので
     even は効かない。同じ .cell という名前でも SearchArea のそれとは別の需要。 */
  .cell {
    flex: 1 1 auto;
    height: 100%;
    padding: 0;
    min-width: 0;
  }

</style>
