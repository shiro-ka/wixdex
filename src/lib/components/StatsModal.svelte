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
    <div class="py-16" data-suisou-text="sub center">読み込み中...</div>
  {:else if error}
    <div class="py-16" role="alert" data-suisou-text="error center">{error}</div>
  {:else if ranked.length === 0}
    <div class="py-16" data-suisou-text="sub center">
      <p data-suisou-text="s20">まだ集計データがありません</p>
      <p class="mt-2">デッキを保存すると、ここに使用ランキングが表示されます。</p>
    </div>
  {:else}
    <ol data-suisou-layout="stack gap-2">
      {#each ranked as row (row.cardId)}
        <li data-suisou-row data-suisou-layout="row gap-3">
          <div class="w-8 font-mono" data-suisou-text="accent s20 center">{row.rank}</div>
          {#if row.card}
            <img
              src={cardImageUrl(row.card.image)}
              alt={row.card.name}
              class="w-12 h-16 object-cover rounded"
              loading="lazy"
            />
            <div class="flex-1 min-w-0">
              <div data-suisou-text="w500 one-line">{row.card.name}</div>
              <div data-suisou-text="sub s12 one-line">{row.cardId}</div>
            </div>
          {:else}
            <div class="w-12 h-16 rounded flex-shrink-0 ph"></div>
            <div class="flex-1 min-w-0">
              <div data-suisou-text="sub one-line">{row.cardId}</div>
            </div>
          {/if}
          <div class="text-right whitespace-nowrap">
            <div data-suisou-text="accent w500">{row.deckCount} デッキ</div>
            <div data-suisou-text="sub s12">合計 {row.totalCount} 枚</div>
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
