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

// ── DTOs shared between server (D1) and client (cloudDeckSync) ─────────────

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

// ── Card usage aggregate (Phase D) ────────────────────────────────────────

export interface CardUsage {
  cardId: string;
  deckCount: number;
  totalCount: number;
  lastUpdated: number;
}
