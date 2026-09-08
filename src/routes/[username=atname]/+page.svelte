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

  <div class="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:py-12">
    <!-- プロフィールヘッダ -->
    <header data-suisou-layout="row" class="mb-8 gap-4 border-b rule pb-8">
      <!-- 頭文字は Avatar が出す。円形＝人という約束ごと部品に寄せる。
           文字色も部品の text-sub に譲った（accent の頭文字は装飾で、意味が無かった） -->
      <div
        data-suisou-avatar
        style="--suisou-avatar: 4rem"
        class="sm:[--suisou-avatar:5rem] text-2xl font-bold"
      >
        {profile.displayName.charAt(0).toUpperCase()}
      </div>
      <div class="min-w-0">
        <h1 class="truncate text-2xl font-bold sm:text-3xl">{profile.displayName}</h1>
        {#if bskyUrl}
          <a
            href={bskyUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="mt-1 inline-flex items-center gap-1.5"
            data-suisou-link
          >
            <IconBrandBluesky class="h-4 w-4" />
            @{profile.atName}
          </a>
        {:else}
          <p class="mt-1" data-suisou-text="sub">@{profile.atName}</p>
        {/if}
      </div>
    </header>

    <!-- 公開デッキ一覧 -->
    <section>
      <h2 class="mb-4 font-semibold uppercase tracking-wider" data-suisou-text="sub">
        公開デッキ <span data-suisou-text="sub">({decks.length})</span>
      </h2>

      {#if decks.length === 0}
        <p class="py-20 text-center" data-suisou-text="sub">公開中のデッキはまだありません。</p>
      {:else}
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {#each decks as deck (deck.slug)}
            <a
              href="/@{profile.atName}/{deck.slug}"
              data-suisou-surface="panel"
              class="deck-card block"
            >
              <div class="truncate font-medium">{deck.name}</div>
              <div class="mt-1" data-suisou-text="sub">
                メイン {deck.mainCount}枚 / ルリグ {deck.lrigCount}枚
              </div>
              <div class="mt-2 text-xs" data-suisou-text="sub">
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

  .rule {
    border-color: var(--suisou-line-weak);
  }
</style>
