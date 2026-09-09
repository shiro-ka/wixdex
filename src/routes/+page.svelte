<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import type { Card } from '$lib/types';
  import { getDraft, saveDraft } from '$lib/utils/storage';
  import { loadAllCards, buildCardMap, buildOrderMap } from '$lib/utils/cardData';
  import { canAddCard } from '$lib/utils/deckValidation';
  import { preventPullToRefresh } from '$lib/utils/preventPullToRefresh';
  import { CloudDeckSync } from '$lib/stores/cloudDeckSync.svelte';
  import { DeckBuilderStore } from '$lib/stores/deckBuilder.svelte';
  import { DeckSessionStore } from '$lib/stores/deckSession.svelte';
  import { FavoritesStore } from '$lib/stores/favorites.svelte';
  import { FilterStore } from '$lib/stores/filterStore.svelte';
  import { SettingsStore } from '$lib/stores/settings.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import DeckArea from '$lib/components/DeckArea.svelte';
  import CardList from '$lib/components/CardList.svelte';
  import SearchArea from '$lib/components/SearchArea.svelte';
  import CardPopup from '$lib/components/CardPopup.svelte';
  import DeckListModal from '$lib/components/DeckListModal.svelte';
  import DeckEditModal from '$lib/components/DeckEditModal.svelte';
  import UnsavedConfirmModal from '$lib/components/UnsavedConfirmModal.svelte';
  import DeleteDeckConfirmModal from '$lib/components/DeleteDeckConfirmModal.svelte';
  import ShareModal from '$lib/components/ShareModal.svelte';
  import StatsModal from '$lib/components/StatsModal.svelte';
  import FilterDropdown from '$lib/components/dropdowns/FilterDropdown.svelte';
  import TypeFilterContent from '$lib/components/dropdowns/TypeFilterContent.svelte';
  import LrigClassFilterContent from '$lib/components/dropdowns/LrigClassFilterContent.svelte';
  import TagFilterContent from '$lib/components/dropdowns/TagFilterContent.svelte';

  // ── card data ──────────────────────────────────────────────
  let allCardData = $state<Card[]>([]);
  let loading = $state(true);
  let loadError = $state<string | null>(null);
  let cardMap = $derived(buildCardMap(allCardData));

  // ── stores ─────────────────────────────────────────────────
  const isLoggedIn = !!page.data.user;
  const cloudSync = new CloudDeckSync();
  const deck = new DeckBuilderStore();
  const filter = new FilterStore();
  const settings = new SettingsStore();
  const favorites = new FavoritesStore(page.data.favoriteIds ?? []);
  const session = new DeckSessionStore(deck, cloudSync, isLoggedIn, () => cardMap);

  // ── UI state ───────────────────────────────────────────────
  // デッキの保存まわりの開閉は session が持つ。ここに残るのは
  // 「どのカードを見ているか」だけの、保存と関係のない状態。
  let hoveredCard = $state<Card | null>(null);
  let popupCard = $state<Card | null>(null);
  let isSidebarOpen = $state(false);
  let isShareOpen = $state(false);
  let isStatsOpen = $state(false);
  let activeDropdown = $state<'type' | 'lrigClass' | 'tag' | null>(null);
  let draftRestored = $state(false);

  // ── filtered cards ─────────────────────────────────────────
  let filteredCards = $derived(filter.apply(allCardData, deck.candidateCards, favorites.ids));

  // ── card popup: 採用枚数・候補状態 ─────────────────────────
  function copiesInDeck(card: Card): number {
    const key = card.cardID ?? card.image;
    const match = (c: Card) => (c.cardID ?? c.image) === key;
    return deck.mainDeck.filter(match).length + deck.lrigDeck.filter(match).length;
  }
  let popupCount = $derived(popupCard ? copiesInDeck(popupCard) : 0);
  // カードタイプ別の上限(同名/デッキサイズ/センター・アシスト・ピース・アーツ枠)を考慮した「あと1枚足せるか」
  let popupCanAdd = $derived(
    popupCard ? canAddCard(popupCard, deck.mainDeck, deck.lrigDeck).valid : false,
  );
  let popupInCandidate = $derived(
    popupCard ? deck.candidateCards.some((c) => c.image === popupCard!.image) : false,
  );

  // ── mount: load data & restore from storage ───────────────
  onMount(() => {
    const stopPullToRefresh = preventPullToRefresh();

    const draft = getDraft();
    if (draft) deck.restoreFromDraft(draft);
    draftRestored = true;
    settings.restore();

    loadAllCards()
      .then((cards) => {
        allCardData = cards;
        deck.setCardOrder(buildOrderMap(cards));
        loading = false;
      })
      .catch((err) => {
        loadError = err instanceof Error ? err.message : 'カードデータの読み込みに失敗しました';
        loading = false;
      });

    return stopPullToRefresh;
  });

  $effect(() => {
    document.title = deck.name ? `wixdex - ${deck.name}` : 'wixdex';
  });

  $effect(() => {
    if (!draftRestored) return;
    saveDraft(deck.toDraft());
  });
