<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import type { Card, DeckSummary } from '$lib/types';
  import { getSettings, saveSettings, getDraft, saveDraft } from '$lib/utils/storage';
  import { loadAllCards, buildCardMap, buildOrderMap } from '$lib/utils/cardData';
  import { CloudDeckSync } from '$lib/stores/cloudDeckSync.svelte';
  import { DeckBuilderStore } from '$lib/stores/deckBuilder.svelte';
  import { FilterStore } from '$lib/stores/filterStore.svelte';
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

  // ── settings & favorites ───────────────────────────────────
  let showLifeBurst = $state(false);
  let showCandidateIcon = $state(false);
  let rotateLandscape = $state(false);
  let favoriteIds = $state<Set<string>>(new Set(page.data.favoriteIds ?? []));

  // ── draft persistence ──────────────────────────────────────
  let draftRestored = $state(false);

  // ── UI state ───────────────────────────────────────────────
  let hoveredCard = $state<Card | null>(null);
  let popupCard = $state<Card | null>(null);
  let isSidebarOpen = $state(false);
  let isDeckListOpen = $state(false);
  let isDeckEditOpen = $state(false);
  let isShareOpen = $state(false);
  let isStatsOpen = $state(false);
  let isUnsavedConfirmOpen = $state(false);
  let pendingAction = $state<(() => void) | null>(null);
  let deckPendingDelete = $state<DeckSummary | null>(null);
  let activeDropdown = $state<'type' | 'lrigClass' | 'tag' | null>(null);

  // ── filtered cards ─────────────────────────────────────────
  let filteredCards = $derived(filter.apply(allCardData, deck.candidateCards, favoriteIds));

  // ── card popup: 採用枚数・候補状態 ─────────────────────────
  function copiesInDeck(card: Card): number {
    const key = card.cardID ?? card.image;
    const match = (c: Card) => (c.cardID ?? c.image) === key;
    return deck.mainDeck.filter(match).length + deck.lrigDeck.filter(match).length;
  }
  let popupCount = $derived(popupCard ? copiesInDeck(popupCard) : 0);
  let popupInCandidate = $derived(
    popupCard ? deck.candidateCards.some((c) => c.image === popupCard!.image) : false,
  );

  // ── mount: load data & restore from storage ───────────────
  onMount(() => {
    // pull-to-refresh prevention (image swipe gestures conflict with scroll-to-refresh)
    let startY = 0;
    let touchedElement: EventTarget | null = null;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      touchedElement = e.target;
    };
    const onTouchMove = (e: TouchEvent) => {
      const deltaY = e.touches[0].clientY - startY;
      const isImg =
        (touchedElement as HTMLElement)?.closest?.('img') ||
        (touchedElement as HTMLElement)?.tagName === 'IMG';
      if (deltaY > 0 && window.scrollY === 0 && isImg) e.preventDefault();
    };
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });

    const draft = getDraft();
    if (draft) deck.restoreFromDraft(draft);
    draftRestored = true;

    const settings = getSettings();
    showLifeBurst = settings.showLifeBurst;
    showCandidateIcon = settings.showCandidateIcon;
    rotateLandscape = settings.rotateLandscape;
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

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
    };
  });

  $effect(() => {
    document.title = deck.name ? `wixdex - ${deck.name}` : 'wixdex';
  });

  $effect(() => {
    if (!draftRestored) return;
    saveDraft(deck.toDraft());
  });

  // ── settings ───────────────────────────────────────────────
  function toggleShowLifeBurst() {
    showLifeBurst = !showLifeBurst;
    saveSettings({ showLifeBurst, showCandidateIcon, rotateLandscape });
  }

  function toggleShowCandidateIcon() {
    showCandidateIcon = !showCandidateIcon;
    saveSettings({ showLifeBurst, showCandidateIcon, rotateLandscape });
  }

  function toggleRotateLandscape() {
    rotateLandscape = !rotateLandscape;
    saveSettings({ showLifeBurst, showCandidateIcon, rotateLandscape });
  }

  // ── favorites ──────────────────────────────────────────────
  async function toggleFavorite(card: Card) {
    if (!isLoggedIn || !card.cardID) return;
    const cardID = card.cardID;
    const exists = favoriteIds.has(cardID);
    favoriteIds = exists
      ? new Set([...favoriteIds].filter((id) => id !== cardID))
      : new Set([...favoriteIds, cardID]);
    await fetch('/api/favorites', {
      method: exists ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId: cardID }),
    });
  }

  function isFavorite(card: Card) {
    return !!card.cardID && favoriteIds.has(card.cardID);
  }

  // ── deck persistence orchestration ─────────────────────────
  // 新規・既存どちらも保存する統合関数
  async function saveDeck(name: string, memo: string) {
    if (!isLoggedIn) return;
    deck.setMeta(name, memo);
    try {
      const id = await cloudSync.save({
        id: deck.id ?? undefined,
        name: deck.name,
        memo: deck.memo,
        isPublic: deck.isPublic,
        mainDeck: deck.mainDeck,
        lrigDeck: deck.lrigDeck,
        candidateCards: deck.candidateCards,
      });
      deck.id = id;
      if (!deck.slug) deck.slug = id; // 新規保存時の既定 slug は id
      deck.markSaved();
    } catch {
      // cloudSync.error is set; user sees it in UI if we add an error display
    }
  }

  // ヘッダーの保存ボタン: 新規はモーダルを開き、既存は即保存
  function handleSaveClick() {
    if (!isLoggedIn) return;
    if (!deck.id) {
      isDeckEditOpen = true;
    } else {
      saveDeck(deck.name, deck.memo);
    }
  }

  async function handleDeckListOpen() {
    if (!isLoggedIn) return;
    await cloudSync.loadList();
    isDeckListOpen = true;
  }

  // デッキ公開URL(slug)の変更。成功したらストアにも反映。
  async function updateDeckSlug(
    slug: string,
  ): Promise<{ ok: boolean; error?: string; slug?: string }> {
    if (!deck.id) return { ok: false, error: 'デッキを保存してください。' };
    const res = await cloudSync.updateSlug(deck.id, slug);
    if (res.ok) deck.slug = res.slug;
    return res;
  }

  // 公開/非公開トグル: 即座に保存して反映する（保存済みデッキのみ）
  async function setDeckPublic(next: boolean) {
    if (!isLoggedIn || !deck.id) return;
    deck.isPublic = next;
    await saveDeck(deck.name, deck.memo);
  }

  function requestDeleteDeck(d: DeckSummary) {
    deckPendingDelete = d;
  }

  async function confirmDeleteDeck() {
    const d = deckPendingDelete;
    deckPendingDelete = null;
    if (!d) return;
    if (d.id === deck.id) {
      handleNewDeck();
    }
    await cloudSync.delete(d.id);
  }

  function cancelDeleteDeck() {
    deckPendingDelete = null;
  }

  async function handleLoadDeck(d: DeckSummary) {
    const loaded = await cloudSync.loadFull(d.id, cardMap);
    if (!loaded) return;
    deck.load(loaded);
  }

  function handleNewDeck() {
    deck.reset();
  }

  // ── 未保存変更のガード ──────────────────────────────────────
  // 未保存の変更があるときはワンクッション挟む
  function guardUnsaved(action: () => void) {
    if (deck.isSaved) {
      action();
    } else {
      pendingAction = action;
      isUnsavedConfirmOpen = true;
    }
  }

  function requestNewDeck() {
    guardUnsaved(handleNewDeck);
  }

  function requestLoadDeck(d: DeckSummary) {
    guardUnsaved(() => {
      handleLoadDeck(d);
    });
  }

  function runPendingAction() {
    const action = pendingAction;
    pendingAction = null;
    isUnsavedConfirmOpen = false;
    action?.();
  }

  async function handleConfirmSave() {
    await saveDeck(deck.name, deck.memo);
    // 保存成功時のみ続行（失敗時はモーダルを残してリトライ/破棄を選べる）
    if (deck.isSaved) runPendingAction();
  }

  function handleConfirmCancel() {
    pendingAction = null;
    isUnsavedConfirmOpen = false;
  }
