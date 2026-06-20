<script lang="ts">
  import type { PageData } from './$types';
  import IconBrandBluesky from '@tabler/icons-svelte/icons/brand-bluesky';

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
  <div class="mx-auto max-w-screen-md px-4 py-8">
    <!-- プロフィールヘッダ -->
    <header class="mb-8 flex items-center justify-between gap-3">
      <div class="min-w-0">
        <h1 class="truncate text-2xl font-bold">{profile.displayName}</h1>
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
      <a
        href="/"
        class="shrink-0 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-orange-500"
      >
        デッキを作る
      </a>
    </header>

    <!-- 公開デッキ一覧 -->
    <section>
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        公開デッキ <span class="text-zinc-600">({decks.length})</span>
      </h2>

      {#if decks.length === 0}
        <p class="py-16 text-center text-zinc-500">公開中のデッキはまだありません。</p>
      {:else}
        <div class="space-y-3">
          {#each decks as deck (deck.slug)}
            <a
              href="/@{profile.atName}/{deck.slug}"
              class="block rounded-lg bg-zinc-800 p-4 transition-colors hover:bg-zinc-700"
            >
              <div class="font-medium text-white">{deck.name}</div>
              <div class="mt-1 text-sm text-zinc-400">
                メイン {deck.mainCount}枚 / ルリグ {deck.lrigCount}枚
              </div>
              <div class="mt-1 text-xs text-zinc-500">
                更新: {new Date(deck.updatedAt * 1000).toLocaleDateString('ja-JP')}
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </section>
  </div>
</div>
