import { useState, useCallback } from 'react';

export function useCardPopup() {
  const [popupCard, setPopupCard] = useState(null);

  const onCardClick = useCallback((card) => {
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
