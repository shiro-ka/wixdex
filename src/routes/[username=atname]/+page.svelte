<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/state';
  import IconBrandBluesky from '@tabler/icons-svelte/icons/brand-bluesky';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let { data }: { data: PageData } = $props();

  const profile = $derived(data.profile);
  const decks = $derived(data.decks);
  const bskyUrl = $derived(profile.isBsky ? `https://bsky.app/profile/${profile.atName}` : null);
</script>

<svelte:head>
  <title>{profile.displayName} (@{profile.atName}) — wixdex</title>
  <meta property="og:title" content="{profile.displayName} (@{profile.atName}) — wixdex" />
  <meta property="og:description" content="{profile.displayName} さんのデッキ一覧 — wixdex" />
  <meta property="og:url" content={page.url.origin + page.url.pathname} />
  <!-- twitter:card / og:image は app.html の共通デフォルト（summary_large_image）を使う -->
</svelte:head>

<div data-suisou="min-screen">
  <PageHeader />

  <div data-suisou-layout="stack gap-4" data-suisou="container-l" class="page">
    <!-- プロフィールヘッダ -->
    <header data-suisou-layout="row gap-3" data-suisou="bd-bottom" class="head">
      <!-- 頭文字は Avatar が出す。円形＝人という約束ごと部品に寄せる。
           文字色も部品の text-sub に譲った（accent の頭文字は装飾で、意味が無かった） -->
      <div data-suisou-item="circle" data-suisou-text="fs-24 fw-700" style="--suisou-size-circle: 4rem" class="face">
        {profile.displayName.charAt(0).toUpperCase()}
      </div>
      <div class="ident" data-suisou-layout="stack gap-0">
        <h1 data-suisou-text="fs-24 s:fs-28 fw-700 one-line">{profile.displayName}</h1>
        {#if bskyUrl}
          <a
            href={bskyUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-suisou-layout="row gap-1"
            data-suisou-text="link" class="inline-row"
          >
            <IconBrandBluesky data-suisou-text="fs-16" />
            @{profile.atName}
          </a>
        {:else}
          <p data-suisou="sub">@{profile.atName}</p>
        {/if}
      </div>
    </header>

    <!-- 公開デッキ一覧 -->
    <section data-suisou-layout="stack gap-3">
      <h2 class="sec-head" data-suisou-text="fw-700" data-suisou="sub">
        公開デッキ <span data-suisou="sub">({decks.length})</span>
      </h2>

      {#if decks.length === 0}
        <p class="state" data-suisou-text="center" data-suisou="sub">公開中のデッキはまだありません。</p>
      {:else}
        <div class="decks" data-suisou-layout="grid gap-3">
          {#each decks as deck (deck.slug)}
            <a
              href="/@{profile.atName}/{deck.slug}"
              data-suisou-tray
              class="deck-card"
            >
              <div data-suisou-text="fw-500 one-line">{deck.name}</div>
              <div data-suisou="sub">
                メイン {deck.mainCount}枚 / ルリグ {deck.lrigCount}枚
              </div>
              <div data-suisou-text="fs-12" data-suisou="sub">
                更新: {new Date(deck.updatedAt * 1000).toLocaleDateString('ja-JP')}
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </section>
  </div>
</div>

<style>

  /* 640px から顔をひとまわり大きく。段が sm なので現場のもの */
  @media (min-width: 640px) {
    .face {
      --suisou-size-circle: 5rem;
    }
  }
  .ident {
    min-width: 0;
  }
  .sec-head {
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .state {
    padding-block: 5rem;
  }
  .deck-card {
    display: block;
  }

  /* ★列数は --suisou-cols で段を上げる（layout="cols"）。
     Suisou の段は md / lg の2つなので、sm / xl は現場が持つ ――
     「2段で表せない振り方は現場のもの」という決定どおり。
     ★語にせず値にしてあるので、@media で書き換えるだけで済む。 */
  .decks {
    --suisou-grid-cols: repeat(1, minmax(0, 1fr));
  }
  @media (min-width: 640px) {
    .decks {
      --suisou-grid-cols: repeat(2, minmax(0, 1fr));
    }
  }
  @media (min-width: 1024px) {
    .decks {
      --suisou-grid-cols: repeat(3, minmax(0, 1fr));
    }
  }
  @media (min-width: 1280px) {
    .decks {
      --suisou-grid-cols: repeat(4, minmax(0, 1fr));
    }
  }

  /* 押せる面の hover。Suisou の面は押せない（押せるのは部品）ので、
     カード型のリンクは現場が hover を持つ。使う色は行と同じ hover-surface */
  .deck-card {
    transition:
      background-color var(--suisou-duration-fast) var(--suisou-ease),
      border-color var(--suisou-duration-fast) var(--suisou-ease);
  }
  .deck-card:hover {
    background: var(--suisou-color-hover);
    border-color: var(--suisou-color-line-strong);
  }


  .head {
    padding-block-end: var(--suisou-space-4);
  }
  .inline-row {
    display: inline-flex;
  }

  .page {
    padding: var(--suisou-space-4) var(--suisou-space-3);
  }
</style>
