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

<div class="screen">
  <PageHeader>
    {#snippet right()}
      <a href="/" data-suisou-button="outline"> 自分も作る </a>
    {/snippet}
  </PageHeader>

  <div data-suisou-layout="stack container gap-3" class="page">
    <div>
      <h1 data-suisou-text="s24 md:s28 w700 one-line">{data.deck.name}</h1>
    </div>
    <a href="/@{data.atName}" data-suisou-link class="back" data-suisou-text="sub">
      @{data.atName} のデッキ
    </a>

    {#if renderedMemo}
      <div data-suisou-surface="panel" data-suisou-prose="tight">
        <!-- renderedMemo は DOMPurify.sanitize 済み -->
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html renderedMemo}
      </div>
    {/if}

    {#if loading}
      <div class="state" data-suisou-layout="row middle">
        <div
          data-suisou-spinner
          style="--suisou-spinner: 2.5rem"
          role="status"
          aria-label="読み込み中"
        ></div>
      </div>
    {:else}
      <section data-suisou-surface="panel" data-suisou-layout="stack gap-2">
        <h2 data-suisou-text="s16">
          Lrig Deck <span data-suisou-text="s14 sub">({lrigDeck.length})</span>
        </h2>
        <div class="lrig-grid" data-suisou-layout="cols">
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

      <section data-suisou-surface="panel">
        <div data-suisou-layout="row between">
          <h2 data-suisou-text="s16">
            Main Deck <span data-suisou-text="s14 sub">({mainDeck.length})</span>
          </h2>
          <span data-suisou-text="sub">LB {lifeBurstCount}</span>
        </div>
        <div class="main-grid" data-suisou-layout="cols">
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
  /* ★Tailwind を外すために現場へ移した実寸（2026-09-09）。 */

  .screen {
    min-height: 100dvh;
  }
  .back {
    display: inline-block;
  }
  .state {
    padding-block: 4rem; /* Tailwind py-16 */
  }
  /* ★子コンポーネント（CardImage）に渡す class は scoped にならないので :global で受ける */
  .page :global(.card-img) {
    width: 100%;
    object-fit: contain;
  }

  /* ★列数は --suisou-cols で段を上げる（layout="cols"）。
     Suisou の段は md / lg の2つなので、sm / xl は現場が持つ ――
     「2段で表せない振り方は現場のもの」という決定どおり。
     ★語にせず値にしてあるので、@media で書き換えるだけで済む。 */
  /* すきまは 6px。Suisou の段は 4 / 8 / 16 / 24 なので現場のもの。 */
  .lrig-grid,
  .main-grid {
    gap: 6px;
  }
  .lrig-grid {
    --suisou-cols: 4;
  }
  .main-grid {
    --suisou-cols: 5;
  }
  @media (min-width: 640px) {
    .lrig-grid {
      --suisou-cols: 6;
    }
    .main-grid {
      --suisou-cols: 8;
    }
  }
  @media (min-width: 768px) {
    .lrig-grid {
      --suisou-cols: 8;
    }
    .main-grid {
      --suisou-cols: 10;
    }
  }
  @media (min-width: 1024px) {
    .lrig-grid {
      --suisou-cols: 10;
    }
    .main-grid {
      --suisou-cols: 12;
    }
  }

  .page {
    --suisou-measure: 80rem;
    padding: var(--suisou-space-4) var(--suisou-space-3);
  }
</style>
