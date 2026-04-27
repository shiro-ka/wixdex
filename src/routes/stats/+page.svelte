<script lang="ts">
  import { onMount } from 'svelte';
  import type { Card } from '$lib/types';
  import type { PageData } from './$types';
  import { cardImageUrl } from '$lib/utils/cardImages';
  import { loadAllCards, buildCardMap } from '$lib/utils/cardData';

  let { data }: { data: PageData } = $props();

  let cardLookup = $state<Map<string, Card>>(new Map());

  onMount(async () => {
    try {
      cardLookup = buildCardMap(await loadAllCards());
    } catch {
      // ranking still renders with raw card_id fallback
    }
  });

  const ranked = $derived(
    data.ranking.map((r, i) => {
      const card = cardLookup.get(r.cardId);
      return {
        rank: i + 1,
        cardId: r.cardId,
        deckCount: r.deckCount,
        totalCount: r.totalCount,
        card,
      };
    })
  );
</script>

<svelte:head>
  <title>カード使用統計 - wixdex</title>
</svelte:head>

<div class="min-h-screen bg-zinc-900 text-white">
  <div class="max-w-3xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">カード使用統計</h1>
      <a
        href="/"
        class="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm font-medium transition-colors"
      >
        デッキエディタへ
      </a>
    </div>

    {#if ranked.length === 0}
      <div class="text-center py-16 text-gray-400">
        <p class="text-lg">まだ集計データがありません</p>
        <p class="text-sm mt-2">デッキを保存すると、ここに使用ランキングが表示されます。</p>
      </div>
    {:else}
      <ol class="space-y-2">
        {#each ranked as row (row.cardId)}
          <li class="flex items-center gap-3 bg-zinc-800 rounded-lg p-3">
            <div class="w-8 text-center font-mono text-orange-400 text-lg">{row.rank}</div>
            {#if row.card}
              <img
                src={cardImageUrl(row.card.image)}
                alt={row.card.name}
                class="w-12 h-16 object-cover rounded"
                loading="lazy"
              />
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate">{row.card.name}</div>
                <div class="text-xs text-gray-500 truncate">{row.cardId}</div>
              </div>
            {:else}
              <div class="w-12 h-16 bg-zinc-700 rounded flex-shrink-0"></div>
              <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-400 truncate">{row.cardId}</div>
              </div>
            {/if}
            <div class="text-right text-sm whitespace-nowrap">
              <div class="text-orange-300 font-medium">{row.deckCount} デッキ</div>
              <div class="text-gray-400 text-xs">合計 {row.totalCount} 枚</div>
            </div>
          </li>
        {/each}
      </ol>
    {/if}
  </div>
</div>
