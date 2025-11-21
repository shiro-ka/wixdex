import { useState, useCallback } from 'react';
import type { Card } from '../types';

export function useCardPopup() {
  const [popupCard, setPopupCard] = useState<Card | null>(null);

  const onCardClick = useCallback((card: Card) => {
    setPopupCard(card);
  }, []);

  const closePopup = useCallback(() => {
    setPopupCard(null);
  }, []);

  return {
    popupCard,
    onCardClick,
    closePopup,
  };
}
