import { useState, useCallback, useEffect } from 'react';
import type { Card } from '../types';

const FAVORITES_STORAGE_KEY = 'wixdex_favorite_cards';

// カードが同一かどうかを判定するヘルパー関数
const isSameCard = (card1: Card, card2: Card): boolean => {
  return (card1.id && card1.id === card2.id) || (card1.image === card2.image);
};

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
      const exists = prev.some(c => isSameCard(c, card));

      if (exists) {
        return prev.filter(c => !isSameCard(c, card));
      } else {
        return [...prev, card];
      }
    });
  }, []);

  const isFavorite = useCallback((card: Card): boolean => {
    return favoriteCards.some(c => isSameCard(c, card));
  }, [favoriteCards]);

  return {
    favoriteCards,
    toggleFavorite,
    isFavorite,
  };
}
