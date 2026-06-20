<script lang="ts">
  import type { PageData } from './$types';
  import IconBrandBluesky from '@tabler/icons-svelte/icons/brand-bluesky';
  import PageHeader from '$lib/components/PageHeader.svelte';

  let { data }: { data: PageData } = $props();

  const profile = $derived(data.profile);
  const decks = $derived(data.decks);
  const bskyUrl = $derived(profile.isBsky ? `https://bsky.app/profile/${profile.atName}` : null);
</script>

<svelte:head>
  <title>{profile.displayName} (@{profile.atName}) — wixdex</title>
  <meta property="og:title" content="{profile.displayName} — wixdex" />
  <meta name="twitter:card" content="summary" />
</svelte:head>

<div class="min-h-dvh bg-zinc-900 text-white">
  <PageHeader>
    {#snippet right()}
      <a
        href="/"
        class="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-orange-500"
      >
        デッキを作る
      </a>
    {/snippet}
  </PageHeader>

  <div class="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:py-12">
    <!-- プロフィールヘッダ -->
    <header class="mb-8 flex items-center gap-4 border-b border-zinc-800 pb-8">
      <div
        class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-2xl font-bold text-white sm:h-20 sm:w-20"
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
            class="mt-1 inline-flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300"
          >
            <IconBrandBluesky class="h-4 w-4" />
            @{profile.atName}
          </a>
        {:else}
          <p class="mt-1 text-sm text-zinc-400">@{profile.atName}</p>
        {/if}
      </div>
    </header>

    <!-- 公開デッキ一覧 -->
    <section>
      <h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        公開デッキ <span class="text-zinc-600">({decks.length})</span>
      </h2>

      {#if decks.length === 0}
        <p class="py-20 text-center text-zinc-500">公開中のデッキはまだありません。</p>
      {:else}
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {#each decks as deck (deck.slug)}
            <a
              href="/@{profile.atName}/{deck.slug}"
              class="block rounded-xl border border-zinc-700/50 bg-zinc-800 p-4 transition-colors hover:border-zinc-600 hover:bg-zinc-700"
            >
              <div class="truncate font-medium text-white">{deck.name}</div>
              <div class="mt-1 text-sm text-zinc-400">
                メイン {deck.mainCount}枚 / ルリグ {deck.lrigCount}枚
              </div>
              <div class="mt-2 text-xs text-zinc-500">
                更新: {new Date(deck.updatedAt * 1000).toLocaleDateString('ja-JP')}
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </section>
  </div>
</div>
