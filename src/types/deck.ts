import type { Card } from './card';

export interface DeckState {
  mainDeck: Card[];
  lrigDeck: Card[];
}

export type DeckType = 'main' | 'lrig';

export interface DeckOperationResult extends DeckState {}
