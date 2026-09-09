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

<div class="min-h-dvh">
  <PageHeader />

  <div data-suisou-layout="stack container gap-4" class="page">
    <!-- プロフィールヘッダ -->
    <header data-suisou-layout="row gap-3" data-suisou-rule="bottom" class="head">
      <!-- 頭文字は Avatar が出す。円形＝人という約束ごと部品に寄せる。
           文字色も部品の text-sub に譲った（accent の頭文字は装飾で、意味が無かった） -->
      <div data-suisou-avatar style="--suisou-avatar: 4rem" class="sm:[--suisou-avatar:5rem]" data-suisou-text="s24 w700">
        {profile.displayName.charAt(0).toUpperCase()}
      </div>
      <div class="min-w-0">
        <h1 data-suisou-text="s24 md:s28 w700 one-line">{profile.displayName}</h1>
        {#if bskyUrl}
          <a
            href={bskyUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-suisou-layout="row gap-1" class="inline-row"
            data-suisou-link
          >
            <IconBrandBluesky data-suisou-icon="small" />
            @{profile.atName}
          </a>
        {:else}
          <p data-suisou-text="sub">@{profile.atName}</p>
        {/if}
      </div>
    </header>

    <!-- 公開デッキ一覧 -->
    <section data-suisou-layout="stack gap-3">
      <h2 class="uppercase tracking-wider" data-suisou-text="sub w700">
        公開デッキ <span data-suisou-text="sub">({decks.length})</span>
      </h2>

      {#if decks.length === 0}
        <p class="py-20" data-suisou-text="sub center">公開中のデッキはまだありません。</p>
      {:else}
        <div class="decks" data-suisou-layout="cols gap-3">
          {#each decks as deck (deck.slug)}
            <a
              href="/@{profile.atName}/{deck.slug}"
              data-suisou-surface="panel"
              class="deck-card block"
            >
              <div data-suisou-text="w500 one-line">{deck.name}</div>
              <div data-suisou-text="sub">
                メイン {deck.mainCount}枚 / ルリグ {deck.lrigCount}枚
              </div>
              <div data-suisou-text="sub s12">
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
  /* ★列数は --suisou-cols で段を上げる（layout="cols"）。
     Suisou の段は md / lg の2つなので、sm / xl は現場が持つ ――
     「2段で表せない振り方は現場のもの」という決定どおり。
     ★語にせず値にしてあるので、@media で書き換えるだけで済む。 */
  .decks {
    --suisou-cols: 1;
  }
  @media (min-width: 640px) {
    .decks {
      --suisou-cols: 2;
    }
  }
  @media (min-width: 1024px) {
    .decks {
      --suisou-cols: 3;
    }
  }
  @media (min-width: 1280px) {
    .decks {
      --suisou-cols: 4;
    }
  }

  /* 押せる面の hover。Suisou の面は押せない（押せるのは部品）ので、
     カード型のリンクは現場が hover を持つ。使う色は行と同じ hover-surface */
  .deck-card {
    transition:
      background-color var(--suisou-motion-fast) var(--suisou-ease),
      border-color var(--suisou-motion-fast) var(--suisou-ease);
  }
  .deck-card:hover {
    background: var(--suisou-hover-surface);
    border-color: var(--suisou-line-strong);
  }


  .head {
    padding-block-end: var(--suisou-space-4);
  }
  .inline-row {
    display: inline-flex;
  }

  .page {
    --suisou-measure: 80rem;
    padding: var(--suisou-space-4) var(--suisou-space-3);
  }
</style>
