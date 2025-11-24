import { useState, useCallback } from 'react';
import type { Card } from '../types';

export function useCardHover() {
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);

  const onCardHover = useCallback((card: Card | null) => {
    setHoveredCard(card);
  }, []);

  return {
    hoveredCard,
    onCardHover,
  };
}
