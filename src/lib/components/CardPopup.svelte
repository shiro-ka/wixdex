<script lang="ts">
  import type { Card } from '$lib/types';
  import { cardImageUrl } from '$lib/utils/cardImages';
  import IconStar from '@tabler/icons-svelte/icons/star';
  import IconStarFilled from '@tabler/icons-svelte/icons/star-filled';
  import IconPlus from '@tabler/icons-svelte/icons/plus';
  import IconMinus from '@tabler/icons-svelte/icons/minus';
  import IconNumber4 from '@tabler/icons-svelte/icons/number-4';
  import IconFolderPlus from '@tabler/icons-svelte/icons/folder-plus';
  import IconFolderX from '@tabler/icons-svelte/icons/folder-x';
  import IconX from '@tabler/icons-svelte/icons/x';
  import IconChevronDown from '@tabler/icons-svelte/icons/chevron-down';

  interface Props {
    card: Card | null;
    onClose: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    isLoggedIn: boolean;
    count: number;
    isInCandidate: boolean;
    onAdd: (card: Card) => void;
    onAddMultiple: (card: Card, count: number) => void;
    onRemove: (card: Card) => void;
    onAddToCandidate: (card: Card) => void;
    onRemoveFromCandidate: (card: Card) => void;
  }

  let {
    card, onClose, isFavorite, onToggleFavorite, isLoggedIn,
    count, isInCandidate,
    onAdd, onAddMultiple, onRemove, onAddToCandidate, onRemoveFromCandidate,
  }: Props = $props();

  // モバイルの情報パネルは畳んだ状態で開始。カードが変わるたびに畳み直す。
  let showInfo = $state(false);
  $effect(() => { if (card) showInfo = false; });
</script>

