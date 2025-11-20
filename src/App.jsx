import { useMemo, useEffect } from 'react';
import CardList from './components/CardList';
import DeckArea from './components/DeckArea';
import SearchArea from './components/SearchArea';
import CardPopup from './components/CardPopup';
import Navbar from './components/Navbar';
import { useDeckManager } from './hooks/useDeckManager';
import { useCardHover } from './hooks/useCardHover';
import { useCardPopup } from './hooks/useCardPopup';
import { useCardFilter } from './hooks/useCardFilter';
import { filterCards } from './utils/cardFilters';

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

  // 引っ張って更新を防ぐ（特定要素のみ）
  useEffect(() => {
    let startY = 0;
    let touchedElement = null;

    const touchStart = (e) => {
      startY = e.touches[0].clientY;
      touchedElement = e.target;
    };

    const touchMove = (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      // カード要素をタッチしている場合のみ引っ張りを防ぐ
      const isCardElement = touchedElement?.closest('img') || touchedElement?.tagName === 'IMG';

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
    ...cardDataWX24P4,
    ...cardDataWXDiP16,
    ...cardDataWXDiP13,
    ...cardDataWXDiP15,
    ...cardDataWXDiP12,
  ], []);

  // フィルタリングされたカードリスト
  const filteredCards = useMemo(() => {
    return filterCards(allCardData, {
      selectedColors: filter.selectedColors,
      selectedLevels: filter.selectedLevels,
      selectedCardTypes: filter.selectedCardTypes,
      lifeBurstFilter: filter.lifeBurstFilter,
      searchText: filter.searchText,
    });
  }, [allCardData, filter.selectedColors, filter.selectedLevels, filter.selectedCardTypes, filter.lifeBurstFilter, filter.searchText]);

  return (
    <div className="flex flex-col w-dvw h-dvh bg-zinc-900  overflow-hidden m-0 p-0">
      {/* Navbar */}
      <Navbar basePath="/wixdex" />
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
          onRemove={deck.removeCard}
          onCardHover={onCardHover}
          onAddToCandidate={deck.addToCandidate}
          onCardClick={onCardClick}
          basePath="/wixdex"
        />
        {/* 検索欄 */}
        <SearchArea
          hoveredCard={hoveredCard}
          selectedColors={filter.selectedColors}
          selectedLevels={filter.selectedLevels}
          selectedCardTypes={filter.selectedCardTypes}
          lifeBurstFilter={filter.lifeBurstFilter}
          onColorFilter={filter.toggleColorFilter}
          onTextSearch={filter.setSearchText}
          onLevelFilter={filter.toggleLevelFilter}
          onLifeBurstFilter={filter.toggleLifeBurstFilter}
          onCardTypeFilter={filter.toggleCardTypeFilter}
          onReset={filter.resetFilters}
          basePath="/wixdex"
        />
      </div>
      {/* ポップアップ */}
      <CardPopup card={popupCard} onClose={closePopup} basePath="/wixdex" />
    </div>
  );
}

export default App;
