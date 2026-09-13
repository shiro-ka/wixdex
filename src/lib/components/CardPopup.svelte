<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import type { Card } from '$lib/types';
  import { cardImageUrl } from '$lib/utils/cardImages';
  import { isMainDeckCard } from '$lib/utils/cardTypeUtils';
  import CardTagList from './CardTagList.svelte';
  import IconStar from '@tabler/icons-svelte/icons/star';
  import IconStarFilled from '@tabler/icons-svelte/icons/star-filled';
  import IconPlus from '@tabler/icons-svelte/icons/plus';
  import IconMinus from '@tabler/icons-svelte/icons/minus';
  import IconBoxMultiple4 from '@tabler/icons-svelte/icons/box-multiple-4';
  import IconFolderPlus from '@tabler/icons-svelte/icons/folder-plus';
  import IconFolderX from '@tabler/icons-svelte/icons/folder-x';
  import IconX from '@tabler/icons-svelte/icons/x';

  interface Props {
    card: Card | null;
    onClose: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    isLoggedIn: boolean;
    count: number;
    /** これ以上デッキに追加できるか（カードタイプ別の上限を考慮した判定）。false で + / +4 をグレーアウト。 */
    canAdd: boolean;
    isInCandidate: boolean;
    onAdd: (card: Card) => void;
    onAddMultiple: (card: Card, count: number) => void;
    onRemove: (card: Card) => void;
    onAddToCandidate: (card: Card) => void;
    onRemoveFromCandidate: (card: Card) => void;
  }

  let {
    card,
    onClose,
    isFavorite,
    onToggleFavorite,
    isLoggedIn,
    count,
    canAdd,
    isInCandidate,
    onAdd,
    onAddMultiple,
    onRemove,
    onAddToCandidate,
    onRemoveFromCandidate,
  }: Props = $props();

  // モバイルは画像/情報のタブ切替。カードが変わるたびに画像タブへ戻す。
  let tab = $state<'card' | 'info'>('card');
  $effect(() => {
    if (card) tab = 'card';
  });
</script>

