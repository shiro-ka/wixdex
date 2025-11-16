import { useState, useMemo, useCallback } from 'react';
import { handleAddCard } from '../handlers/handleAddCard';
import { handleRemoveCard } from '../handlers/handleRemoveCard';

export function useDeck() {
  const [mainDeck, setMainDeck] = useState([]);
  const [lrigDeck, setLrigDeck] = useState([]);
  const [candidateCards, setCandidateCards] = useState([]);

  // ライフバーストカードの枚数を計算
  const lifeBurstCount = useMemo(() => {
    return mainDeck.filter(card => card.lifeBurst === "true").length;
  }, [mainDeck]);

  // カードを候補リストに追加
  const addToCandidate = useCallback((card) => {
    if (!candidateCards.some(c => c.image === card.image)) {
      setCandidateCards(prev => [...prev, card]);
    }
  }, [candidateCards]);

  // カードを候補リストから削除
  const removeFromCandidate = useCallback((card) => {
    setCandidateCards(prev => prev.filter(c => c.image !== card.image));
  }, []);

  // カードをデッキに追加
  const addCard = useCallback((card) => {
    handleAddCard(card, mainDeck, lrigDeck, setMainDeck, setLrigDeck);
  }, [mainDeck, lrigDeck]);

  // カードをデッキから削除
  const removeCard = useCallback((card) => {
    const { newMainDeck, newLrigDeck } = handleRemoveCard(
      card,
      mainDeck,
      lrigDeck,
      setMainDeck,
      setLrigDeck
    );

    // デッキ内の同じカードの枚数を確認
    const remainingInMain = newMainDeck.filter(c => c.id === card.id).length;
    const remainingInLrig = newLrigDeck.filter(c => c.id === card.id).length;

    // デッキ内に同じカードが0枚になった場合、候補リストに追加
    if (remainingInMain === 0 && remainingInLrig === 0 && !candidateCards.some(c => c.id === card.id)) {
      addToCandidate(card);
    }
  }, [mainDeck, lrigDeck, candidateCards, addToCandidate]);

  return {
    mainDeck,
    lrigDeck,
    candidateCards,
    lifeBurstCount,
    addCard,
    removeCard,
    addToCandidate,
    removeFromCandidate,
  };
}
