import { useState, useMemo } from 'react';
import CardList from './components/CardList';
import DeckArea from './components/DeckArea';
import SearchArea from './components/SearchArea';
import CardPopup from './components/CardPopup';
import { handleAddCard } from './handlers/handleAddCard';
import { handleRemoveCard } from './handlers/handleRemoveCard';
import { Bars2Icon } from '@heroicons/react/24/outline';

// カードデータ
import cardDataWX24P4 from './assets/cards_json/WX24-P4.json';
import cardDataWXDiP16 from './assets/cards_json/WXDi-P16.json';
import cardDataWXDiP15 from './assets/cards_json/WXDi-P15.json';
import cardDataWXDiP13 from './assets/cards_json/WXDi-P13.json';
import cardDataWXDiP12 from './assets/cards_json/WXDi-P12.json';

function App() {
  const [mainDeck, setMainDeck] = useState([]);
  const [lrigDeck, setLrigDeck] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedColors, setSelectedColors] = useState(new Set());
  const [selectedLevels, setSelectedLevels] = useState(new Set());
  const [selectedCardTypes, setSelectedCardTypes] = useState(new Set());
  const [lifeBurstFilter, setLifeBurstFilter] = useState(null);
  const [candidateCards, setCandidateCards] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [popupCard, setPopupCard] = useState(null);

  // カードデータをまとめる
  const allCardData = useMemo(() => [
    ...cardDataWX24P4,
    ...cardDataWXDiP16,
    ...cardDataWXDiP13,
    ...cardDataWXDiP15,
    ...cardDataWXDiP12,
  ], []);

  // ライフバーストカードの枚数を計算
  const lifeBurstCount = useMemo(() => {
    return mainDeck.filter(card => card.lifeBurst === "true").length;
  }, [mainDeck]);

  const handleColorFilter = (color) => {
    setSelectedColors(prev => {
      const newColors = new Set(prev);
      if (newColors.has(color)) {
        newColors.delete(color);
      } else {
        newColors.add(color);
      }
      return newColors;
    });
  };

  const handleLevelFilter = (level) => {
    setSelectedLevels(prev => {
      const newLevels = new Set(prev);
      if (newLevels.has(level)) {
        newLevels.delete(level);
      } else {
        newLevels.add(level);
      }
      return newLevels;
    });
  };

  const handleCardTypeFilter = (cardType) => {
    setSelectedCardTypes(prev => {
      const newTypes = new Set(prev);
      if (newTypes.has(cardType)) {
        newTypes.delete(cardType);
      } else {
        newTypes.add(cardType);
      }
      return newTypes;
    });
  };

  const handleLifeBurstFilter = () => {
    setLifeBurstFilter(prev => {
      if (prev === null) return true;
      if (prev === true) return false;
      return null;
    });
  };

  const handleAddToCandidate = (card) => {
    if (!candidateCards.some(c => c.image === card.image)) {
      setCandidateCards(prev => [...prev, card]);
    }
  };

  const handleRemoveFromCandidate = (card) => {
    setCandidateCards(prev => prev.filter(c => c.image !== card.image));
  };

  const handleCardRemove = (card) => {
    // カードをデッキから削除
    const { newMainDeck, newLrigDeck } = handleRemoveCard(card, mainDeck, lrigDeck, setMainDeck, setLrigDeck);
    
    // デッキ内の同じカードの枚数を確認
    const remainingInMain = newMainDeck.filter(c => c.id === card.id).length;
    const remainingInLrig = newLrigDeck.filter(c => c.id === card.id).length;
    
    // デッキ内に同じカードが0枚になった場合、候補リストに追加
    if (remainingInMain === 0 && remainingInLrig === 0 && !candidateCards.some(c => c.id === card.id)) {
      handleAddToCandidate(card);
    }
  };

  const handleReset = () => {
    // 色フィルターをリセット
    setSelectedColors(new Set());
    // レベルフィルターをリセット
    setSelectedLevels(new Set());
    // カード種類フィルターをリセット
    setSelectedCardTypes(new Set());
    // ライフバーストフィルターをリセット
    setLifeBurstFilter(null);
    // テキスト検索をリセット
    setSearchText('');
  };

  const filteredCards = allCardData.filter(card => {
    // 色によるフィルタリング
    const colorMatch = selectedColors.size === 0 || 
      card.color.some(color => selectedColors.has(color));

    // レベルによるフィルタリング
    const levelMatch = selectedLevels.size === 0 || 
      selectedLevels.has(card.level);

    // カード種類によるフィルタリング
    const cardTypeMatch = selectedCardTypes.size === 0 || 
      card.cardType.some(type => selectedCardTypes.has(type));

    // ライフバーストによるフィルタリング
    const lifeBurstMatch = lifeBurstFilter === null || 
      card.lifeBurst === lifeBurstFilter.toString();

    // テキストによるフィルタリング
    const textMatch = searchText === '' || 
      card.name.toLowerCase().includes(searchText.toLowerCase()) ||
      card.subName.some(name => name.toLowerCase().includes(searchText.toLowerCase()));

    // 全ての条件を満たすカードのみを表示
    return colorMatch && levelMatch && cardTypeMatch && lifeBurstMatch && textMatch;
  });

  return (
    <div className="vw-100 vh-100 bg-dark">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark position-absolute z-3 w-100" style={{height: '3rem', paddingLeft: '1rem', alignItems: 'center'}}>
        <div className="container-fluid d-flex align-items-center">
          <a className="navbar-brand" href="#">Wixdex</a>
          <div className="ms-auto p-2 rounded" style={{cursor: 'pointer', background: 'rgba(33,37,41,0.18)'}}>
            <i className="bi bi-list h-8 w-8 text-secondary"></i>
          </div>
        </div>
      </nav>
      {/* メイン */}
      <div className="d-flex flex-column position-absolute z-0 container-fluid h-100 pt-5">
        {/* デッキ欄 */}
        <div className="flex-grow-1 p-4">
          <DeckArea
            mainDeck={mainDeck}
            lrigDeck={lrigDeck}
            onHover={setHoveredCard}
            onAdd={(card) =>
              handleAddCard(card, mainDeck, lrigDeck, setMainDeck, setLrigDeck)
            }
            onRemove={handleCardRemove}
            candidateCards={candidateCards}
            onAddToCandidate={handleAddToCandidate}
            onRemoveFromCandidate={handleRemoveFromCandidate}
            onCardClick={setPopupCard}
            lifeBurstCount={lifeBurstCount}
            basePath="/wixdex"
          />
        </div>
        {/* カードリスト欄 */}
        <div className="pb-4" style={{height: '6.5rem'}}>
          <CardList
            cards={filteredCards}
            onAdd={(card) =>
              handleAddCard(card, mainDeck, lrigDeck, setMainDeck, setLrigDeck)
            }
            onRemove={handleCardRemove}
            onHover={setHoveredCard}
            onAddToCandidate={handleAddToCandidate}
            onCardClick={setPopupCard}
            basePath="/wixdex"
          />
        </div>
        {/* 検索欄 */}
        <div className="p-4 border-top border-secondary" style={{background: 'rgba(33,37,41,0.9)'}}>
          <SearchArea
            hoveredCard={hoveredCard}
            selectedColors={selectedColors}
            selectedLevels={selectedLevels}
            selectedCardTypes={selectedCardTypes}
            lifeBurstFilter={lifeBurstFilter}
            onColorFilter={handleColorFilter}
            onTextSearch={setSearchText}
            onLevelFilter={handleLevelFilter}
            onLifeBurstFilter={handleLifeBurstFilter}
            onCardTypeFilter={handleCardTypeFilter}
            onReset={handleReset}
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