<!-- メタ情報のラベル片（種族・色・コスト等） -->
{#snippet chip(label: string)}
  <span data-suisou-tag>{label}</span>
{/snippet}

<!-- モバイルのタブボタン -->
{#snippet tabButton(value: 'card' | 'info', label: string)}
  <button
    class="tab"
    data-suisou-button="plain neutral"
    aria-pressed={tab === value}
    onclick={() => (tab = value)}
  >
    {label}
  </button>
{/snippet}

<!-- 操作バーのアイコンボタン（追加/削除/候補/お気に入りで共通）。
     「入っている状態」は aria-pressed で示し、下地は Suisou が出す。
     色を文字列で渡さないこと。お気に入りの黄色だけは意味色（warning）。 -->
{#snippet actionButton(
  Icon: typeof IconX,
  onclick: () => void,
  title: string,
  disabled: boolean,
  /* トグルのときだけ渡す。undefined なら属性ごと出ない ―― +1 / −1 は
     押しっぱなしにならないので、aria-pressed を付けると読み上げに
     「トグルボタン」と誤って伝わる */
  pressed: boolean | undefined = undefined,
)}
  <button
    type="button"
    data-suisou-button="neutral"
    class="act"
    aria-pressed={pressed}
    {onclick}
    {title}
    {disabled}
  >
    <Icon />
  </button>
{/snippet}

{#if card}
  <div class="root" data-suisou-layout="row middle">
    <!-- 背景クリックで閉じる -->
    <button
      class="scrim"
      onclick={onClose}
      aria-label="閉じる"
      transition:fade={{ duration: 120 }}
    ></button>

    <!-- モーダル本体（背景フェード＋軽くスケール。ツールなので控えめ＆やや速め） -->
    <div class="body" data-suisou-surface="overlay bleed" transition:scale={{ start: 0.97, opacity: 0, duration: 200 }} data-suisou-layout="stack">
      <!-- 右上の閉じるボタン -->
      <button class="close" data-suisou-button="icon" onclick={onClose} aria-label="閉じる">
        <IconX />
      </button>

      <!-- タブ切替（モバイルのみ。PCは左右同時表示なので不要） -->
      <div class="tabbar" data-suisou-layout="row middle">
        {@render tabButton('card', 'カード')}
        {@render tabButton('info', '情報')}
      </div>

      <!-- 左: カード画像 + 操作バー。モバイルでも常に描画し、全体の高さ基準になる -->
      <div class="card-pane" data-suisou-layout="stack grow">
        <!-- 画像欄: 余ったスペースを埋め、画像はその枠内に収める(object-contain) -->
        <div data-suisou-layout="row grow middle">
          <!-- crossorigin は付けない（表示専用。canvas出力は別途 loadImage が自前でCORS取得）。
               crossorigin を付けると CORS リクエストになり R2 が Vary: Origin を返す→Chrome が
               immutable を無視して毎回 304 再検証し、モーダル画像が遅くなる（Firefoxは免疫）。
               no-cors にすれば Vary が付かずキャッシュがそのまま効く（LazyImage も同じ）。-->
          <img
            src={cardImageUrl(card.image)}
            alt={card.name}
            decoding="async"
            class="card-img"
          />
        </div>

        <!-- 操作バー: -1 / 枚数 / +1 / (+4) / 候補 / (お気に入り) -->
        <div data-suisou-layout="row gap-2 hold">
          {@render actionButton(IconMinus, () => onRemove(card), '1枚減らす', count === 0)}
          <div data-suisou-text="s20 w700 tabular" data-suisou-layout="row grow middle">
            {count}
          </div>
          {@render actionButton(IconPlus, () => onAdd(card), '1枚追加', !canAdd)}
          <!-- +4 はメインデッキ札(シグニ/スペル/サーバント)のみ。ルリグ/アシスト/ピース/アーツでは出さない -->
          {#if isMainDeckCard(card)}
            {@render actionButton(
              IconBoxMultiple4,
              () => onAddMultiple(card, 4),
              '4枚追加',
              !canAdd,
            )}
          {/if}
          {@render actionButton(
            isInCandidate ? IconFolderX : IconFolderPlus,
            () => (isInCandidate ? onRemoveFromCandidate(card) : onAddToCandidate(card)),
            isInCandidate ? '候補から削除' : '候補に追加',
            false,
            isInCandidate,
          )}
          {#if isLoggedIn}
            {@render actionButton(
              isFavorite ? IconStarFilled : IconStar,
              onToggleFavorite,
              isFavorite ? 'お気に入りから削除' : 'お気に入りに追加',
              false,
              isFavorite,
            )}
          {/if}
        </div>
      </div>

      <!-- 右: 情報パネル。モバイルはカード側に重なるオーバーレイ(タブバー h-12 の下)、PCは右カラム -->
      <div
        class="info"
        class:card-tab={tab === 'card'}
        data-suisou-layout="stack"
      >
        <div class="info-scroll">
          <h2 data-suisou-text="s20 w700" class="title">{card.name}</h2>
          {#if card.subName?.length}
            <p data-suisou-text="sub s12">{card.subName.join(' / ')}</p>
          {/if}

          <!-- メタ情報 -->
          <div class="chips" data-suisou-layout="row wrap">
            {#each card.cardType ?? [] as t (t)}{@render chip(t)}{/each}
            {#if card.level !== null}{@render chip(`Lv${card.level}`)}{/if}
            {#each card.color ?? [] as c (c)}{@render chip(c)}{/each}
            {#if card.cost}
              {#each Object.entries(card.cost) as [col, n] (col)}{@render chip(
                  `${col}×${n}`,
                )}{/each}
            {/if}
            {#if card.power !== null}{@render chip(`${card.power}`)}{/if}
            {#if card.lrigTypeClass}
              {#each card.lrigTypeClass as lc (lc)}{@render chip(lc)}{/each}
            {/if}
          </div>

          <!-- カードテキスト -->
          {#if card.text?.length}
            <div class="sec" data-suisou-layout="stack gap-2">
              {#each card.text as t, i (i)}
                <div class="doc">
                  {#if t.label}
                    <span data-suisou-tag class="chip">{t.label}</span>
                  {/if}<span class="pre">{t.body}</span>
                </div>
              {/each}
            </div>
          {/if}

          <!-- フレーバーテキスト -->
          {#if card.flavorText}
            <p class="flavor" data-suisou-text="sub s12">{card.flavorText}</p>
          {/if}

          <!-- タグ（チーム / キーワード / クラス） -->
          {#if card.tags?.length}
            <div class="sec-lg">
              <h3 data-suisou-text="s14 w700 accent" class="sec-head">タグ</h3>
              <CardTagList tags={card.tags} />
            </div>
          {/if}

          <!-- FAQ -->
          {#if card.faq?.length}
            <div class="sec-lg">
              <h3 data-suisou-text="s14 w700 accent" class="sec-head">FAQ</h3>
              <div data-suisou-layout="stack gap-2">
                {#each card.faq as f, i (i)}
                  <div class="doc" data-suisou-text="s12">
                    {#if f.q}<p>Q. {f.q}</p>{/if}
                    <p data-suisou-text="sub">A. {f.a}</p>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Suisou は位置を決めず、実寸も持たない ―― どちらも現場のもの。
     段が xl(1280) のものは Suisou の md/lg 2段で表せないので、ここに残る。 */

  .root {
    position: fixed;
    inset: 0;
    z-index: 50;
    padding: 12px; /* Suisou の段に無い値 */
  }

  .body {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 56rem;
    height: 68vh;
    overflow: hidden;
  }

  /* タブの帯。すきま 6px は Suisou の段（4/8/16/24）に無いので現場の値 */
  .tabbar {
    flex: none;
    justify-content: center;
    gap: 6px;
    padding: 12px 12px 0;
  }
  /* PC は左右同時表示なのでタブは要らない。段が xl なので現場で持つ */
  @media (min-width: 1280px) {
    .tabbar {
      display: none;
    }
  }

  .card-pane {
    padding: 12px;
  }
  @media (min-width: 1280px) {
    .card-pane {
      flex: none;
      width: 50%;
    }
  }
  .card-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: var(--suisou-radius);
  }

  .title {
    padding-inline-end: 2rem;
  }
  .chips {
    gap: 6px;
    margin-block-start: var(--suisou-space-2);
  }
  .chip {
    margin-inline-end: var(--suisou-space-1);
    vertical-align: middle;
  }
  .pre {
    white-space: pre-line;
  }
  .doc {
    line-height: 1.625;
  }
  .sec {
    margin-block-start: 12px;
  }
  .sec-lg {
    margin-block-start: var(--suisou-space-3);
  }
  .sec-head {
    margin-block-end: var(--suisou-space-2);
  }
  .flavor {
    margin-block-start: 12px;
    font-style: italic;
    white-space: pre-line;
  }

  /* 情報パネルの巻物。モバイルは重なりの中で伸びる、PC は絶対配置で面を埋める */
  .info-scroll {
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
    padding: 12px var(--suisou-space-3) var(--suisou-space-3); /* pt-3 px-4 pb-4 */
  }
  @media (min-width: 1280px) {
    .info-scroll {
      position: absolute;
      inset: 0;
      padding-block-start: var(--suisou-space-3); /* xl:pt-4 = 16px */
    }
  }

  /* ★1280px で横並びに変わる。Suisou の段は md(768) / lg(1024) の2つだけなので、
     xl は現場のもの。md / lg で足りるなら `stack md:row` と書けば済む。 */
  @media (min-width: 1280px) {
    .body {
      flex-direction: row;
      align-items: stretch;
    }
  }

  /* 膜は Suisou の scrim。自前の黒 α0.70 は下地の暗さを見ていない値だった。
     ★画面いっぱいに敷くのはここの仕事。Tailwind の `absolute inset-0` を外したとき位置が落ち、
     膜が 0×0 になって「暗くならない・外を押しても閉じない」になっていた（2026-09-13 発覚） */
  .scrim {
    position: absolute;
    inset: 0;
    background: var(--suisou-scrim);
  }

  /* 右上に浮く閉じるボタン。面の上に載るので下地を敷いて字を拾わせる */
  .close {
    position: absolute;
    top: var(--suisou-space-2);
    right: var(--suisou-space-2);
    z-index: 20;
    background: var(--suisou-item);
  }

  /* タブは中身の幅より広く取る。押下は aria-pressed で Suisou が下地を出す */
  .tab {
    padding-inline: var(--suisou-space-4);
  }

  /* 操作バーの升目。等分に伸びる。連結（button-group）ではないので
     ―― 器の罫を持たず独立したボタンが並ぶ形 ―― even は効かない */
  .act {
    flex: 1 1 0;
    min-width: 0;
    height: 2.5rem;
  }

  /* 情報パネル。モバイルではカード画像の上に重なるので、面を敷いて下を隠す。
     PC では右カラムになり、左との境目を罫1本で示す（面は同じ overlay のまま）。
     ★罫は line-weak ―― 内側の仕切りは装飾の線で、面の縁（line-strong）ではない。
     surface="overlay" の中なので、値は overlay 用のものが継承で降りてくる。 */
  .info {
    background: var(--suisou-overlay);
    /* モバイル: タブバー（h-12 = 3rem）の下に、カード画像へ重ねる */
    position: absolute;
    inset-inline: 0;
    inset-block-end: 0;
    top: 3rem;
    z-index: 10;
  }
  /* カードのタブを見ているとき、狭い画面では情報パネルを出さない。
     ★data-suisou-show は md/lg の2段しか無く、ここは xl なので現場で持つ。 */
  .info.card-tab {
    display: none;
  }
  @media (min-width: 1280px) {
    .info {
      position: relative;
      inset: auto;
      z-index: auto;
      flex: none;
      width: 50%;
      border-inline-start: 1px solid var(--suisou-line-weak);
    }
    .info.card-tab {
      display: flex;
    }
  }
</style>
