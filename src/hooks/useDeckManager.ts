import { useState, useMemo, useCallback } from 'react';
import type { Card, DeckType } from '../types';
import { addCardToDeck, removeCardFromDeck } from '../utils/deckOperations';

export function useDeckManager() {
  const [mainDeck, setMainDeck] = useState<Card[]>([]);
  const [lrigDeck, setLrigDeck] = useState<Card[]>([]);
  const [candidateCards, setCandidateCards] = useState<Card[]>([]);

  // ライフバーストカードの枚数を計算
  const lifeBurstCount = useMemo(() => {
    return mainDeck.filter(card => card.lifeBurst === "true").length;
  }, [mainDeck]);

  // カードを候補リストに追加
  const addToCandidate = useCallback((card: Card) => {
    if (!candidateCards.some(c => c.image === card.image)) {
      setCandidateCards(prev => [...prev, card]);
    }
  }, [candidateCards]);

  // カードを候補リストから削除
  const removeFromCandidate = useCallback((card: Card) => {
    setCandidateCards(prev => prev.filter(c => c.image !== card.image));
  }, []);

  // カードをデッキに追加
  const addCard = useCallback((card: Card) => {
    const result = addCardToDeck(card, mainDeck, lrigDeck);
    setMainDeck(result.mainDeck);
    setLrigDeck(result.lrigDeck);
  }, [mainDeck, lrigDeck]);

  // カードをデッキから削除
  const removeCard = useCallback((card: Card, specificIndex: number | null = null, deckType: DeckType | null = null) => {
    const result = removeCardFromDeck(card, mainDeck, lrigDeck, specificIndex, deckType);
    setMainDeck(result.mainDeck);
    setLrigDeck(result.lrigDeck);

    // デッキ内の同じカードの枚数を確認
    const remainingInMain = result.mainDeck.filter(c => c.id === card.id).length;
    const remainingInLrig = result.lrigDeck.filter(c => c.id === card.id).length;

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
