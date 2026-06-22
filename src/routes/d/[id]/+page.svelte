<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import type { PageData } from './$types';
  import type { Card, DeckSlot } from '$lib/types';
  import { loadAllCards, buildCardMap, buildOrderMap } from '$lib/utils/cardData';
  import { sortMainDeck, sortLrigDeck } from '$lib/utils/cardSorting';
  import { renderMemoHtml } from '$lib/utils/markdown';
  import { cardImageUrl } from '$lib/utils/cardImages';
  import CardImage from '$lib/components/CardImage.svelte';

  let { data }: { data: PageData } = $props();

  let cards = $state<Card[]>([]);
  let loading = $state(true);
  let cardMap = $derived(buildCardMap(cards));
  let orderMap = $derived(buildOrderMap(cards));

  function resolve(slots: DeckSlot[], kind: 'main' | 'lrig'): Card[] {
    const out: Card[] = [];
    for (const s of slots) {
      if (s.slot !== kind) continue;
      const card = cardMap.get(s.cardId);
      if (card) for (let i = 0; i < s.count; i++) out.push(card);
    }
    return out;
  }

  let mainDeck = $derived(sortMainDeck(resolve(data.deck.slots, 'main'), orderMap));
  let lrigDeck = $derived(sortLrigDeck(resolve(data.deck.slots, 'lrig'), orderMap));
  let lifeBurstCount = $derived(mainDeck.filter((c) => c.lifeBurst === true).length);
  let renderedMemo = $derived(browser && data.deck.memo ? renderMemoHtml(data.deck.memo) : '');

  onMount(() => {
    loadAllCards()
      .then((c) => { cards = c; loading = false; })
      .catch(() => { loading = false; });
  });
</script>

<svelte:head>
  <title>wixdex - {data.deck.name}</title>
  <meta property="og:title" content={data.deck.name} />
  <meta property="og:description" content="WIXOSS デッキ — wixdex" />
  <meta name="twitter:card" content="summary" />
</svelte:head>

<div class="min-h-dvh bg-zinc-900 text-white">
  <div class="max-w-screen-lg mx-auto px-4 py-6">
    <div class="flex items-center justify-between gap-3 mb-4">
      <h1 class="text-xl font-bold truncate">{data.deck.name}</h1>
      <a
        href="/"
        class="shrink-0 px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm font-medium transition-colors"
      >
        自分も作る
      </a>
    </div>

    {#if renderedMemo}
      <div class="prose prose-invert prose-sm max-w-none mb-6 bg-zinc-800/50 rounded-xl p-4">
        <!-- renderedMemo は DOMPurify.sanitize 済み -->
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html renderedMemo}
      </div>
    {/if}

    {#if loading}
      <div class="flex justify-center py-16">
        <div class="w-10 h-10 border-3 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      <section class="mb-4 bg-zinc-600/10 border border-gray-600/30 rounded-xl p-4">
        <h2 class="text-base mb-2">Lrig Deck <span class="text-gray-400 text-sm">({lrigDeck.length})</span></h2>
        <div class="grid grid-cols-4 sm:grid-cols-8 gap-1">
          {#each lrigDeck as card, i (`lrig-${card.cardID}-${i}`)}
            <CardImage {card} src={cardImageUrl(card.image)} alt={card.name} class="w-full object-contain" showLifeBurst />
          {/each}
        </div>
      </section>

      <section class="bg-zinc-600/10 border border-gray-600/30 rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-base">Main Deck <span class="text-gray-400 text-sm">({mainDeck.length})</span></h2>
          <span class="text-sm text-gray-400">LB {lifeBurstCount}</span>
        </div>
        <div class="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-1">
          {#each mainDeck as card, i (`main-${card.cardID}-${i}`)}
            <CardImage {card} src={cardImageUrl(card.image)} alt={card.name} class="w-full object-contain" showLifeBurst />
          {/each}
        </div>
      </section>
    {/if}
  </div>
</div>
