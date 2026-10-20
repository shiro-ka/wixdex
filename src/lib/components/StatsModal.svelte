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
    <div class="state" data-suisou-text="center" data-suisou="note">読み込み中...</div>
  {:else if error}
    <div class="state" role="alert" data-suisou-text="center" data-suisou="error">{error}</div>
  {:else if ranked.length === 0}
    <div class="state" data-suisou-text="center" data-suisou="note">
      <p data-suisou-text="fs-20">まだ集計データがありません</p>
      <p class="hint">デッキを保存すると、ここに使用ランキングが表示されます。</p>
    </div>
  {:else}
    <ol data-suisou-layout="stack">
      {#each ranked as row (row.cardId)}
        <li data-suisou-item data-suisou-layout="row gap-3">
          <div class="rank" data-suisou-text="fs-20 center" data-suisou="accent">{row.rank}</div>
          {#if row.card}
            <img
              src={cardImageUrl(row.card.image)}
              alt={row.card.name}
              class="thumb"
              loading="lazy"
            />
            <div class="name" data-suisou-layout="stack gap-0">
              <div data-suisou-text="fw-500 clamp-1">{row.card.name}</div>
              <div data-suisou-text="fs-12 clamp-1" data-suisou="note">{row.cardId}</div>
            </div>
          {:else}
            <div class="thumb ph"></div>
            <div class="name" data-suisou-layout="stack gap-0">
              <div data-suisou-text="clamp-1" data-suisou="note">{row.cardId}</div>
            </div>
          {/if}
          <div class="count">
            <div data-suisou-text="fw-500" data-suisou="accent">{row.deckCount} デッキ</div>
            <div data-suisou-text="fs-12" data-suisou="note">合計 {row.totalCount} 枚</div>
          </div>
        </li>
      {/each}
    </ol>
  {/if}
</BaseModal>

<style>
  .state {
    padding-block: 4rem;
  }
  .hint {
    margin-block-start: var(--suisou-space-2);
  }

  .rank {
    width: 2rem;
    font-family: var(--suisou-font-mono);
  }

  .thumb {
    width: 3rem;
    height: 4rem;
    object-fit: cover;
    border-radius: var(--suisou-radius-small);
  }

  .name {
    flex: 1 1 0;
    min-width: 0;
  }
  .count {
    text-align: right;
    white-space: nowrap;
  }

  .ph {
    background: var(--suisou-color-item);
  }
</style>
