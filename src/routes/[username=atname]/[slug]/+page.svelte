<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import type { PageData } from './$types';
  import type { Card, DeckSlot } from '$lib/types';
  import { loadAllCards, buildCardMap, buildOrderMap } from '$lib/utils/cardData';
  import { sortMainDeck, sortLrigDeck } from '$lib/utils/cardSorting';
  import { renderMemoHtml } from '$lib/utils/markdown';
  import { cardImageUrl } from '$lib/utils/cardImages';
  import CardImage from '$lib/components/CardImage.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';

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
      .then((c) => {
        cards = c;
        loading = false;
      })
      .catch(() => {
        loading = false;
      });
  });
</script>

<svelte:head>
  <title>{data.deck.name} — wixdex</title>
  <meta property="og:title" content="{data.deck.name} — wixdex" />
  <meta property="og:description" content="WIXOSS デッキ — wixdex で公開中" />
  <meta property="og:url" content={page.url.origin + page.url.pathname} />
  <!-- twitter:card / og:image は app.html の共通デフォルト（summary_large_image）を使う -->
</svelte:head>

<div class="min-h-dvh">
  <PageHeader>
    {#snippet right()}
      <a href="/" data-suisou-button="outline"> 自分も作る </a>
    {/snippet}
  </PageHeader>

  <div class="max-w-screen-xl mx-auto px-4 py-6 sm:px-6 lg:py-10">
    <div class="mb-1">
      <h1 class="truncate sm:text-3xl" data-suisou-text="s24 w700">{data.deck.name}</h1>
    </div>
    <a href="/@{data.atName}" data-suisou-link class="mb-6 inline-block" data-suisou-text="sub">
      @{data.atName} のデッキ
    </a>

    {#if renderedMemo}
      <div data-suisou-surface="panel" data-suisou-prose="tight" class="mb-6">
        <!-- renderedMemo は DOMPurify.sanitize 済み -->
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html renderedMemo}
      </div>
    {/if}

    {#if loading}
      <div class="flex justify-center py-16">
        <div
          data-suisou-spinner
          style="--suisou-spinner: 2.5rem"
          role="status"
          aria-label="読み込み中"
        ></div>
      </div>
    {:else}
      <section data-suisou-surface="panel" class="mb-4">
        <h2 data-suisou-text="s16" class="mb-2">
          Lrig Deck <span data-suisou-text="s14 sub">({lrigDeck.length})</span>
        </h2>
        <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5">
          {#each lrigDeck as card, i (`lrig-${card.cardID}-${i}`)}
            <CardImage
              {card}
              src={cardImageUrl(card.image)}
              alt={card.name}
              class="w-full object-contain"
              showLifeBurst
            />
          {/each}
        </div>
      </section>

      <section data-suisou-surface="panel">
        <div data-suisou-layout="row between" class="mb-2">
          <h2 data-suisou-text="s16">
            Main Deck <span data-suisou-text="s14 sub">({mainDeck.length})</span>
          </h2>
          <span data-suisou-text="sub">LB {lifeBurstCount}</span>
        </div>
        <div class="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5">
          {#each mainDeck as card, i (`main-${card.cardID}-${i}`)}
            <CardImage
              {card}
              src={cardImageUrl(card.image)}
              alt={card.name}
              class="w-full object-contain"
              showLifeBurst
            />
          {/each}
        </div>
      </section>
    {/if}
  </div>
</div>
