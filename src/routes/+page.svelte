<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import type { Card, DeckType } from '$lib/types';
  import { filterCards } from '$lib/utils/cardFilters';
  import { sortCandidateCards } from '$lib/utils/cardSorting';
  import { addCardToDeck, addMultipleCardsToDeck, removeCardFromDeck } from '$lib/utils/deckOperations';
  import { getSettings, saveSettings, getFavorites, saveFavorites } from '$lib/utils/storage';
  import { CloudDeckSync } from '$lib/stores/cloudDeckSync.svelte';
  import type { DeckSummary } from '$lib/types';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import DeckArea from '$lib/components/DeckArea.svelte';
  import CardList from '$lib/components/CardList.svelte';
  import SearchArea from '$lib/components/SearchArea.svelte';
  import CardPopup from '$lib/components/CardPopup.svelte';
  import DeckListModal from '$lib/components/DeckListModal.svelte';
  import DeckEditModal from '$lib/components/DeckEditModal.svelte';
  import ShareModal from '$lib/components/ShareModal.svelte';
  import FilterDropdown from '$lib/components/dropdowns/FilterDropdown.svelte';
  import TypeFilterContent from '$lib/components/dropdowns/TypeFilterContent.svelte';
  import LrigClassFilterContent from '$lib/components/dropdowns/LrigClassFilterContent.svelte';
  import TagFilterContent from '$lib/components/dropdowns/TagFilterContent.svelte';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
  import ErrorMessage from '$lib/components/ErrorMessage.svelte';

  const CARD_SETS = ['servant', 'WX25-P1', 'WX24-P2', 'WX24-P3', 'WX24-P4', 'WXDi-P16', 'WXDi-P15', 'WXDi-P13', 'WXDi-P12'];

  // ── card data ──────────────────────────────────────────────
  let allCardData = $state<Card[]>([]);
  let loading = $state(true);
  let loadError = $state<string | null>(null);

  let cardMap = $derived(new Map(allCardData.map((c) => [c.id ?? c.image, c] as const).filter(([k]) => !!k)));

  // ── cloud sync ─────────────────────────────────────────────
  const cloudSync = new CloudDeckSync(!!page.data.user);

  // ── deck state ─────────────────────────────────────────────
  let mainDeck = $state<Card[]>([]);
  let lrigDeck = $state<Card[]>([]);
  let candidateCards = $state<Card[]>([]);

  let lifeBurstCount = $derived(mainDeck.filter(c => c.lifeBurst === 'true').length);
  let sortedCandidateCards = $derived(sortCandidateCards(candidateCards));

  // ── current deck metadata ──────────────────────────────────
  let currentDeckId = $state<string | null>(null);
  let currentDeckName = $state('');
  let currentDeckMemo = $state('');
  let currentDeckIsSaved = $state(true);

  // ── filter state ───────────────────────────────────────────
  let selectedColors = $state<Set<string>>(new Set());
  let selectedLevels = $state<Set<number>>(new Set());
  let selectedCardTypes = $state<Set<string>>(new Set());
  let selectedLrigClasses = $state<Set<string>>(new Set());
  let selectedTags = $state<Set<string>>(new Set());
  let lifeBurstFilter = $state<boolean | null>(null);
  let searchText = $state('');
  let candidateFilter = $state(false);
  let favoriteFilter = $state(false);

  // ── settings & favorites ───────────────────────────────────
  let showLifeBurst = $state(false);
  let showCandidateIcon = $state(false);
  let favoriteCards = $state<Card[]>([]);

  // ── UI state ───────────────────────────────────────────────
  let hoveredCard = $state<Card | null>(null);
  let popupCard = $state<Card | null>(null);
  let isSidebarOpen = $state(false);
  let isDeckListOpen = $state(false);
  let isDeckEditOpen = $state(false);
  let isShareOpen = $state(false);
  let activeDropdown = $state<'type' | 'lrigClass' | 'tag' | null>(null);

  // ── filtered cards ─────────────────────────────────────────
  let filteredCards = $derived(filterCards(allCardData, {
    selectedColors,
    selectedLevels,
    selectedCardTypes,
    selectedLrigClasses,
    selectedTags,
    lifeBurstFilter,
    searchText,
    candidateFilter,
    candidateCards,
    favoriteFilter,
    favoriteCards,
  }));

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
      const isImg = (touchedElement as HTMLElement)?.closest?.('img') || (touchedElement as HTMLElement)?.tagName === 'IMG';
      if (deltaY > 0 && window.scrollY === 0 && isImg) e.preventDefault();
    };
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });

    const settings = getSettings();
    showLifeBurst = settings.showLifeBurst;
    showCandidateIcon = settings.showCandidateIcon;
    favoriteCards = getFavorites();

    Promise.all(
      CARD_SETS.map(set =>
        fetch(`/assets/cards_json/${set}.json`).then(r => {
          if (!r.ok) throw new Error(`Failed to load ${set}.json`);
          return r.json() as Promise<Card[]>;
        })
      )
    ).then(results => {
      allCardData = results.flat();
      loading = false;
    }).catch(err => {
      loadError = err instanceof Error ? err.message : 'カードデータの読み込みに失敗しました';
      loading = false;
    });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
    };
  });

  $effect(() => {
    document.title = currentDeckName ? `${currentDeckName} - wixdex` : 'wixdex';
  });

  $effect(() => {
    void mainDeck.length; void lrigDeck.length; void candidateCards.length;
    if (currentDeckId) currentDeckIsSaved = false;
  });

  // ── deck operations ────────────────────────────────────────
  function addCard(card: Card) {
    const result = addCardToDeck(card, mainDeck, lrigDeck);
    mainDeck = result.mainDeck;
    lrigDeck = result.lrigDeck;
  }

  function addMultipleCards(card: Card, count: number) {
    const result = addMultipleCardsToDeck(card, count, mainDeck, lrigDeck);
    mainDeck = result.mainDeck;
    lrigDeck = result.lrigDeck;
  }

  function removeCard(card: Card, specificIndex: number | null = null, deckType: DeckType | null = null) {
    const result = removeCardFromDeck(card, mainDeck, lrigDeck, specificIndex, deckType);
    mainDeck = result.mainDeck;
    lrigDeck = result.lrigDeck;
    const remainingInMain = result.mainDeck.filter(c => c.id === card.id).length;
    const remainingInLrig = result.lrigDeck.filter(c => c.id === card.id).length;
    if (remainingInMain === 0 && remainingInLrig === 0) {
      if (!candidateCards.some(c => c.id === card.id)) {
        candidateCards = [...candidateCards, card];
      }
    }
  }

  function addToCandidate(card: Card) {
    if (!candidateCards.some(c => c.image === card.image)) {
      candidateCards = [...candidateCards, card];
    }
  }

  function removeFromCandidate(card: Card) {
    candidateCards = candidateCards.filter(c => c.image !== card.image);
  }

  function loadDeckData(main: Card[], lrig: Card[], candidate: Card[]) {
    mainDeck = main;
    lrigDeck = lrig;
    candidateCards = candidate;
  }

  // ── filter operations ──────────────────────────────────────
  function toggleColorFilter(color: string) {
    const s = new Set(selectedColors);
    s.has(color) ? s.delete(color) : s.add(color);
    selectedColors = s;
  }

  function toggleLevelFilter(level: number) {
    const s = new Set(selectedLevels);
    s.has(level) ? s.delete(level) : s.add(level);
    selectedLevels = s;
  }

  function toggleCardTypeFilter(type: string) {
    const s = new Set(selectedCardTypes);
    s.has(type) ? s.delete(type) : s.add(type);
    selectedCardTypes = s;
  }

  function toggleLrigClassFilter(lrigClass: string) {
    const s = new Set(selectedLrigClasses);
    s.has(lrigClass) ? s.delete(lrigClass) : s.add(lrigClass);
    selectedLrigClasses = s;
  }

  function toggleTagFilter(tag: string) {
    const s = new Set(selectedTags);
    s.has(tag) ? s.delete(tag) : s.add(tag);
    selectedTags = s;
  }

  function toggleLifeBurstFilter() {
    if (lifeBurstFilter === null) lifeBurstFilter = true;
    else if (lifeBurstFilter === true) lifeBurstFilter = false;
    else lifeBurstFilter = null;
  }

  function resetFilters() {
    selectedColors = new Set();
    selectedLevels = new Set();
    selectedCardTypes = new Set();
    selectedLrigClasses = new Set();
    selectedTags = new Set();
    lifeBurstFilter = null;
    searchText = '';
    candidateFilter = false;
    favoriteFilter = false;
  }

  // ── settings ───────────────────────────────────────────────
  function toggleShowLifeBurst() {
    showLifeBurst = !showLifeBurst;
    saveSettings({ showLifeBurst, showCandidateIcon });
  }

  function toggleShowCandidateIcon() {
    showCandidateIcon = !showCandidateIcon;
    saveSettings({ showLifeBurst, showCandidateIcon });
  }

  // ── favorites ──────────────────────────────────────────────
  const isSameCard = (a: Card, b: Card) => (!!a.id && a.id === b.id) || a.image === b.image;

  function toggleFavorite(card: Card) {
    const exists = favoriteCards.some(c => isSameCard(c, card));
    favoriteCards = exists
      ? favoriteCards.filter(c => !isSameCard(c, card))
      : [...favoriteCards, card];
    saveFavorites(favoriteCards);
  }

  function isFavorite(card: Card) {
    return favoriteCards.some(c => isSameCard(c, card));
  }

  // ── deck persistence ───────────────────────────────────────
  async function handleSave() {
    if (!currentDeckId) {
      const name = prompt('デッキ名を入力してください', 'New Deck');
      if (!name) return;
      currentDeckName = name;
    }
    try {
      const id = await cloudSync.save({
        id: currentDeckId ?? undefined,
        name: currentDeckName,
        memo: currentDeckMemo,
        mainDeck,
        lrigDeck,
        candidateCards,
      });
      currentDeckId = id;
      currentDeckIsSaved = true;
    } catch {
      // cloudSync.error is set; user sees it in UI if we add an error display
    }
  }

  async function handleDeckListOpen() {
    await cloudSync.loadList();
    isDeckListOpen = true;
  }

  async function handleDeleteDeck(deckId: string) {
    if (deckId === currentDeckId) {
      handleNewDeck();
    }
    await cloudSync.delete(deckId);
  }

  async function handleLoadDeck(deck: DeckSummary) {
    const loaded = await cloudSync.loadFull(deck.id, cardMap);
    if (!loaded) return;
    loadDeckData(loaded.mainDeck, loaded.lrigDeck, loaded.candidateCards);
    currentDeckId = loaded.id;
    currentDeckName = loaded.name;
    currentDeckMemo = loaded.memo;
    currentDeckIsSaved = true;
  }

  async function handleDeckEdit(name: string, memo: string) {
    if (!currentDeckId) return;
    currentDeckName = name;
    currentDeckMemo = memo;
    try {
      await cloudSync.save({
        id: currentDeckId,
        name,
        memo,
        mainDeck,
        lrigDeck,
        candidateCards,
      });
      currentDeckIsSaved = true;
    } catch {
      // error handled by cloudSync.error
    }
  }

  function handleNewDeck() {
    currentDeckId = null;
    currentDeckName = '';
    currentDeckMemo = '';
    currentDeckIsSaved = true;
    loadDeckData([], [], []);
  }
