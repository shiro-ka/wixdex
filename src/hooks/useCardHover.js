import { useState, useCallback } from 'react';

export function useCardHover() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const onCardHover = useCallback((card) => {
    setHoveredCard(card);
  }, []);

  return {
    hoveredCard,
    onCardHover,
  };
}
