import { useState, useMemo } from 'react';
import CardList from './components/CardList';
import DeckArea from './components/DeckArea';
import SearchArea from './components/SearchArea';
import CardPopup from './components/CardPopup';
import cardData from './assets/cards_json/WXDi-P16.json';
import { handleAddCard } from './handlers/handleAddCard';
import { handleRemoveCard } from './handlers/handleRemoveCard';
import { Bars2Icon } from '@heroicons/react/24/outline';

function App() {
  const [mainDeck, setMainDeck] = useState([]);
  const [lrigDeck, setLrigDeck] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedColors, setSelectedColors] = useState(new Set());
  const [selectedLevels, setSelectedLevels] = useState(new Set());
  const [lifeBurstFilter, setLifeBurstFilter] = useState(null);
  const [candidateCards, setCandidateCards] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [popupCard, setPopupCard] = useState(null);

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
    // ライフバーストフィルターをリセット
    setLifeBurstFilter(null);
    // テキスト検索をリセット
    setSearchText('');
  };

  const filteredCards = cardData.filter(card => {
    // 色によるフィルタリング
    const colorMatch = selectedColors.size === 0 || 
      card.color.some(color => selectedColors.has(color));

    // レベルによるフィルタリング
    const levelMatch = selectedLevels.size === 0 || 
      selectedLevels.has(card.level);

    // ライフバーストによるフィルタリング
    const lifeBurstMatch = lifeBurstFilter === null || 
      card.lifeBurst === lifeBurstFilter.toString();

    // テキストによるフィルタリング
    const textMatch = searchText === '' || 
      card.name.toLowerCase().includes(searchText.toLowerCase()) ||
      card.subName.some(name => name.toLowerCase().includes(searchText.toLowerCase()));

    // 全ての条件を満たすカードのみを表示
    return colorMatch && levelMatch && lifeBurstMatch && textMatch;
  });

  return (
    <div className="w-dvw bg-gray-200 dark:bg-zinc-800">
      {/* ヘッダー */}
      <div className='h-16 w-full bg-sky-200/60 dark:bg-zinc-950/70 flex items-center justify-end px-4'>
        <Bars2Icon className="h-8 w-8 text-gray-700 dark:text-gray-300" />
      </div>
      {/* メイン */}
      <div className='p-4 w-full md:h-[calc(100dvh-4rem)]'>
        <div className='container flex md:flex-row gap-4 mx-auto w-full h-fit md:h-full'>
          {/* デッキ欄 */}
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
          />
          {/* カードリスト欄 */}
          <CardList
            cards={filteredCards}
            onAdd={(card) =>
              handleAddCard(card, mainDeck, lrigDeck, setMainDeck, setLrigDeck)
            }
            onRemove={handleCardRemove}
            onHover={setHoveredCard}
            onAddToCandidate={handleAddToCandidate}
            onCardClick={setPopupCard}
          />
          {/* 検索欄 */}
          <SearchArea
            hoveredCard={hoveredCard}
            onColorFilter={handleColorFilter}
            onTextSearch={setSearchText}
            onLevelFilter={handleLevelFilter}
            onLifeBurstFilter={handleLifeBurstFilter}
            onReset={handleReset}
          />
        </div>
      </div>
      {/* ポップアップ */}
      <CardPopup card={popupCard} onClose={() => setPopupCard(null)} />
    </div>
  );
}

export default App;
