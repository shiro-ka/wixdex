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
</svelte:head>

<div data-suisou="min-screen">
  <PageHeader>
    {#snippet right()}
      <a href="/" data-suisou-button="outline" data-suisou="accent"> 自分も作る </a>
    {/snippet}
  </PageHeader>

  <div data-suisou-layout="stack gap-3" data-suisou="container-l" class="page">
    <div>
      <h1 data-suisou-text="fs-24 s:fs-28 fw-700 clamp-1">{data.deck.name}</h1>
    </div>
    <a href="/@{data.atName}" data-suisou-text="link" data-suisou="note" class="back">
      @{data.atName} のデッキ
    </a>

    {#if renderedMemo}
      <div data-suisou-tray data-suisou-text="typeset">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html renderedMemo}
      </div>
    {/if}

    {#if loading}
      <div class="state" data-suisou-layout="row middle">
        <progress
          style="--suisou-size-spinner: 2.5rem"
          aria-label="読み込み中"
        ></progress>
      </div>
    {:else}
      <section data-suisou-tray data-suisou-layout="stack">
        <h2 data-suisou-text="fs-16">
          Lrig Deck <span data-suisou-text="fs-14" data-suisou="note">({lrigDeck.length})</span>
        </h2>
        <div class="lrig-grid" data-suisou-layout="grid gap-1">
          {#each lrigDeck as card, i (`lrig-${card.cardID}-${i}`)}
            <CardImage
              {card}
              src={cardImageUrl(card.image)}
              alt={card.name}
              class="card-img"
              showLifeBurst
            />
          {/each}
        </div>
      </section>

      <section data-suisou-tray>
        <div data-suisou-layout="row between">
          <h2 data-suisou-text="fs-16">
            Main Deck <span data-suisou-text="fs-14" data-suisou="note">({mainDeck.length})</span>
          </h2>
          <span data-suisou="note">LB {lifeBurstCount}</span>
        </div>
        <div class="main-grid" data-suisou-layout="grid gap-1">
          {#each mainDeck as card, i (`main-${card.cardID}-${i}`)}
            <CardImage
              {card}
              src={cardImageUrl(card.image)}
              alt={card.name}
              class="card-img"
              showLifeBurst
            />
          {/each}
        </div>
      </section>
    {/if}
  </div>
</div>

<style>

  .back {
    display: inline-block;
  }
  .state {
    padding-block: 4rem;
  }
  .page :global(.card-img) {
    width: 100%;
    object-fit: contain;
  }

  .lrig-grid {
    --suisou-grid-cols: repeat(4, minmax(0, 1fr));
  }
  .main-grid {
    --suisou-grid-cols: repeat(5, minmax(0, 1fr));
  }
  @media (min-width: 640px) {
    .lrig-grid {
      --suisou-grid-cols: repeat(6, minmax(0, 1fr));
    }
    .main-grid {
      --suisou-grid-cols: repeat(8, minmax(0, 1fr));
    }
  }
  @media (min-width: 768px) {
    .lrig-grid {
      --suisou-grid-cols: repeat(8, minmax(0, 1fr));
    }
    .main-grid {
      --suisou-grid-cols: repeat(10, minmax(0, 1fr));
    }
  }
  @media (min-width: 1024px) {
    .lrig-grid {
      --suisou-grid-cols: repeat(10, minmax(0, 1fr));
    }
    .main-grid {
      --suisou-grid-cols: repeat(12, minmax(0, 1fr));
    }
  }

  .page {
    padding: var(--suisou-space-4) var(--suisou-space-3);
  }
</style>
