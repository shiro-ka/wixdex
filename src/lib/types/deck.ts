import type { Card } from './card';

export interface DeckState {
  mainDeck: Card[];
  lrigDeck: Card[];
}

export type DeckType = 'main' | 'lrig';

export interface DeckOperationResult extends DeckState {}

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