</script>

<svelte:head>
  <title>wixdex — WIXOSS デッキビルダー</title>
  <meta property="og:title" content="wixdex — WIXOSS デッキビルダー" />
  <meta property="og:description" content="WIXOSS（ディーヴァ）のデッキを構築・公開・シェアできるツール。" />
  <meta property="og:url" content="https://wixdex.cards/" />
</svelte:head>

<div class="flex flex-col w-dvw h-dvh m-0 p-0 bg-zinc-900 overflow-hidden">
  <Navbar
    deckName={deck.name}
    isSaved={deck.isSaved}
    {isLoggedIn}
    onMenuClick={() => {
      isSidebarOpen = true;
    }}
    onSaveClick={handleSaveClick}
    onDeckClick={() => {
      isDeckEditOpen = true;
    }}
    onShareClick={() => {
      isShareOpen = true;
    }}
  />

  <div
    class="flex flex-col flex-1 w-full max-w-screen-sm mx-auto overflow-hidden md:flex-row md:max-w-none md:mb-4 lg:max-w-screen-xl 2xl:max-w-[84vw]"
  >
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
      {showLifeBurst}
      {rotateLandscape}
    />

    <div class="flex flex-3 flex-col min-h-0 md:flex-1 lg:flex-3 lg:flex-row">
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
        {showLifeBurst}
        {showCandidateIcon}
        {rotateLandscape}
        candidateCards={deck.candidateCards}
      />

      <SearchArea
        {hoveredCard}
        selectedColors={filter.selectedColors}
        selectedLevels={filter.selectedLevels}
        selectedCardTypes={filter.selectedCardTypes}
        selectedLrigClasses={filter.selectedLrigClasses}
        selectedTags={filter.selectedTags}
        lifeBurstFilter={filter.lifeBurstFilter}
        candidateFilter={filter.candidateFilter}
        favoriteFilter={filter.favoriteFilter}
        onColorFilter={filter.toggleColor}
        onTextSearch={filter.setSearchText}
        searchName={filter.searchName}
        searchInText={filter.searchInText}
        onToggleSearchName={filter.toggleSearchName}
        onToggleSearchInText={filter.toggleSearchInText}
        onLevelFilter={filter.toggleLevel}
        onLifeBurstFilter={filter.toggleLifeBurst}
        onCardTypeFilter={filter.toggleCardType}
        onLrigClassFilter={filter.toggleLrigClass}
        onTagFilter={filter.toggleTag}
        onCandidateFilter={filter.toggleCandidate}
        onFavoriteFilter={filter.toggleFavorite}
        {isLoggedIn}
        onReset={filter.reset}
        {activeDropdown}
        onDropdownChange={(d) => {
          activeDropdown = d;
        }}
        {showLifeBurst}
        onToggleLifeBurst={toggleShowLifeBurst}
        {showCandidateIcon}
        onToggleCandidateIcon={toggleShowCandidateIcon}
        {rotateLandscape}
        onToggleRotateLandscape={toggleRotateLandscape}
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
    onDeckListClick={handleDeckListOpen}
    onNewDeckClick={requestNewDeck}
    onStatsClick={() => {
      isStatsOpen = true;
    }}
    user={page.data.user}
  />

  <DeckListModal
    isOpen={isDeckListOpen}
    onClose={() => {
      isDeckListOpen = false;
    }}
    decks={cloudSync.decks}
    onSelectDeck={requestLoadDeck}
    onRequestDeleteDeck={requestDeleteDeck}
  />

  <DeckEditModal
    isOpen={isDeckEditOpen}
    onClose={() => {
      isDeckEditOpen = false;
    }}
    currentName={deck.name}
    currentMemo={deck.memo}
    onSave={saveDeck}
    {isLoggedIn}
  />

  <UnsavedConfirmModal
    isOpen={isUnsavedConfirmOpen}
    onCancel={handleConfirmCancel}
    onSave={handleConfirmSave}
    onDiscard={runPendingAction}
  />

  <DeleteDeckConfirmModal
    isOpen={!!deckPendingDelete}
    deckName={deckPendingDelete?.name ?? ''}
    hasUnsavedChanges={deckPendingDelete?.id === deck.id && !deck.isSaved}
    onConfirm={confirmDeleteDeck}
    onCancel={cancelDeleteDeck}
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
    {rotateLandscape}
    onSetPublic={setDeckPublic}
    onUpdateSlug={updateDeckSlug}
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
    isFavorite={popupCard ? isFavorite(popupCard) : false}
    onToggleFavorite={() => {
      if (popupCard) toggleFavorite(popupCard);
    }}
    {isLoggedIn}
    count={popupCount}
    isInCandidate={popupInCandidate}
    onAdd={deck.addCard}
    onAddMultiple={deck.addMultiple}
    onRemove={(card) => deck.removeCard(card)}
    onAddToCandidate={deck.addToCandidate}
    onRemoveFromCandidate={deck.removeFromCandidate}
  />
</div>
