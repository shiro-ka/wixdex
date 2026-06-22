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

/** 公開デッキの読み取り専用ビュー（所有者チェック無し・is_public=1 のみ）。
 *  author は将来の作者表示用に保持（現状 UI 未使用）。 */
export interface PublicDeckDetail {
  id: string;
  name: string;
  memo: string;
  slots: DeckSlot[];
  createdAt: number;
  updatedAt: number;
  author: { displayName: string; blueskyHandle: string | null };
}

/** 公開プロフィールに並べる公開デッキの要約。slug は /@user/[slug] のURL用。 */
export interface PublicDeckSummary {
  slug: string;
  name: string;
  mainCount: number;
  lrigCount: number;
  updatedAt: number;
}

// ── Card usage aggregate (Phase D) ────────────────────────────────────────

export interface CardUsage {
  cardId: string;
  deckCount: number;
  totalCount: number;
  lastUpdated: number;
}
