import type { Card, DeckType, SavedDeck } from '$lib/types';
import type { DraftState } from '$lib/utils/storage';
import {
  addCardToDeck,
  addMultipleCardsToDeck,
  removeCardFromDeck,
} from '$lib/utils/deckOperations';
import { sortCandidateCards, sortMainDeck, sortLrigDeck } from '$lib/utils/cardSorting';

function slotSig(cards: Card[]): string {
  const counts = new Map<string, number>();
  for (const c of cards) {
    const key = c.cardID ?? c.image;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort()
    .map(([k, n]) => `${k}:${n}`)
    .join(',');
}

type LoadableDeck = Pick<
  SavedDeck,
  'id' | 'name' | 'memo' | 'slug' | 'isPublic' | 'mainDeck' | 'lrigDeck' | 'candidateCards'
>;

export class DeckBuilderStore {
  mainDeck = $state<Card[]>([]);
  lrigDeck = $state<Card[]>([]);
  candidateCards = $state<Card[]>([]);
  id = $state<string | null>(null);
  name = $state('');
  memo = $state('');
  slug = $state('');
  isPublic = $state(false);

  orderMap = $state<Map<string, number> | undefined>(undefined);

  savedSnapshot = $state(this.signature());

  lifeBurstCount = $derived(this.mainDeck.filter((c) => c.lifeBurst === true).length);
  sortedCandidateCards = $derived(sortCandidateCards(this.candidateCards, this.orderMap));
  isSaved = $derived(this.signature() === this.savedSnapshot);

  signature(): string {
    return [
      this.name,
      this.memo,
      slotSig(this.mainDeck),
      slotSig(this.lrigDeck),
      slotSig(this.candidateCards),
    ].join('|');
  }

  markSaved(): void {
    this.savedSnapshot = this.signature();
  }

  setCardOrder(orderMap: Map<string, number>): void {
    this.orderMap = orderMap;
    this.mainDeck = sortMainDeck(this.mainDeck, orderMap);
    this.lrigDeck = sortLrigDeck(this.lrigDeck, orderMap);
  }

  addCard = (card: Card): void => {
    const r = addCardToDeck(card, this.mainDeck, this.lrigDeck, this.orderMap);
    this.mainDeck = r.mainDeck;
    this.lrigDeck = r.lrigDeck;
  };

  addMultiple = (card: Card, count: number): void => {
    const r = addMultipleCardsToDeck(card, count, this.mainDeck, this.lrigDeck, this.orderMap);
    this.mainDeck = r.mainDeck;
    this.lrigDeck = r.lrigDeck;
  };

  removeCard = (
    card: Card,
    specificIndex: number | null = null,
    deckType: DeckType | null = null,
  ): void => {
    const r = removeCardFromDeck(card, this.mainDeck, this.lrigDeck, specificIndex, deckType);
    this.mainDeck = r.mainDeck;
    this.lrigDeck = r.lrigDeck;
    const inMain = r.mainDeck.some((c) => c.cardID === card.cardID);
    const inLrig = r.lrigDeck.some((c) => c.cardID === card.cardID);
    if (!inMain && !inLrig && !this.candidateCards.some((c) => c.cardID === card.cardID)) {
      this.candidateCards = [...this.candidateCards, card];
    }
  };

  addToCandidate = (card: Card): void => {
    if (!this.candidateCards.some((c) => c.image === card.image)) {
      this.candidateCards = [...this.candidateCards, card];
    }
  };

  removeFromCandidate = (card: Card): void => {
    this.candidateCards = this.candidateCards.filter((c) => c.image !== card.image);
  };

  setMeta(name: string, memo: string): void {
    this.name = name;
    this.memo = memo;
  }

  load(deck: LoadableDeck): void {
    this.mainDeck = sortMainDeck(deck.mainDeck, this.orderMap);
    this.lrigDeck = sortLrigDeck(deck.lrigDeck, this.orderMap);
    this.candidateCards = deck.candidateCards;
    this.id = deck.id;
    this.name = deck.name;
    this.memo = deck.memo;
    this.slug = deck.slug;
    this.isPublic = deck.isPublic;
    this.markSaved();
  }

  reset(): void {
    this.id = null;
    this.name = '';
    this.memo = '';
    this.slug = '';
    this.isPublic = false;
    this.mainDeck = [];
    this.lrigDeck = [];
    this.candidateCards = [];
    this.markSaved();
  }

  restoreFromDraft(draft: DraftState): void {
    this.mainDeck = draft.mainDeck;
    this.lrigDeck = draft.lrigDeck;
    this.candidateCards = draft.candidateCards;
    this.id = draft.currentDeckId;
    this.name = draft.currentDeckName;
    this.memo = draft.currentDeckMemo;
    this.slug = draft.currentDeckSlug ?? '';
    this.isPublic = draft.isPublic ?? false;
  }

  toDraft(): DraftState {
    return {
      currentDeckId: this.id,
      currentDeckName: this.name,
      currentDeckMemo: this.memo,
      currentDeckSlug: this.slug,
      isPublic: this.isPublic,
      mainDeck: this.mainDeck,
      lrigDeck: this.lrigDeck,
      candidateCards: this.candidateCards,
    };
  }
}
