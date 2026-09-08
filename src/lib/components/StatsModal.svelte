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
    <div class="flex justify-center py-16" data-suisou-text="sub">読み込み中...</div>
  {:else if error}
    <div class="text-center py-16" role="alert" data-suisou-text="error">{error}</div>
  {:else if ranked.length === 0}
    <div class="text-center py-16" data-suisou-text="sub">
      <p class="text-lg">まだ集計データがありません</p>
      <p class="mt-2">デッキを保存すると、ここに使用ランキングが表示されます。</p>
    </div>
  {:else}
    <ol class="space-y-2">
      {#each ranked as row (row.cardId)}
        <li data-suisou-row data-suisou-layout="row" class="gap-4">
          <div class="w-8 text-center font-mono text-lg" data-suisou-text="accent">{row.rank}</div>
          {#if row.card}
            <img
              src={cardImageUrl(row.card.image)}
              alt={row.card.name}
              class="w-12 h-16 object-cover rounded"
              loading="lazy"
            />
            <div class="flex-1 min-w-0">
              <div class="font-medium truncate">{row.card.name}</div>
              <div class="text-xs truncate" data-suisou-text="sub">{row.cardId}</div>
            </div>
          {:else}
            <div class="w-12 h-16 rounded flex-shrink-0 ph"></div>
            <div class="flex-1 min-w-0">
              <div class="truncate" data-suisou-text="sub">{row.cardId}</div>
            </div>
          {/if}
          <div class="text-right whitespace-nowrap">
            <div class="font-medium" data-suisou-text="accent">{row.deckCount} デッキ</div>
            <div class="text-xs" data-suisou-text="sub">合計 {row.totalCount} 枚</div>
          </div>
        </li>
      {/each}
    </ol>
  {/if}
</BaseModal>

<style>
  /* カード画像が来るまでの場所取り */
  .ph {
    background: var(--suisou-item);
  }
</style>
