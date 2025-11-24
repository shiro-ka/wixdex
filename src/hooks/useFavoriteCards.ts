import { useState, useCallback, useEffect } from 'react';
import type { Card } from '../types';

const FAVORITES_STORAGE_KEY = 'wixdex_favorite_cards';

export function useFavoriteCards() {
  const [favoriteCards, setFavoriteCards] = useState<Card[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load favorite cards:', error);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteCards));
    } catch (error) {
      console.error('Failed to save favorite cards:', error);
    }
  }, [favoriteCards]);

  const toggleFavorite = useCallback((card: Card) => {
    setFavoriteCards(prev => {
      const exists = prev.some(c =>
        (c.id && c.id === card.id) || (c.image === card.image)
      );

      if (exists) {
        return prev.filter(c =>
          !((c.id && c.id === card.id) || (c.image === card.image))
        );
      } else {
        return [...prev, card];
      }
    });
  }, []);

  const isFavorite = useCallback((card: Card): boolean => {
    return favoriteCards.some(c =>
      (c.id && c.id === card.id) || (c.image === card.image)
    );
  }, [favoriteCards]);

  return {
    favoriteCards,
    toggleFavorite,
    isFavorite,
  };
}
