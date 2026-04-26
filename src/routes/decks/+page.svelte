<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>マイデッキ - wixdex</title>
</svelte:head>

<div class="min-h-screen bg-zinc-900 text-white">
  <div class="max-w-2xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">マイデッキ</h1>
      <a href="/" class="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm font-medium transition-colors">
        デッキエディタを開く
      </a>
    </div>

    {#if data.decks.length === 0}
      <div class="text-center py-16 text-gray-400">
        <p class="text-lg">保存されたデッキがありません</p>
        <a href="/" class="inline-block mt-4 text-orange-400 hover:text-orange-300 text-sm">
          デッキエディタでデッキを作成する →
        </a>
      </div>
    {:else}
      <div class="space-y-3">
        {#each data.decks as deck (deck.id)}
          <a href="/" class="block bg-zinc-800 hover:bg-zinc-700 rounded-lg p-4 transition-colors">
            <div class="font-medium text-white">{deck.name}</div>
            <div class="text-sm text-gray-400 mt-1">
              メイン: {deck.mainCount}枚 / ルリグ: {deck.lrigCount}枚
              {#if deck.candidateCount > 0}
                / 候補: {deck.candidateCount}枚
              {/if}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              更新: {new Date(deck.updatedAt * 1000).toLocaleString('ja-JP')}
            </div>
            {#if deck.memo}
              <div class="text-sm text-gray-400 mt-2 truncate">{deck.memo}</div>
            {/if}
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>
