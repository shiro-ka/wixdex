import { useMemo, useEffect, useState } from 'react';
import CardList from './components/CardList';
import DeckArea from './components/DeckArea';
import SearchArea from './components/SearchArea';
import CardPopup from './components/CardPopup';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DeckListModal from './components/DeckListModal';
import DeckEditModal from './components/DeckEditModal';
import ShareModal from './components/ShareModal';
import FilterDropdown from './components/dropdowns/FilterDropdown';
import TypeFilterContent from './components/dropdowns/TypeFilterContent';
import LrigClassFilterContent from './components/dropdowns/LrigClassFilterContent';
import TagFilterContent from './components/dropdowns/TagFilterContent';
import { useDeckManager } from './hooks/useDeckManager';
import { useCardHover } from './hooks/useCardHover';
import { useCardPopup } from './hooks/useCardPopup';
import { useCardFilter } from './hooks/useCardFilter';
import { useDeckStorage, type SavedDeck } from './hooks/useDeckStorage';
import { useCurrentDeck } from './hooks/useCurrentDeck';
import { useUserSettings } from './hooks/useUserSettings';
import { useFavoriteCards } from './hooks/useFavoriteCards';
import { filterCards } from './utils/cardFilters';
import type { Card } from './types';

// カードデータ
import cardDataWX24P4 from './assets/cards_json/WX24-P4.json';
import cardDataWXDiP16 from './assets/cards_json/WXDi-P16.json';
import cardDataWXDiP15 from './assets/cards_json/WXDi-P15.json';
import cardDataWXDiP13 from './assets/cards_json/WXDi-P13.json';
import cardDataWXDiP12 from './assets/cards_json/WXDi-P12.json';
import cardDataServant from './assets/cards_json/servant.json';

