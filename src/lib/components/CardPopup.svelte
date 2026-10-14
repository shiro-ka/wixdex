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

  let tab = $state<'card' | 'info'>('card');
  $effect(() => {
    if (card) tab = 'card';
  });
</script>

{#snippet chip(label: string)}
  <span data-suisou-item="tag">{label}</span>
{/snippet}

{#snippet tabButton(value: 'card' | 'info', label: string)}
  <button
    class="tab"
    data-suisou-button="outline"
    aria-pressed={tab === value}
    onclick={() => (tab = value)}
  >
    {label}
  </button>
{/snippet}

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
    data-suisou-button
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
    <button
      class="scrim"
      onclick={onClose}
      aria-label="閉じる"
      transition:fade={{ duration: 120 }}
    ></button>

    <div class="body" data-suisou-tray data-suisou-layout="stack" transition:scale={{ start: 0.97, opacity: 0, duration: 200 }}>
      <button class="close" data-suisou-button="icon" onclick={onClose} aria-label="閉じる">
        <IconX />
      </button>

      <div class="tabbar" data-suisou-layout="row middle">
        {@render tabButton('card', 'カード')}
        {@render tabButton('info', '情報')}
      </div>

      <div class="card-pane" data-suisou-layout="stack grow">
        <div data-suisou-layout="row grow middle">
          <img
            src={cardImageUrl(card.image)}
            alt={card.name}
            decoding="async"
            class="card-img"
          />
        </div>

        <div data-suisou-layout="row gap-2">
          {@render actionButton(IconMinus, () => onRemove(card), '1枚減らす', count === 0)}
          <div data-suisou-layout="row grow middle" data-suisou-text="fs-20 fw-700">
            {count}
          </div>
          {@render actionButton(IconPlus, () => onAdd(card), '1枚追加', !canAdd)}
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

      <div
        class="info"
        class:card-tab={tab === 'card'}
        data-suisou-layout="stack"
      >
        <div class="info-scroll">
          <h2 data-suisou-text="fs-20 fw-700" class="title">{card.name}</h2>
          {#if card.subName?.length}
            <p data-suisou-text="fs-12" data-suisou="sub">{card.subName.join(' / ')}</p>
          {/if}

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

          {#if card.text?.length}
            <div class="sec" data-suisou-layout="stack gap-2">
              {#each card.text as t, i (i)}
                <div class="doc">
                  {#if t.label}
                    <span data-suisou-item="tag" class="chip">{t.label}</span>
                  {/if}<span class="pre">{t.body}</span>
                </div>
              {/each}
            </div>
          {/if}

          {#if card.flavorText}
            <p class="flavor" data-suisou-text="fs-12" data-suisou="sub">{card.flavorText}</p>
          {/if}

          {#if card.tags?.length}
            <div class="sec-lg">
              <h3 data-suisou-text="fs-14 fw-700" data-suisou="accent" class="sec-head">タグ</h3>
              <CardTagList tags={card.tags} />
            </div>
          {/if}

          {#if card.faq?.length}
            <div class="sec-lg">
              <h3 data-suisou-text="fs-14 fw-700" data-suisou="accent" class="sec-head">FAQ</h3>
              <div data-suisou-layout="stack gap-2">
                {#each card.faq as f, i (i)}
                  <div class="doc" data-suisou-text="fs-12">
                    {#if f.q}<p>Q. {f.q}</p>{/if}
                    <p data-suisou="sub">A. {f.a}</p>
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
  .root {
    position: fixed;
    inset: 0;
    z-index: 50;
    padding: 12px;
  }

  .body {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 56rem;
    height: 68vh;
    overflow: hidden;
  }

  .tabbar {
    flex: none;
    justify-content: center;
    gap: 6px;
    padding: 12px 12px 0;
  }
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

  .info-scroll {
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
    padding: 12px var(--suisou-space-3) var(--suisou-space-3);
  }
  @media (min-width: 1280px) {
    .info-scroll {
      position: absolute;
      inset: 0;
      padding-block-start: var(--suisou-space-3);
    }
  }

  @media (min-width: 1280px) {
    .body {
      flex-direction: row;
      align-items: stretch;
    }
  }

  .scrim {
    position: absolute;
    inset: 0;
    background: var(--suisou-color-backdrop);
  }

  .close {
    position: absolute;
    top: var(--suisou-space-2);
    right: var(--suisou-space-2);
    z-index: 20;
    background: var(--suisou-color-item);
  }

  .tab {
    padding-inline: var(--suisou-space-4);
  }

  .act {
    flex: 1 1 0;
    min-width: 0;
    height: 2.5rem;
  }

  .info {
    background: var(--suisou-color-panel);
    position: absolute;
    inset-inline: 0;
    inset-block-end: 0;
    top: 3rem;
    z-index: 10;
  }
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
      border-inline-start: 1px solid var(--suisou-color-line-weak);
    }
    .info.card-tab {
      display: flex;
    }
  }
</style>