</script>

{#if loading}
  <LoadingSpinner />
{:else if loadError}
  <ErrorMessage message={loadError} />
{:else}
  <div class="flex flex-col w-dvw h-dvh m-0 p-0 bg-zinc-900 overflow-hidden">
    <Navbar
      deckName={currentDeckName}
      isSaved={currentDeckIsSaved}
      onMenuClick={() => { isSidebarOpen = true; }}
      onSaveClick={handleSave}
      onDeckClick={() => { isDeckEditOpen = true; }}
      onShareClick={() => { isShareOpen = true; }}
    />

    <div class="flex flex-col flex-1 w-full max-w-screen-sm mx-auto overflow-hidden md:flex-1 lg:flex-row lg:max-w-screen-xl lg:mb-4 2xl:max-w-[84vw]">
      <DeckArea
        {mainDeck}
        {lrigDeck}
        onCardHover={(card) => { hoveredCard = card; }}
        onAdd={addCard}
        onAddMultiple={addMultipleCards}
        onRemove={removeCard}
        candidateCards={sortedCandidateCards}
        onRemoveFromCandidate={removeFromCandidate}
        onCardClick={(card) => { popupCard = card; }}
        {lifeBurstCount}
        {showLifeBurst}
      />

      <div class="flex flex-3 flex-col lg:flex-row">
        <CardList
          cards={filteredCards}
          onAdd={addCard}
          onAddMultiple={addMultipleCards}
          onRemove={(card) => removeCard(card)}
          onCardHover={(card) => { hoveredCard = card; }}
          onAddToCandidate={addToCandidate}
          onRemoveFromCandidate={removeFromCandidate}
          {candidateFilter}
          onCardClick={(card) => { popupCard = card; }}
          {showLifeBurst}
          {showCandidateIcon}
          {candidateCards}
        />

        <SearchArea
          {hoveredCard}
          {selectedColors}
          {selectedLevels}
          {selectedCardTypes}
          {selectedLrigClasses}
          {selectedTags}
          {lifeBurstFilter}
          {candidateFilter}
          {favoriteFilter}
          onColorFilter={toggleColorFilter}
          onTextSearch={(t) => { searchText = t; }}
          onLevelFilter={toggleLevelFilter}
          onLifeBurstFilter={toggleLifeBurstFilter}
          onCardTypeFilter={toggleCardTypeFilter}
          onLrigClassFilter={toggleLrigClassFilter}
          onTagFilter={toggleTagFilter}
          onCandidateFilter={() => { candidateFilter = !candidateFilter; }}
          onFavoriteFilter={() => { favoriteFilter = !favoriteFilter; }}
          onReset={resetFilters}
          {activeDropdown}
          onDropdownChange={(d) => { activeDropdown = d; }}
          {showLifeBurst}
          onToggleLifeBurst={toggleShowLifeBurst}
          {showCandidateIcon}
          onToggleCandidateIcon={toggleShowCandidateIcon}
        />
      </div>
    </div>

    <!-- ドロップダウンメニュー -->
    <FilterDropdown
      isOpen={activeDropdown === 'type'}
      onClose={() => { activeDropdown = null; }}
      title="カードタイプ検索"
      onClearAll={() => { selectedCardTypes.forEach(t => toggleCardTypeFilter(t)); }}
    >
      {#snippet children()}
        <TypeFilterContent selectedTypes={selectedCardTypes} onToggle={toggleCardTypeFilter} />
      {/snippet}
    </FilterDropdown>

    <FilterDropdown
      isOpen={activeDropdown === 'lrigClass'}
      onClose={() => { activeDropdown = null; }}
      title="ルリグタイプ/クラス検索"
      onClearAll={() => { selectedLrigClasses.forEach(c => toggleLrigClassFilter(c)); }}
    >
      {#snippet children()}
        <LrigClassFilterContent selectedLrigClasses={selectedLrigClasses} onToggle={toggleLrigClassFilter} />
      {/snippet}
    </FilterDropdown>

    <FilterDropdown
      isOpen={activeDropdown === 'tag'}
      onClose={() => { activeDropdown = null; }}
      title="タグ検索"
      onClearAll={() => { selectedTags.forEach(t => toggleTagFilter(t)); }}
    >
      {#snippet children()}
        <TagFilterContent {selectedTags} onToggle={toggleTagFilter} />
      {/snippet}
    </FilterDropdown>

    <Sidebar
      isOpen={isSidebarOpen}
      onClose={() => { isSidebarOpen = false; }}
      onDeckListClick={handleDeckListOpen}
      onNewDeckClick={handleNewDeck}
      user={page.data.user}
    />

    <DeckListModal
      isOpen={isDeckListOpen}
      onClose={() => { isDeckListOpen = false; }}
      decks={cloudSync.decks}
      onSelectDeck={handleLoadDeck}
      onDeleteDeck={handleDeleteDeck}
    />

    <DeckEditModal
      isOpen={isDeckEditOpen}
      onClose={() => { isDeckEditOpen = false; }}
      currentName={currentDeckName}
      currentMemo={currentDeckMemo}
      onSave={handleDeckEdit}
    />

    <ShareModal
      isOpen={isShareOpen}
      onClose={() => { isShareOpen = false; }}
      deckName={currentDeckName}
      {mainDeck}
      {lrigDeck}
    />

    <CardPopup
      card={popupCard}
      onClose={() => { popupCard = null; }}
      isFavorite={popupCard ? isFavorite(popupCard) : false}
      onToggleFavorite={() => { if (popupCard) toggleFavorite(popupCard); }}
    />
  </div>
{/if}
