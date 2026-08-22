<script lang="ts">
  import LifeBurstIcon from './icons/LifeBurstIcon.svelte';
  import IconPlus from '@tabler/icons-svelte/icons/plus';
  import IconFolderX from '@tabler/icons-svelte/icons/folder-x';
  import IconBoxMultiple4 from '@tabler/icons-svelte/icons/box-multiple-4';
  import CardImage from './CardImage.svelte';
  import type { Card } from '$lib/types';
  import { cardImageUrl } from '$lib/utils/cardImages';
  import { isMainDeckCard } from '$lib/utils/cardTypeUtils';

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

  // {#each} のキーに配列 index を混ぜると、追加/削除でのソートで位置がずれた全セルが
  // 再マウントされ画像が再デコードされる。カード種別ごとの出現回数で安定キーを振り、
  // 同一カードのコピーは位置が変わってもキー不変=DOM移動で済むようにする。
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

<div class="flex flex-col px-2 mb-2 md:mb-1 md:flex-1 lg:flex-2">
  <!-- ルリグデッキ -->
  <div class="deck-panel h-fit mb-2" data-suisou-surface="panel tight">
    <div class="flex w-full">
      <span data-suisou-text="s16 w500">Lrig Deck</span>
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
  <div class="deck-panel h-fit mb-2" data-suisou-surface="panel tight">
    <div data-suisou-layout="row between">
      <span data-suisou-text="s16 w500">Main Deck</span>
      <div class="flex items-center gap-1 md:gap-1.5">
        <LifeBurstIcon class="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
        <span
          class="flex items-center justify-center w-4 h-4 md:w-5 md:h-5 pb-[2px] text-sm md:text-base"
          >{lifeBurstCount}</span
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
  <div class="hidden md:flex flex-col flex-1 overflow-hidden" data-suisou-surface="panel tight">
    <div class="flex w-full mb-2">
      <span data-suisou-text="s16 w500">Folder</span>
    </div>
    <div class="grid grid-cols-5 auto-rows-min gap-2 w-full overflow-y-auto xl:grid-cols-6">
      {#each candidateKeyed as { card, key } (key)}
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
          <div class="flex justify-center w-full h-10">
            <!-- CardList のセル下ボタンと同じ形（hover の下地と文字色は Suisou が出す） -->
            <button
              class="cell"
              data-suisou-button
              onclick={() => onAdd(card)}
              title="デッキに1枚追加"
            >
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
              onclick={() => onRemoveFromCandidate(card)}
              title="候補カードから削除"
            >
              <IconFolderX />
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  /* 升目に広がるボタン（Folder のカード下）。CardList の .cell と同じ */
  .cell {
    flex: 1 1 auto;
    height: 100%;
    padding: 0;
    min-width: 0;
  }

  /* デッキの升目。横8列 × ルリグ1行 / メイン5行。
     行の高さはカードの縦横比（12:17）から決まり、列幅に正確に追従する。

     ★以前は器に高さを直接持たせていた:
         h-[calc(90dvw-4rem)] md:h-[calc(45dvw-3rem)]
         lg:h-[calc(36dvw-3rem)] xl:h-[26rem]
       「8列に並べたカードを5行積んだ高さ」を dvw から手で近似した値で、
       段ごとに書き直していた。しかも DeckArea は md 以上で flex-1 / flex-2
       になるので**幅がビューポート幅ではない** ―― dvw 基準の近似は原理的に
       合わせられず、画面幅によってカードの下に隙間が出たり詰まったりしていた。
       同じファイルの Folder の升目（aspect-[12/17]）が最初からこの形。 */
  .deck-panel {
    container-type: inline-size; /* 下の 100cqw が面の内側の幅を指す */
  }
  .deck-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    column-gap: var(--suisou-space-1);
    width: 100%;
  }

  /* ★空でも枠を保つ。行数が枚数依存になるので、0枚のとき行が消えて面が無くなり、
     カードを足すたびに跳ねる（高さを直接持っていた頃は起きなかった退行）。

     列幅 = (内側の幅 − 隙間7つ) ÷ 8、行の高さ = 列幅 × 17/12。
     N行ぶんは (内側の幅 − 隙間7つ) × 17N/96 になる。
     **満杯のときの実際の高さと同値**なので、min-height が中身と喧嘩しない。

     ★以前ここに「1枡目に重ねた見えない当て木」を置いていたが誤り。
       grid の子は明示配置でもその枡を占有するので、自動配置が2枡目から
       始まり、カードが1つずつずれていた（2026-08-22 に指摘されて発覚）。 */
  .lrig {
    grid-template-rows: 1fr;
    min-height: calc((100cqw - 7 * var(--suisou-space-1)) * 17 / 96);
  }
  .main {
    grid-template-rows: repeat(5, 1fr);
    min-height: calc((100cqw - 7 * var(--suisou-space-1)) * 85 / 96);
  }

  /* 升目そのものがカードの比を持つ。中の画像は w-full なので縦は勝手に揃う
     （横向きカードだけ背が低くなり、中央に置かれる） */
  .deck-grid > * {
    aspect-ratio: 12 / 17;
    display: flex;
    align-items: center;
  }
</style>
