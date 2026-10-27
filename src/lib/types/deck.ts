import type { Card } from './card';

export interface DeckState {
  mainDeck: Card[];
  lrigDeck: Card[];
}

export type DeckType = 'main' | 'lrig';

export type DeckOperationResult = DeckState;

export interface SavedDeck {
  id: string;
  name: string;
  memo: string;
  slug: string;
  isPublic: boolean;
  mainDeck: Card[];
  lrigDeck: Card[];
  candidateCards: Card[];
  createdAt: number;
  updatedAt: number;
}

export type DeckSlotKind = 'main' | 'lrig' | 'candidate';

export interface DeckSlot {
  slot: DeckSlotKind;
  cardId: string;
  count: number;
}

export interface DeckSummary {
  id: string;
  name: string;
  memo: string;
  slug: string;
  isPublic: boolean;
  mainCount: number;
  lrigCount: number;
  candidateCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface DeckDetail {
  id: string;
  name: string;
  memo: string;
  slug: string;
  isPublic: boolean;
  slots: DeckSlot[];
  createdAt: number;
  updatedAt: number;
}

export interface DeckUpsert {
  name: string;
  memo: string;
  isPublic?: boolean;
  slots: DeckSlot[];
}

export interface PublicDeckDetail {
  id: string;
  name: string;
  memo: string;
  slots: DeckSlot[];
  createdAt: number;
  updatedAt: number;
  author: { displayName: string; blueskyHandle: string | null };
}

export interface PublicDeckSummary {
  slug: string;
  name: string;
  mainCount: number;
  lrigCount: number;
  updatedAt: number;
}

export interface CardUsage {
  cardId: string;
  deckCount: number;
  totalCount: number;
  lastUpdated: number;
}
