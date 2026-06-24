<script lang="ts">
  import type { Card } from '$lib/types';
  import { cardImageUrl } from '$lib/utils/cardImages';
  import { isMainDeckCard } from '$lib/utils/cardTypeUtils';
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
  <span class="px-1.5 py-0.5 rounded bg-zinc-700 text-xs text-gray-200">{label}</span>
{/snippet}

<!-- モバイルのタブボタン -->
{#snippet tabButton(value: 'card' | 'info', label: string)}
  <button
    class="px-6 h-9 rounded-lg text-sm transition-colors {tab === value
      ? 'bg-zinc-700 text-white'
      : 'bg-zinc-700/30 text-gray-400'}"
    onclick={() => (tab = value)}
  >
    {label}
  </button>
{/snippet}

<!-- 操作バーのアイコンボタン（追加/削除/候補/お気に入りで共通） -->
{#snippet actionButton(
  Icon: typeof IconX,
  onclick: () => void,
  title: string,
  colorClass: string,
  disabled: boolean,
)}
  <button
    class="flex-1 h-10 flex items-center justify-center rounded-lg bg-zinc-700/50 hover:bg-zinc-600/60 transition-colors disabled:opacity-30 {colorClass}"
    {onclick}
    {title}
    {disabled}
  >
    <Icon class="w-5 h-5" />
  </button>
{/snippet}

{#if card}
  <div class="fixed inset-0 flex items-center justify-center z-50 p-3">
    <!-- 背景クリックで閉じる -->
    <button class="absolute inset-0 bg-black/70" onclick={onClose} aria-label="閉じる"></button>

    <!-- モーダル本体 -->
    <div
      class="relative z-10 flex flex-col xl:flex-row w-full max-w-4xl h-[68vh] bg-zinc-800 rounded-xl overflow-hidden"
    >
      <!-- 右上の閉じるボタン -->
      <button
        class="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-900/60 text-gray-300 hover:text-white transition-colors"
        onclick={onClose}
        aria-label="閉じる"
      >
        <IconX class="w-5 h-5" />
      </button>

      <!-- タブ切替（モバイルのみ。PCは左右同時表示なので不要） -->
      <div class="xl:hidden flex shrink-0 justify-center gap-1.5 p-3 pb-0">
        {@render tabButton('card', 'カード')}
        {@render tabButton('info', '情報')}
      </div>

      <!-- 左: カード画像 + 操作バー。モバイルでも常に描画し、全体の高さ基準になる -->
      <div class="flex flex-col flex-1 min-h-0 p-3 xl:flex-none xl:w-1/2">
        <!-- 画像欄: 余ったスペースを埋め、画像はその枠内に収める(object-contain) -->
        <div class="flex items-center justify-center min-h-0 flex-1">
          <!-- モーダルは拡大表示＝高DPR端末では原寸近い大サイズのデコードが走る。
               sync だとそれをメインスレッドでブロックし、APK/PWAで「枠だけ出て画像が0.5s空白」
               になる（PCはCPUが速く露見しない）。async にして非ブロックで別スレッドデコードさせる
               （fetchpriority=high で取得は優先）。リスト(LazyImage)も async で問題なし。-->
          <img
            src={cardImageUrl(card.image)}
            alt={card.name}
            decoding="async"
            fetchpriority="high"
            crossorigin="anonymous"
            class="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>

        <!-- 操作バー: -1 / 枚数 / +1 / (+4) / 候補 / (お気に入り) -->
        <div class="flex items-center gap-1.5 mt-3 shrink-0">
          {@render actionButton(
            IconMinus,
            () => onRemove(card),
            '1枚減らす',
            'text-gray-200',
            count === 0,
          )}
          <div class="flex items-center justify-center min-w-8 text-lg font-bold text-white tabular-nums">
            {count}
          </div>
          {@render actionButton(IconPlus, () => onAdd(card), '1枚追加', 'text-gray-200', false)}
          <!-- +4 はメインデッキ札(シグニ/スペル/サーバント)のみ。ルリグ/アシスト/ピース/アーツでは出さない -->
          {#if isMainDeckCard(card)}
            {@render actionButton(
              IconBoxMultiple4,
              () => onAddMultiple(card, 4),
              '4枚追加',
              'text-gray-200',
              false,
            )}
          {/if}
          {@render actionButton(
            isInCandidate ? IconFolderX : IconFolderPlus,
            () => (isInCandidate ? onRemoveFromCandidate(card) : onAddToCandidate(card)),
            isInCandidate ? '候補から削除' : '候補に追加',
            isInCandidate ? 'text-gray-100' : 'text-gray-400',
            false,
          )}
          {#if isLoggedIn}
            {@render actionButton(
              isFavorite ? IconStarFilled : IconStar,
              onToggleFavorite,
              isFavorite ? 'お気に入りから削除' : 'お気に入りに追加',
              isFavorite ? 'text-yellow-400' : 'text-gray-200',
              false,
            )}
          {/if}
        </div>
      </div>

      <!-- 右: 情報パネル。モバイルはカード側に重なるオーバーレイ(タブバー h-12 の下)、PCは右カラム -->
      <div
        class="{tab === 'card'
          ? 'hidden xl:flex'
          : 'flex'} flex-col absolute inset-x-0 bottom-0 top-12 z-10 bg-zinc-800 xl:relative xl:inset-auto xl:z-auto xl:flex-none xl:w-1/2 xl:border-l border-zinc-700/60"
      >
        <div class="flex-1 min-h-0 overflow-y-auto xl:absolute xl:inset-0 px-4 pb-4 pt-3 xl:pt-4">
          <h2 class="text-lg font-bold text-white pr-8">{card.name}</h2>
          {#if card.subName?.length}
            <p class="text-xs text-gray-400 mt-0.5">{card.subName.join(' / ')}</p>
          {/if}

          <!-- メタ情報 -->
          <div class="flex flex-wrap gap-1.5 mt-2">
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
            <div class="mt-3 space-y-2">
              {#each card.text as t, i (i)}
                <div class="text-sm text-gray-200 leading-relaxed">
                  {#if t.label}
                    <span
                      class="inline-block px-1.5 mr-1 rounded bg-zinc-600 text-xs text-gray-100 align-middle"
                      >{t.label}</span
                    >
                  {/if}<span class="whitespace-pre-line">{t.body}</span>
                </div>
              {/each}
            </div>
          {/if}

          <!-- フレーバーテキスト -->
          {#if card.flavorText}
            <p class="mt-3 text-xs text-gray-400 italic whitespace-pre-line">{card.flavorText}</p>
          {/if}

          <!-- FAQ -->
          {#if card.faq?.length}
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
