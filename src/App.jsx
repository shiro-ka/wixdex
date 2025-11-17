import { useState, useMemo } from 'react';
import CardList from './components/CardList';
import DeckArea from './components/DeckArea';
import SearchArea from './components/SearchArea';
import CardPopup from './components/CardPopup';
import Navbar from './components/Navbar';
import { useDeck } from './hooks/useDeck';
import { useCardFilter } from './hooks/useCardFilter';
import { filterCards } from './utils/cardFilters';

// カードデータ
import cardDataWX24P4 from './assets/cards_json/WX24-P4.json';
import cardDataWXDiP16 from './assets/cards_json/WXDi-P16.json';
import cardDataWXDiP15 from './assets/cards_json/WXDi-P15.json';
import cardDataWXDiP13 from './assets/cards_json/WXDi-P13.json';
import cardDataWXDiP12 from './assets/cards_json/WXDi-P12.json';

function App() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [popupCard, setPopupCard] = useState(null);

  // カスタムフックでstate管理
  const deck = useDeck();
  const filter = useCardFilter();

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
    <div className="flex flex-col w-screen h-screen bg-gray-900 overflow-hidden">
      {/* Navbar */}
      <Navbar basePath="/wixdex" />
      {/* Container */}
      <div className="flex flex-col flex-1 overflow-hidden max-w-screen-md mx-auto w-full">
        {/* デッキ欄 */}
        <div className="flex-shrink-0">
          <DeckArea
            mainDeck={deck.mainDeck}
            lrigDeck={deck.lrigDeck}
            onHover={setHoveredCard}
            onAdd={deck.addCard}
            onRemove={deck.removeCard}
            candidateCards={deck.candidateCards}
            onAddToCandidate={deck.addToCandidate}
            onRemoveFromCandidate={deck.removeFromCandidate}
            onCardClick={setPopupCard}
            lifeBurstCount={deck.lifeBurstCount}
            basePath="/wixdex"
          />
        </div>
        {/* カードリスト欄 */}
        <div className="flex-grow-1 overflow-auto">
          <CardList
            cards={filteredCards}
            onAdd={deck.addCard}
            onRemove={deck.removeCard}
            onHover={setHoveredCard}
            onAddToCandidate={deck.addToCandidate}
            onCardClick={setPopupCard}
            basePath="/wixdex"
          />
        </div>
        {/* 検索欄 */}
        <div className="flex-shrink-0 py-4 border-t border-gray-600">
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
      </div>
      {/* ポップアップ */}
      <CardPopup card={popupCard} onClose={() => setPopupCard(null)} basePath="/wixdex" />
    </div>
  );
}

export default App;
