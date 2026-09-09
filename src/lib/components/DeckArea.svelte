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

<div class="deck-side" data-suisou-layout="stack md:share gap-3">
  <!-- ルリグデッキ -->
  <div class="deck-panel" data-suisou-surface="panel tight">
    <div data-suisou-layout="row">
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

  <!-- メインデッキ -->
  <div class="deck-panel" data-suisou-surface="panel tight">
    <div data-suisou-layout="row between">
      <span data-suisou-text="s16 w500">Main Deck</span>
      <div class="burst" data-suisou-layout="row gap-1">
        <LifeBurstIcon class="burst-icon" data-suisou-text="sub"/>
        <span data-suisou-text="s14 md:s16" class="burst-num" data-suisou-layout="row middle">{lifeBurstCount}</span
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

  <!-- 候補カード (Folder) - PC のみ表示 -->
  <div data-suisou-show="md" data-suisou-layout="stack" class="folder" data-suisou-surface="panel tight">
    <div class="panel-head" data-suisou-layout="row">
      <span data-suisou-text="s16 w500">Folder</span>
    </div>
    <div class="folder-grid" data-suisou-layout="cols gap-2">
      {#each candidateKeyed as { card, key } (key)}
        <div class="deck-cell" data-suisou-layout="stack">
          <div class="card-slot" data-suisou-layout="row">
            <CardImage
              {card}
              src={cardImageUrl(card.image)}
              class="card-img"
              alt={card.name}
              {showLifeBurst}
              {rotateLandscape}
              onmouseenter={() => onCardHover(card)}
              onclick={() => onCardClick(card)}
            />
          </div>
          <div class="cell-bar" data-suisou-layout="row middle stretch gap-0">
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
  /* カードの比（12:17）と、升目の下の操作バーの高さ。実寸は現場のもの */
  .card-slot {
    aspect-ratio: 12 / 17;
  }
  .cell-bar {
    height: 2.5rem;
  }

  /* ★Tailwind を外すために現場へ移した実寸・位置決め（2026-09-09）。 */

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

  /* 升目の中の画像。器が比を持つので、画像は幅だけ合わせて中に収める */
  /* ★子コンポーネントに渡した class には Svelte の scoped ハッシュが付かない。
     Tailwind はグローバルなので `class="w-full object-contain"` を
     そのまま子に渡せていたが、scoped CSS に移すと**当たらなくなる**
     （2026-09-09 に実際に踏んだ。アイコンが素の大きさで出た）。
     祖先だけを scoped にして、子側は :global で受ける。 */
  .deck-side :global(.card-img) {
    width: 100%;
    object-fit: contain;
    cursor: pointer;
  }

  /* ライフバーストの数。アイコンと数字を同じ実寸で並べる */
  .burst :global(.burst-icon),
  .burst-num {
    width: 1rem;
    height: 1rem;
  }
  .burst-num {
    padding-block-end: 2px;
  }
  @media (min-width: 768px) {
    .burst :global(.burst-icon),
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

  /* Folder の升目。罫で囲うだけ ―― 面を上げると一覧がうるさくなる */
  .deck-cell {
    border: 1px solid var(--suisou-line-weak);
    border-radius: var(--suisou-radius);
  }

  /* ★列数は --suisou-cols で段を上げる（layout="cols"）。
     Suisou の段は md / lg の2つなので、sm / xl は現場が持つ ――
     「2段で表せない振り方は現場のもの」という決定どおり。
     ★語にせず値にしてあるので、@media で書き換えるだけで済む。 */
  .folder-grid {
    --suisou-cols: 5;
    grid-auto-rows: min-content;
  }
  @media (min-width: 1280px) {
    .folder-grid {
      --suisou-cols: 6;
    }
  }

  /* ★親に data-suisou-layout が付いていると
     :where([data-suisou-layout]) > * { flex: none } が効いて、
     子の Tailwind flex-1 は**詳細度に関係なく**潰れる（レイヤ無し ＞ レイヤ付き）。
     ここは属性ではなく現場の CSS で伸ばす。

     ★この要素に data-suisou-layout を足して直すのは駄目。
       [data-suisou-layout] { display: flex } もレイヤ無しなので、
       **`hidden`（display: none）まで殺してしまう**。 */
  .folder {
    flex: 1 1 0;
    min-height: 0;
  }

  /* ★伸び方の「比」と、段に無い隙間は現場が持つ（Suisou に語が無い）。

     元は Tailwind の md:flex-1 / lg:flex-2 / md:gap-1.5 だったが、
     **黙って死んでいた**（2026-09-09 実測）。Tailwind v4 のユーティリティは
     @layer utilities にあり、レイヤ無しの Suisou に必ず負ける。
     ★親に data-suisou-layout を足した瞬間に
       :where([data-suisou-layout]) > * { flex: none } が効いて、
       子の flex-N が全部 flex:none になる ―― これが最大の落とし穴。

     grow（flex: 1 1 auto）を土台にして、比はショートハンドで上書きする。

     ★基準（flex-basis）が違う。Tailwind の flex-N は `flex: N 1 0%` で
       **基準0から比で配る**が、Suisou の grow は `flex: 1 1 auto` で
       **中身の大きさを基準にしてから余りを配る**。grow の上に flex-grow だけ
       重ねると比が合わない（実測 40:60 が 32:68 になった）。
       ショートハンドで基準ごと書く ―― grow が併せて置く min-width/min-height: 0 は
       別の宣言なので残る。 */
  @media (min-width: 1024px) {
    .deck-side {
      --suisou-share: 2;
    }
  }

  /* 6px。Suisou の段は 4 / 8 / 16 / 24 なので、この値は現場のもの。 */
  @media (min-width: 768px) {
    .burst {
      gap: 6px;
    }
  }

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
