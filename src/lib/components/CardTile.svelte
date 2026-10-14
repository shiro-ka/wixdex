<script lang="ts">
  import IconPlus from '@tabler/icons-svelte/icons/plus';
  import IconFolderPlus from '@tabler/icons-svelte/icons/folder-plus';
  import IconFolderX from '@tabler/icons-svelte/icons/folder-x';
  import IconBoxMultiple4 from '@tabler/icons-svelte/icons/box-multiple-4';
  import CardImage from './CardImage.svelte';
  import type { Card } from '$lib/types';
  import { cardImageUrl } from '$lib/utils/cardImages';
  import { isMainDeckCard } from '$lib/utils/cardTypeUtils';

  interface Props {
    card: Card;
    showLifeBurst?: boolean;
    showCandidateIcon?: boolean;
    isInCandidates?: boolean;
    rotateLandscape?: boolean;
    fadeToken?: unknown;
    folderAction: 'add' | 'remove';
    onHover: (card: Card) => void;
    onClick: (card: Card) => void;
    onAdd: (card: Card) => void;
    onAddMultiple: (card: Card, count: number) => void;
    onFolder: (card: Card) => void;
    ontouchstart?: (e: TouchEvent) => void;
    ontouchmove?: (e: TouchEvent) => void;
    ontouchend?: (e: TouchEvent) => void;
  }

  let {
    card,
    showLifeBurst = false,
    showCandidateIcon = false,
    isInCandidates = false,
    rotateLandscape = false,
    fadeToken,
    folderAction,
    onHover,
    onClick,
    onAdd,
    onAddMultiple,
    onFolder,
    ontouchstart,
    ontouchmove,
    ontouchend,
  }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="tile" data-suisou-layout="stack gap-0" {ontouchstart} {ontouchmove} {ontouchend}>
  <div class="card-slot" data-suisou-layout="row">
    <CardImage
      {card}
      src={cardImageUrl(card.image)}
      class="card-img"
      alt={card.name}
      {showLifeBurst}
      {showCandidateIcon}
      {isInCandidates}
      {rotateLandscape}
      {fadeToken}
      onmouseenter={() => onHover(card)}
      onclick={() => onClick(card)}
    />
  </div>
  <div class="bar" data-suisou-layout="row middle stretch gap-0">
    <button class="cell" data-suisou-button onclick={() => onAdd(card)} title="デッキに1枚追加">
      <IconPlus />
    </button>
    {#if isMainDeckCard(card)}
      <button class="cell" data-suisou-button onclick={() => onAddMultiple(card, 4)} title="デッキに4枚追加">
        <IconBoxMultiple4 />
      </button>
    {/if}
    <button
      class="cell"
      data-suisou-button
      onclick={() => onFolder(card)}
      title={folderAction === 'add' ? '候補カードに追加' : '候補カードから削除'}
    >
      {#if folderAction === 'add'}<IconFolderPlus />{:else}<IconFolderX />{/if}
    </button>
  </div>
</div>

<style>
  .tile {
    height: 100%;
    border: 1px solid var(--suisou-color-line-weak);
    border-radius: var(--suisou-radius);
  }
  .card-slot {
    aspect-ratio: 12 / 17;
  }
  .card-slot :global(.card-img) {
    width: 100%;
    object-fit: contain;
    cursor: pointer;
  }
  .bar {
    height: 1.75rem;
    --suisou-size-icon: var(--suisou-size-icon-small);
  }
  .cell {
    flex: 1 1 auto;
    height: 100%;
    padding: 0;
    min-width: 0;
  }
</style>
