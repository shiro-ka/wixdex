<script lang="ts">
  import BaseModal from './BaseModal.svelte';
  import type { Card } from '$lib/types';
  import { cardImageUrl } from '$lib/utils/cardImages';

  interface RankingEntry {
    cardId: string;
    deckCount: number;
    totalCount: number;
  }

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    cardMap: Map<string, Card>;
  }

  let { isOpen, onClose, cardMap }: Props = $props();

  let ranking = $state<RankingEntry[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);

  $effect(() => {
    if (!isOpen) return;
    // 開閉を繰り返した時に前回の in-flight fetch が後から解決して
    // 表示を上書きしないよう、cleanup でキャンセルフラグを立てる。
    let cancelled = false;
    loading = true;
    error = null;
    fetch('/api/stats/cards')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        ranking = data;
        loading = false;
      })
      .catch(() => {
        if (cancelled) return;
        error = '読み込みに失敗しました';
        loading = false;
      });
    return () => {
      cancelled = true;
    };
  });

  const ranked = $derived(
    ranking.map((r, i) => ({
      rank: i + 1,
      cardId: r.cardId,
      deckCount: r.deckCount,
      totalCount: r.totalCount,
      card: cardMap.get(r.cardId),
    })),
  );
</script>

<BaseModal {isOpen} {onClose} title="カード使用統計" maxWidth="lg">
  {#if loading}
    <div class="flex justify-center py-16 text-gray-400">読み込み中...</div>
  {:else if error}
    <div class="text-center py-16 text-red-400" role="alert">{error}</div>
  {:else if ranked.length === 0}
    <div class="text-center py-16 text-gray-400">
      <p class="text-lg">まだ集計データがありません</p>
      <p class="text-sm mt-2">デッキを保存すると、ここに使用ランキングが表示されます。</p>
    </div>
  {:else}
    <ol class="space-y-2">
      {#each ranked as row (row.cardId)}
        <li data-suisou-row class="flex items-center gap-3">
          <div class="w-8 text-center font-mono text-orange-400 text-lg">{row.rank}</div>
          {#if row.card}
            <img
              src={cardImageUrl(row.card.image)}
              alt={row.card.name}
              class="w-12 h-16 object-cover rounded"
              loading="lazy"
            />
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate">{row.card.name}</div>
              <div class="text-xs text-gray-500 truncate">{row.cardId}</div>
            </div>
          {:else}
            <div class="w-12 h-16 bg-zinc-700 rounded flex-shrink-0"></div>
            <div class="flex-1 min-w-0">
              <div class="text-sm text-gray-400 truncate">{row.cardId}</div>
            </div>
          {/if}
          <div class="text-right text-sm whitespace-nowrap">
            <div class="text-orange-300 font-medium">{row.deckCount} デッキ</div>
            <div class="text-gray-400 text-xs">合計 {row.totalCount} 枚</div>
          </div>
        </li>
      {/each}
    </ol>
  {/if}
</BaseModal>
