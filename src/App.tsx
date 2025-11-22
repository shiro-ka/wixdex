import { useMemo, useEffect, useState } from 'react';
import CardList from './components/CardList';
import DeckArea from './components/DeckArea';
import SearchArea from './components/SearchArea';
import CardPopup from './components/CardPopup';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DeckListModal from './components/DeckListModal';
import DeckEditModal from './components/DeckEditModal';
import FilterDropdown from './components/dropdowns/FilterDropdown';
import TypeFilterContent from './components/dropdowns/TypeFilterContent';
import LrigClassFilterContent from './components/dropdowns/LrigClassFilterContent';
import { useDeckManager } from './hooks/useDeckManager';
import { useCardHover } from './hooks/useCardHover';
import { useCardPopup } from './hooks/useCardPopup';
import { useCardFilter } from './hooks/useCardFilter';
import { useDeckStorage } from './hooks/useDeckStorage';
import { filterCards } from './utils/cardFilters';
import type { Card } from './types';

// カードデータ
import cardDataWX24P4 from './assets/cards_json/WX24-P4.json';
import cardDataWXDiP16 from './assets/cards_json/WXDi-P16.json';
import cardDataWXDiP15 from './assets/cards_json/WXDi-P15.json';
import cardDataWXDiP13 from './assets/cards_json/WXDi-P13.json';
import cardDataWXDiP12 from './assets/cards_json/WXDi-P12.json';

function App() {
  // カスタムフックでstate管理
  const deck = useDeckManager();
  const { hoveredCard, onCardHover } = useCardHover();
  const { popupCard, onCardClick, closePopup } = useCardPopup();
  const filter = useCardFilter();
  const { getAllDecks, saveDeck, updateDeck } = useDeckStorage();

  // 現在のデッキ情報
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(null);
  const [currentDeckName, setCurrentDeckName] = useState('');
  const [currentDeckMemo, setCurrentDeckMemo] = useState('');

  // オーバーレイ要素の状態管理
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeckListOpen, setIsDeckListOpen] = useState(false);
  const [isDeckEditOpen, setIsDeckEditOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'type' | 'lrigClass' | null>(null);

  const handleSidebarOpen = () => {
    console.log('App: handleSidebarOpen called!');
    setIsSidebarOpen(true);
  };

  const handleSave = () => {
    console.log('App: handleSave called!');
    if (currentDeckId) {
      // 既存デッキの更新
      updateDeck(currentDeckId, currentDeckName, currentDeckMemo, deck.mainDeck, deck.lrigDeck, deck.candidateCards);
      alert(`デッキ「${currentDeckName}」を更新しました！`);
    } else {
      // 新規デッキの保存
      const deckName = prompt('デッキ名を入力してください', 'New Deck');
      if (deckName) {
        const newDeck = saveDeck(deckName, '', deck.mainDeck, deck.lrigDeck, deck.candidateCards);
        setCurrentDeckId(newDeck.id);
        setCurrentDeckName(newDeck.name);
        setCurrentDeckMemo(newDeck.memo);
        alert(`デッキ「${deckName}」を保存しました！`);
      }
    }
  };

  const handleDeckListOpen = () => {
    setIsDeckListOpen(true);
  };

  const handleDeckEditOpen = () => {
    setIsDeckEditOpen(true);
  };

  const handleLoadDeck = (savedDeck: { id: string; name: string; memo: string; mainDeck: Card[]; lrigDeck: Card[]; candidateCards: Card[] }) => {
    deck.loadDeck(savedDeck.mainDeck, savedDeck.lrigDeck, savedDeck.candidateCards);
    setCurrentDeckId(savedDeck.id);
    setCurrentDeckName(savedDeck.name);
    setCurrentDeckMemo(savedDeck.memo);
  };

  const handleDeckEdit = (name: string, memo: string) => {
    setCurrentDeckName(name);
    setCurrentDeckMemo(memo);
    if (currentDeckId) {
      updateDeck(currentDeckId, name, memo, deck.mainDeck, deck.lrigDeck, deck.candidateCards);
    }
  };

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
      lifeBurstFilter: filter.lifeBurstFilter,
      searchText: filter.searchText,
      candidateFilter: filter.candidateFilter,
      candidateCards: deck.candidateCards,
    });
  }, [allCardData, filter.selectedColors, filter.selectedLevels, filter.selectedCardTypes, filter.selectedLrigClasses, filter.lifeBurstFilter, filter.searchText, filter.candidateFilter, deck.candidateCards]);

  return (
    <div className="flex flex-col w-dvw h-dvh bg-zinc-900  overflow-hidden m-0 p-0">
      {/* Navbar */}
      <Navbar
        basePath="/wixdex"
        deckName={currentDeckName}
        onMenuClick={handleSidebarOpen}
        onSaveClick={handleSave}
        onDeckClick={handleDeckEditOpen}
      />
      {/* Container */}
      <div className="flex flex-col flex-1 overflow-hidden max-w-screen-md mx-auto w-full">
        {/* デッキ欄 */}
        <DeckArea
          mainDeck={deck.mainDeck}
          lrigDeck={deck.lrigDeck}
          onCardHover={onCardHover}
          onAdd={deck.addCard}
          onRemove={deck.removeCard}
          candidateCards={deck.candidateCards}
          onAddToCandidate={deck.addToCandidate}
          onRemoveFromCandidate={deck.removeFromCandidate}
          onCardClick={onCardClick}
          lifeBurstCount={deck.lifeBurstCount}
          basePath="/wixdex"
        />
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
        />
        {/* 検索欄 */}
        <SearchArea
          hoveredCard={hoveredCard}
          selectedColors={filter.selectedColors}
          selectedLevels={filter.selectedLevels}
          selectedCardTypes={filter.selectedCardTypes}
          selectedLrigClasses={filter.selectedLrigClasses}
          lifeBurstFilter={filter.lifeBurstFilter}
          candidateFilter={filter.candidateFilter}
          onColorFilter={filter.toggleColorFilter}
          onTextSearch={filter.setSearchText}
          onLevelFilter={filter.toggleLevelFilter}
          onLifeBurstFilter={filter.toggleLifeBurstFilter}
          onCardTypeFilter={filter.toggleCardTypeFilter}
          onLrigClassFilter={filter.toggleLrigClassFilter}
          onCandidateFilter={filter.toggleCandidateFilter}
          onReset={filter.resetFilters}
          basePath="/wixdex"
          activeDropdown={activeDropdown}
          onDropdownChange={setActiveDropdown}
        />
      </div>

      {/* ドロップダウンメニュー（App レベル） */}
      <FilterDropdown
        isOpen={activeDropdown === 'type'}
        onClose={() => setActiveDropdown(null)}
        title="カードタイプ検索"
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
      >
        <LrigClassFilterContent
          selectedLrigClasses={filter.selectedLrigClasses}
          onToggle={filter.toggleLrigClassFilter}
        />
      </FilterDropdown>

      {/* サイドバー（App レベル） */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onDeckListClick={handleDeckListOpen} />

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
        currentName={currentDeckName}
        currentMemo={currentDeckMemo}
        onSave={handleDeckEdit}
      />

      {/* ポップアップ */}
      <CardPopup card={popupCard} onClose={closePopup} basePath="/wixdex" />
    </div>
  );
}

export default App;