function App() {
  // カスタムフックでstate管理
  const deck = useDeckManager();
  const { hoveredCard, onCardHover } = useCardHover();
  const { popupCard, onCardClick, closePopup } = useCardPopup();
  const filter = useCardFilter();
  const { getAllDecks, saveDeck, updateDeck } = useDeckStorage();
  const currentDeck = useCurrentDeck();
  const { settings, toggleShowLifeBurst, toggleShowCandidateIcon } = useUserSettings();
  const { favoriteCards, toggleFavorite, isFavorite } = useFavoriteCards();

  // オーバーレイ要素の状態管理
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeckListOpen, setIsDeckListOpen] = useState(false);
  const [isDeckEditOpen, setIsDeckEditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'type' | 'lrigClass' | 'tag' | null>(null);

  const handleSidebarOpen = () => {
    setIsSidebarOpen(true);
  };

  const handleSave = () => {
    if (currentDeck.id) {
      // 既存デッキの更新
      const success = updateDeck(currentDeck.id, currentDeck.name, currentDeck.memo, deck.mainDeck, deck.lrigDeck, deck.candidateCards);
      if (success) {
        currentDeck.markAsSaved();
      }
    } else {
      // 新規デッキの保存
      const deckName = prompt('デッキ名を入力してください', 'New Deck');
      if (deckName) {
        const newDeck = saveDeck(deckName, '', deck.mainDeck, deck.lrigDeck, deck.candidateCards);
        if (newDeck) {
          currentDeck.createNewDeck(newDeck.id, newDeck.name, newDeck.memo);
        }
      }
    }
  };

  const handleDeckListOpen = () => {
    setIsDeckListOpen(true);
  };

  const handleDeckEditOpen = () => {
    setIsDeckEditOpen(true);
  };

  const handleShareOpen = () => {
    setIsShareOpen(true);
  };

  const handleLoadDeck = (savedDeck: SavedDeck) => {
    deck.loadDeck(savedDeck.mainDeck, savedDeck.lrigDeck, savedDeck.candidateCards);
    currentDeck.loadDeck(savedDeck.id, savedDeck.name, savedDeck.memo);
  };

  const handleDeckEdit = (name: string, memo: string) => {
    if (currentDeck.id) {
      const success = updateDeck(currentDeck.id, name, memo, deck.mainDeck, deck.lrigDeck, deck.candidateCards);
      if (success) {
        currentDeck.updateMetadata(name, memo);
      }
    }
  };

  // デッキ内容が変更されたら未保存状態に
  useEffect(() => {
    if (currentDeck.id) {
      currentDeck.markAsUnsaved();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deck.mainDeck, deck.lrigDeck, deck.candidateCards]);

  // デッキ名が設定されている場合はタイトルを更新
  useEffect(() => {
    if (currentDeck.name) {
      document.title = `${currentDeck.name} - wixdex`;
    } else {
      document.title = 'wixdex';
    }
  }, [currentDeck.name]);

  // 引っ張って更新を防ぐ（特定要素のみ）
  useEffect(() => {
    let startY = 0;
    let touchedElement: EventTarget | null = null;

    const touchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      touchedElement = e.target;
    };

    const touchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      // カード要素をタッチしている場合のみ引っ張りを防ぐ
      const isCardElement = (touchedElement as HTMLElement)?.closest?.('img') || (touchedElement as HTMLElement)?.tagName === 'IMG';

      // 下方向のスワイプ（引っ張り）かつカード要素をタッチしている時
      if (deltaY > 0 && window.scrollY === 0 && isCardElement) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', touchStart, { passive: true });
    document.addEventListener('touchmove', touchMove, { passive: false });

    return () => {
      document.removeEventListener('touchstart', touchStart);
      document.removeEventListener('touchmove', touchMove);
    };
  }, []);

  // カードデータをまとめる
  const allCardData = useMemo(() => [
    ...(cardDataServant as Card[]),
    ...(cardDataWX24P4 as Card[]),
    ...(cardDataWXDiP16 as Card[]),
    ...(cardDataWXDiP13 as Card[]),
    ...(cardDataWXDiP15 as Card[]),
    ...(cardDataWXDiP12 as Card[]),
  ], []);

  // フィルタリングされたカードリスト
  const filteredCards = useMemo(() => {
    return filterCards(allCardData, {
      selectedColors: filter.selectedColors,
      selectedLevels: filter.selectedLevels,
      selectedCardTypes: filter.selectedCardTypes,
      selectedLrigClasses: filter.selectedLrigClasses,
      selectedTags: filter.selectedTags,
      lifeBurstFilter: filter.lifeBurstFilter,
      searchText: filter.searchText,
      candidateFilter: filter.candidateFilter,
      candidateCards: deck.candidateCards,
      favoriteFilter: filter.favoriteFilter,
      favoriteCards: favoriteCards,
    });
  }, [allCardData, filter.selectedColors, filter.selectedLevels, filter.selectedCardTypes, filter.selectedLrigClasses, filter.selectedTags, filter.lifeBurstFilter, filter.searchText, filter.candidateFilter, deck.candidateCards, filter.favoriteFilter, favoriteCards]);

  return (
    <div className="flex flex-col w-dvw h-dvh m-0 p-0 bg-zinc-900 overflow-hidden">
      {/* Navbar */}
      <Navbar
        basePath="/wixdex"
        deckName={currentDeck.name}
        isSaved={currentDeck.isSaved}
        onMenuClick={handleSidebarOpen}
        onSaveClick={handleSave}
        onDeckClick={handleDeckEditOpen}
        onShareClick={handleShareOpen}
      />
      {/* Container */}
      <div className="flex flex-col flex-1 w-full max-w-screen-sm mx-auto overflow-hidden md:flex-1 lg:flex-row lg:max-w-screen-xl lg:mb-4 2xl:max-w-[84vw]">
        {/* デッキ欄 */}
        <DeckArea
          mainDeck={deck.mainDeck}
          lrigDeck={deck.lrigDeck}
          onCardHover={onCardHover}
          onAdd={deck.addCard}
          onRemove={deck.removeCard}
          candidateCards={deck.candidateCards}
          onRemoveFromCandidate={deck.removeFromCandidate}
          onCardClick={onCardClick}
          lifeBurstCount={deck.lifeBurstCount}
          basePath="/wixdex"
          showLifeBurst={settings.showLifeBurst}
        />
        <div className="flex flex-3 flex-col lg:flex-row">
          {/* カードリスト欄 */}
          <CardList
            cards={filteredCards}
            onAdd={deck.addCard}
            onAddMultiple={deck.addMultipleCards}
            onRemove={deck.removeCard}
            onCardHover={onCardHover}
            onAddToCandidate={deck.addToCandidate}
            onRemoveFromCandidate={deck.removeFromCandidate}
            candidateFilter={filter.candidateFilter}
            onCardClick={onCardClick}
            basePath="/wixdex"
            showLifeBurst={settings.showLifeBurst}
            showCandidateIcon={settings.showCandidateIcon}
            candidateCards={deck.candidateCards}
          />
          {/* 検索欄 */}
          <SearchArea
            hoveredCard={hoveredCard}
            selectedColors={filter.selectedColors}
            selectedLevels={filter.selectedLevels}
            selectedCardTypes={filter.selectedCardTypes}
            selectedLrigClasses={filter.selectedLrigClasses}
            selectedTags={filter.selectedTags}
            lifeBurstFilter={filter.lifeBurstFilter}
            candidateFilter={filter.candidateFilter}
            favoriteFilter={filter.favoriteFilter}
            onColorFilter={filter.toggleColorFilter}
            onTextSearch={filter.setSearchText}
            onLevelFilter={filter.toggleLevelFilter}
            onLifeBurstFilter={filter.toggleLifeBurstFilter}
            onCardTypeFilter={filter.toggleCardTypeFilter}
            onLrigClassFilter={filter.toggleLrigClassFilter}
            onTagFilter={filter.toggleTagFilter}
            onCandidateFilter={filter.toggleCandidateFilter}
            onFavoriteFilter={filter.toggleFavoriteFilter}
            onReset={filter.resetFilters}
            basePath="/wixdex"
            activeDropdown={activeDropdown}
            onDropdownChange={setActiveDropdown}
            showLifeBurst={settings.showLifeBurst}
            onToggleLifeBurst={toggleShowLifeBurst}
            showCandidateIcon={settings.showCandidateIcon}
            onToggleCandidateIcon={toggleShowCandidateIcon}
          />
        </div>
      </div>

      {/* ドロップダウンメニュー（App レベル） */}
      <FilterDropdown
        isOpen={activeDropdown === 'type'}
        onClose={() => setActiveDropdown(null)}
        title="カードタイプ検索"
        onClearAll={() => {
          // 現在選択されているカード種類をすべて解除
          filter.selectedCardTypes.forEach(type => filter.toggleCardTypeFilter(type));
        }}
      >
        <TypeFilterContent
          selectedTypes={filter.selectedCardTypes}
          onToggle={filter.toggleCardTypeFilter}
        />
      </FilterDropdown>

      <FilterDropdown
        isOpen={activeDropdown === 'lrigClass'}
        onClose={() => setActiveDropdown(null)}
        title="ルリグタイプ/クラス検索"
        onClearAll={() => {
          // 現在選択されているルリグクラスをすべて解除
          filter.selectedLrigClasses.forEach(lrigClass => filter.toggleLrigClassFilter(lrigClass));
        }}
      >
        <LrigClassFilterContent
          selectedLrigClasses={filter.selectedLrigClasses}
          onToggle={filter.toggleLrigClassFilter}
        />
      </FilterDropdown>

      <FilterDropdown
        isOpen={activeDropdown === 'tag'}
        onClose={() => setActiveDropdown(null)}
        title="タグ検索"
        onClearAll={() => {
          // 現在選択されているタグをすべて解除
          filter.selectedTags.forEach(tag => filter.toggleTagFilter(tag));
        }}
      >
        <TagFilterContent
          selectedTags={filter.selectedTags}
          onToggle={filter.toggleTagFilter}
        />
      </FilterDropdown>

      {/* サイドバー（App レベル） */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onDeckListClick={handleDeckListOpen}
        onNewDeckClick={() => {
          // 新しいデッキ作成時の処理（現在のデッキをリセット）
          currentDeck.resetDeck();
          deck.loadDeck([], [], []);
        }}
      />

      {/* デッキ一覧モーダル */}
      <DeckListModal
        isOpen={isDeckListOpen}
        onClose={() => setIsDeckListOpen(false)}
        decks={getAllDecks()}
        onSelectDeck={handleLoadDeck}
      />

      {/* デッキ編集モーダル */}
      <DeckEditModal
        isOpen={isDeckEditOpen}
        onClose={() => setIsDeckEditOpen(false)}
        currentName={currentDeck.name}
        currentMemo={currentDeck.memo}
        onSave={handleDeckEdit}
      />

      {/* シェアモーダル */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        deckName={currentDeck.name}
        mainDeck={deck.mainDeck}
        lrigDeck={deck.lrigDeck}
      />

      {/* ポップアップ */}
      <CardPopup
        card={popupCard}
        onClose={closePopup}
        basePath="/wixdex"
        isFavorite={popupCard ? isFavorite(popupCard) : false}
        onToggleFavorite={popupCard ? () => toggleFavorite(popupCard) : () => { }}
      />
    </div>
  );
}

export default App;