</script>

<svelte:head>
  <title>wixdex — WIXOSS デッキビルダー</title>
  <meta property="og:title" content="wixdex — WIXOSS デッキビルダー" />
  <meta
    property="og:description"
    content="WIXOSS（ディーヴァ）のデッキを構築・公開・シェアできるツール。"
  />
  <!-- og:url は環境のオリジンに追従（ユーザー/デッキページと同じ動的パターンに統一）。
       staging では staging のURLになり、貼ったカードから実際のテスト対象ページへ戻れる。
       og:image は app.html の共通デフォルト（常に本番 og.png）を使うので、見た目は本番と同一。 -->
  <meta property="og:url" content={page.url.origin + page.url.pathname} />
</svelte:head>

<div class="shell" data-suisou-layout="stack">
  <Navbar
    deckName={deck.name}
    isSaved={deck.isSaved}
    {isLoggedIn}
    onMenuClick={() => {
      isSidebarOpen = true;
    }}
    onSaveClick={session.saveOrAsk}
    onDeckClick={() => {
      session.isDeckEditOpen = true;
    }}
    onShareClick={() => {
      isShareOpen = true;
    }}
  />

  <div class="split" data-suisou-layout="stack md:row md:stretch grow gap-0">
    <DeckArea
      mainDeck={deck.mainDeck}
      lrigDeck={deck.lrigDeck}
      onCardHover={(card) => {
        hoveredCard = card;
      }}
      onAdd={deck.addCard}
      onAddMultiple={deck.addMultiple}
      onRemove={deck.removeCard}
      candidateCards={deck.sortedCandidateCards}
      onRemoveFromCandidate={deck.removeFromCandidate}
      onCardClick={(card) => {
        popupCard = card;
      }}
      lifeBurstCount={deck.lifeBurstCount}
      showLifeBurst={settings.showLifeBurst}
      rotateLandscape={settings.rotateLandscape}
    />

    <div class="card-side" data-suisou-layout="stack lg:row lg:stretch share gap-0">
      <CardList
        cards={filteredCards}
        {loading}
        {loadError}
        onAdd={deck.addCard}
        onAddMultiple={deck.addMultiple}
        onRemove={(card) => deck.removeCard(card)}
        onCardHover={(card) => {
          hoveredCard = card;
        }}
        onAddToCandidate={deck.addToCandidate}
        onRemoveFromCandidate={deck.removeFromCandidate}
        candidateFilter={filter.candidateFilter}
        onCardClick={(card) => {
          popupCard = card;
        }}
        showLifeBurst={settings.showLifeBurst}
        showCandidateIcon={settings.showCandidateIcon}
        rotateLandscape={settings.rotateLandscape}
        candidateCards={deck.candidateCards}
      />

      <SearchArea
        {hoveredCard}
        {filter}
        {settings}
        {isLoggedIn}
        {activeDropdown}
        onDropdownChange={(d) => {
          activeDropdown = d;
        }}
      />
    </div>
  </div>

  <!-- ドロップダウンメニュー -->
  <FilterDropdown
    isOpen={activeDropdown === 'type'}
    onClose={() => {
      activeDropdown = null;
    }}
    title="カードタイプ検索"
    onClearAll={filter.clearCardTypes}
  >
    <TypeFilterContent selectedTypes={filter.selectedCardTypes} onToggle={filter.toggleCardType} />
  </FilterDropdown>

  <FilterDropdown
    isOpen={activeDropdown === 'lrigClass'}
    onClose={() => {
      activeDropdown = null;
    }}
    title="ルリグタイプ/クラス検索"
    onClearAll={filter.clearLrigClasses}
  >
    <LrigClassFilterContent
      selectedLrigClasses={filter.selectedLrigClasses}
      onToggle={filter.toggleLrigClass}
    />
  </FilterDropdown>

  <FilterDropdown
    isOpen={activeDropdown === 'tag'}
    onClose={() => {
      activeDropdown = null;
    }}
    title="タグ検索"
    onClearAll={filter.clearTags}
  >
    <TagFilterContent selectedTags={filter.selectedTags} onToggle={filter.toggleTag} />
  </FilterDropdown>

  <Sidebar
    isOpen={isSidebarOpen}
    onClose={() => {
      isSidebarOpen = false;
    }}
    onDeckListClick={session.openList}
    onNewDeckClick={session.requestNew}
    onStatsClick={() => {
      isStatsOpen = true;
    }}
    user={page.data.user}
  />

  <DeckListModal
    isOpen={session.isDeckListOpen}
    onClose={() => {
      session.isDeckListOpen = false;
    }}
    decks={cloudSync.decks}
    onSelectDeck={session.requestLoad}
    onRequestDeleteDeck={session.requestDelete}
  />

  <DeckEditModal
    isOpen={session.isDeckEditOpen}
    onClose={() => {
      session.isDeckEditOpen = false;
    }}
    currentName={deck.name}
    currentMemo={deck.memo}
    onSave={session.save}
    {isLoggedIn}
  />

  <UnsavedConfirmModal
    isOpen={session.isUnsavedConfirmOpen}
    onCancel={session.cancelConfirm}
    onSave={session.confirmSave}
    onDiscard={session.discard}
  />

  <DeleteDeckConfirmModal
    isOpen={!!session.deckPendingDelete}
    deckName={session.deckPendingDelete?.name ?? ''}
    hasUnsavedChanges={session.deckPendingDelete?.id === deck.id && !deck.isSaved}
    onConfirm={session.confirmDelete}
    onCancel={session.cancelDelete}
  />

  <ShareModal
    isOpen={isShareOpen}
    onClose={() => {
      isShareOpen = false;
    }}
    deckName={deck.name}
    mainDeck={deck.mainDeck}
    lrigDeck={deck.lrigDeck}
    deckId={deck.id}
    currentSlug={deck.slug || deck.id}
    ownerAtName={page.data.user ? (page.data.user.username ?? page.data.user.blueskyHandle) : null}
    isPublic={deck.isPublic}
    {isLoggedIn}
    rotateLandscape={settings.rotateLandscape}
    onSetPublic={session.setPublic}
    onUpdateSlug={session.updateSlug}
  />

  <StatsModal
    isOpen={isStatsOpen}
    onClose={() => {
      isStatsOpen = false;
    }}
    {cardMap}
  />

  <CardPopup
    card={popupCard}
    onClose={() => {
      popupCard = null;
    }}
    isFavorite={popupCard ? favorites.has(popupCard) : false}
    onToggleFavorite={() => {
      if (popupCard) favorites.toggle(popupCard);
    }}
    {isLoggedIn}
    count={popupCount}
    canAdd={popupCanAdd}
    isInCandidate={popupInCandidate}
    onAdd={deck.addCard}
    onAddMultiple={deck.addMultiple}
    onRemove={(card) => deck.removeCard(card)}
    onAddToCandidate={deck.addToCandidate}
    onRemoveFromCandidate={deck.removeFromCandidate}
  />
</div>

<style>

  /* 画面そのもの。ここから外へはみ出させない */
  .shell {
    width: 100dvw;
    height: 100dvh;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  /* 本文の幅。段ごとに上限が変わる ―― Suisou の container は1段だけなので現場で持つ */
  .split {
    width: 100%;
    max-width: 40rem;
    margin-inline: auto;
    overflow: hidden;
  }
  @media (min-width: 768px) {
    .split {
      max-width: none;
      margin-block-end: var(--suisou-space-3);
    }
  }
  @media (min-width: 1024px) {
    .split {
      max-width: 80rem;
    }
  }
  @media (min-width: 1536px) {
    .split {
      max-width: 84vw;
    }
  }

  /* 伸び方の「比」は --suisou-share で渡す（layout="share"）。
     段は md / lg の2つなので、それで足りる振り方はここに書ける。 */
  .card-side {
    --suisou-share: 3;
  }
  @media (min-width: 768px) {
    .card-side {
      --suisou-share: 1;
    }
  }
  @media (min-width: 1024px) {
    .card-side {
      --suisou-share: 3;
    }
  }
</style>
