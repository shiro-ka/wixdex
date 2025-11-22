import { useCallback } from 'react';
import type { Card } from '../types';

export interface SavedDeck {
  id: string;
  name: string;
  memo: string;
  mainDeck: Card[];
  lrigDeck: Card[];
  candidateCards: Card[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'wixdex_saved_decks';

export function useDeckStorage() {
  // 全てのデッキを取得
  const getAllDecks = useCallback((): SavedDeck[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load decks:', error);
      return [];
    }
  }, []);

  // デッキを保存
  const saveDeck = useCallback((name: string, memo: string, mainDeck: Card[], lrigDeck: Card[], candidateCards: Card[]): SavedDeck => {
    const decks = getAllDecks();
    const now = Date.now();

    const newDeck: SavedDeck = {
      id: `deck_${now}`,
      name,
      memo,
      mainDeck,
      lrigDeck,
      candidateCards,
      createdAt: now,
      updatedAt: now,
    };

    const updatedDecks = [...decks, newDeck];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDecks));

    return newDeck;
  }, [getAllDecks]);

  // デッキを削除
  const deleteDeck = useCallback((id: string) => {
    const decks = getAllDecks();
    const updatedDecks = decks.filter(deck => deck.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDecks));
  }, [getAllDecks]);

  // デッキを更新
  const updateDeck = useCallback((id: string, name: string, memo: string, mainDeck: Card[], lrigDeck: Card[], candidateCards: Card[]) => {
    const decks = getAllDecks();
    const updatedDecks = decks.map(deck => {
      if (deck.id === id) {
        return {
          ...deck,
          name,
          memo,
          mainDeck,
          lrigDeck,
          candidateCards,
          updatedAt: Date.now(),
        };
      }
      return deck;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDecks));
  }, [getAllDecks]);

  return {
    getAllDecks,
    saveDeck,
    deleteDeck,
    updateDeck,
  };
}