{#snippet chip(label: string)}
  <span class="px-1.5 py-0.5 rounded bg-zinc-700 text-xs text-gray-200">{label}</span>
{/snippet}

{#if card}
  <div class="fixed inset-0 flex items-center justify-center z-50 p-3">
    <button class="absolute inset-0 bg-black/70" onclick={onClose} aria-label="閉じる"></button>

    <div class="relative z-10 flex flex-col lg:flex-row w-full max-w-4xl max-h-[92vh] bg-zinc-800 rounded-xl overflow-y-auto lg:overflow-hidden">
      <button
        class="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-900/60 text-gray-300 hover:text-white transition-colors"
        onclick={onClose} aria-label="閉じる"
      >
        <IconX class="w-5 h-5" />
      </button>

      <!-- 画像 + 操作バー -->
      <div class="flex flex-col shrink-0 p-3 lg:w-1/2">
        <img
          src={cardImageUrl(card.image)}
          alt={card.name}
          decoding="async"
          crossorigin="anonymous"
          class="w-full object-contain rounded-lg max-h-[50vh] lg:max-h-[72vh]"
        />

        <div class="flex items-center gap-1.5 mt-3">
          <div class="flex items-center justify-center min-w-12 h-10 px-2 rounded-lg bg-zinc-900/60 text-lg font-bold text-white tabular-nums">{count}</div>
          <button
            class="flex-1 h-10 flex items-center justify-center rounded-lg bg-zinc-700/50 hover:bg-zinc-600/60 text-gray-200 transition-colors disabled:opacity-30"
            onclick={() => onRemove(card)} disabled={count === 0} title="1枚減らす"
          >
            <IconMinus class="w-5 h-5" />
          </button>
          <button
            class="flex-1 h-10 flex items-center justify-center rounded-lg bg-zinc-700/50 hover:bg-zinc-600/60 text-gray-200 transition-colors"
            onclick={() => onAdd(card)} title="1枚追加"
          >
            <IconPlus class="w-5 h-5" />
          </button>
          <button
            class="flex-1 h-10 flex items-center justify-center rounded-lg bg-zinc-700/50 hover:bg-zinc-600/60 text-gray-200 transition-colors"
            onclick={() => onAddMultiple(card, 4)} title="4枚追加"
          >
            <IconNumber4 class="w-5 h-5" />
          </button>
          <button
            class="flex-1 h-10 flex items-center justify-center rounded-lg bg-zinc-700/50 hover:bg-zinc-600/60 transition-colors {isInCandidate ? 'text-gray-100' : 'text-gray-400'}"
            onclick={() => (isInCandidate ? onRemoveFromCandidate(card) : onAddToCandidate(card))}
            title={isInCandidate ? '候補から削除' : '候補に追加'}
          >
            {#if isInCandidate}<IconFolderX class="w-5 h-5" />{:else}<IconFolderPlus class="w-5 h-5" />{/if}
          </button>
          {#if isLoggedIn}
            <button
              class="flex-1 h-10 flex items-center justify-center rounded-lg bg-zinc-700/50 hover:bg-zinc-600/60 transition-colors {isFavorite ? 'text-yellow-400' : 'text-gray-200'}"
              onclick={onToggleFavorite}
              title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
            >
              {#if isFavorite}<IconStarFilled class="w-5 h-5" />{:else}<IconStar class="w-5 h-5" />{/if}
            </button>
          {/if}
        </div>
      </div>

      <!-- 情報パネル -->
      <div class="flex flex-col min-h-0 lg:w-1/2 lg:border-l border-zinc-700/60">
        <button
          class="lg:hidden flex items-center justify-center gap-1 h-10 mx-3 mb-3 rounded-lg bg-zinc-700/40 text-gray-300 text-sm"
          onclick={() => (showInfo = !showInfo)}
        >
          カード情報{showInfo ? 'を隠す' : 'を見る'}
          <IconChevronDown class="w-4 h-4 transition-transform {showInfo ? 'rotate-180' : ''}" />
        </button>

        <div class="{showInfo ? '' : 'hidden'} lg:block lg:max-h-[92vh] lg:overflow-y-auto px-4 pb-4 lg:pt-4">
          <h2 class="text-lg font-bold text-white pr-8">{card.name}</h2>
          {#if card.subName.length}
            <p class="text-xs text-gray-400 mt-0.5">{card.subName.join(' / ')}</p>
          {/if}

          <div class="flex flex-wrap gap-1.5 mt-2">
            {#each card.cardType as t (t)}{@render chip(t)}{/each}
            {#if card.level !== null}{@render chip(`Lv${card.level}`)}{/if}
            {#each card.color as c (c)}{@render chip(c)}{/each}
            {#if card.cost}{#each Object.entries(card.cost) as [col, n] (col)}{@render chip(`${col}×${n}`)}{/each}{/if}
            {#if card.power !== null}{@render chip(`${card.power}`)}{/if}
            {#if card.lrigTypeClass}{#each card.lrigTypeClass as lc (lc)}{@render chip(lc)}{/each}{/if}
          </div>

          {#if card.text.length}
            <div class="mt-3 space-y-2">
              {#each card.text as t, i (i)}
                <div class="text-sm text-gray-200 leading-relaxed">
                  {#if t.label}<span class="inline-block px-1.5 mr-1 rounded bg-zinc-600 text-xs text-gray-100 align-middle">{t.label}</span>{/if}<span class="whitespace-pre-line">{t.body}</span>
                </div>
              {/each}
            </div>
          {/if}

          {#if card.flavorText}
            <p class="mt-3 text-xs text-gray-400 italic whitespace-pre-line">{card.flavorText}</p>
          {/if}

          {#if card.faq.length}
            <div class="mt-4">
              <h3 class="text-sm font-bold text-orange-400 mb-1.5">FAQ</h3>
              <div class="space-y-2">
                {#each card.faq as f, i (i)}
                  <div class="text-xs leading-relaxed">
                    {#if f.q}<p class="text-gray-200">Q. {f.q}</p>{/if}
                    <p class="text-gray-400">A. {f.a}</p>
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
