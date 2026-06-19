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

  // モバイルはタブ切替。カードが変わるたびに画像タブへ戻す。
  let tab = $state<'card' | 'info'>('card');
  $effect(() => { if (card) tab = 'card'; });
</script>

{#snippet chip(label: string)}
  <span class="px-1.5 py-0.5 rounded bg-zinc-700 text-xs text-gray-200">{label}</span>
{/snippet}

{#if card}
  <div class="fixed inset-0 flex items-center justify-center z-50 p-3">
    <button class="absolute inset-0 bg-black/70" onclick={onClose} aria-label="閉じる"></button>

    <div class="relative z-10 flex flex-col lg:flex-row w-full max-w-4xl h-[82vh] lg:h-[82vh] bg-zinc-800 rounded-xl overflow-hidden">
      <button
        class="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-900/60 text-gray-300 hover:text-white transition-colors"
        onclick={onClose} aria-label="閉じる"
      >
        <IconX class="w-5 h-5" />
      </button>

      <!-- モバイル用タブ切替 -->
      <div class="lg:hidden flex shrink-0 justify-center gap-1.5 p-3 pb-0">
        <button
          class="px-6 h-9 rounded-lg text-sm transition-colors {tab === 'card' ? 'bg-zinc-700 text-white' : 'bg-zinc-700/30 text-gray-400'}"
          onclick={() => (tab = 'card')}
        >カード</button>
        <button
          class="px-6 h-9 rounded-lg text-sm transition-colors {tab === 'info' ? 'bg-zinc-700 text-white' : 'bg-zinc-700/30 text-gray-400'}"
          onclick={() => (tab = 'info')}
        >情報</button>
      </div>

      <!-- 画像 + 操作バー -->
      <div class="{tab === 'info' ? 'hidden lg:flex' : 'flex'} flex-col flex-1 min-h-0 lg:flex-none p-3 lg:w-1/2">
        <!-- カード画像欄: 12/17 の固定箱を使える高さに合わせて中央表示（横長カードもレターボックス） -->
        <div class="flex items-center justify-center min-h-0 flex-1">
          <div class="flex items-center justify-center h-full max-w-full aspect-[12/17]">
            <img
              src={cardImageUrl(card.image)}
              alt={card.name}
              decoding="async"
              crossorigin="anonymous"
              class="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>

        <div class="flex items-center gap-1.5 mt-3 shrink-0">
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
      <div class="{tab === 'card' ? 'hidden lg:flex' : 'flex'} flex-col flex-1 min-h-0 lg:flex-none lg:w-1/2 lg:border-l border-zinc-700/60">
        <div class="flex-1 min-h-0 overflow-y-auto px-4 pb-4 pt-3 lg:pt-4">
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
