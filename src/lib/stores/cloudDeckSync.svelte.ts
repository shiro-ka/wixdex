import type { Card, SavedDeck, DeckSummary, DeckDetail, DeckSlotKind } from '$lib/types';
import { getAllDecks, persistDecks } from '$lib/utils/storage';

function cardKey(card: Card): string | null {
  return card.id ?? card.image ?? null;
}

function cardsToSlots(cards: Card[], slot: DeckSlotKind): DeckDetail['slots'] {
  const counts = new Map<string, number>();
  for (const card of cards) {
    const key = cardKey(card);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].map(([cardId, count]) => ({ slot, cardId, count }));
}

function slotsToCards(
  slots: DeckDetail['slots'],
  slotFilter: DeckSlotKind,
  cardMap: Map<string, Card>
): Card[] {
  const result: Card[] = [];
  for (const s of slots) {
    if (s.slot !== slotFilter) continue;
    const card = cardMap.get(s.cardId);
    if (card) {
      for (let i = 0; i < s.count; i++) result.push(card);
    }
  }
  return result;
}

function savedDeckToSummary(d: SavedDeck): DeckSummary {
  return {
    id: d.id,
    name: d.name,
    memo: d.memo,
    isPublic: false,
    mainCount: d.mainDeck.length,
    lrigCount: d.lrigDeck.length,
    candidateCount: d.candidateCards.length,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

interface DeckInput {
  id?: string;
  name: string;
  memo: string;
  mainDeck: Card[];
  lrigDeck: Card[];
  candidateCards: Card[];
}

export class CloudDeckSync {
  decks = $state<DeckSummary[]>([]);
  syncing = $state(false);
  error = $state<string | null>(null);

  readonly isLoggedIn: boolean;

  constructor(isLoggedIn: boolean) {
    this.isLoggedIn = isLoggedIn;
  }

  async loadList(): Promise<void> {
    if (!this.isLoggedIn) {
      this.decks = getAllDecks().map(savedDeckToSummary);
      return;
    }

    this.syncing = true;
    this.error = null;
    try {
      const res = await fetch('/api/decks');
      if (!res.ok) throw new Error(`${res.status}`);
      this.decks = (await res.json()) as DeckSummary[];
    } catch {
      this.error = 'デッキ一覧の読み込みに失敗しました';
    } finally {
      this.syncing = false;
    }
  }

  async loadFull(id: string, cardMap: Map<string, Card>): Promise<SavedDeck | null> {
    if (!this.isLoggedIn) {
      return getAllDecks().find((d) => d.id === id) ?? null;
    }

    const res = await fetch(`/api/decks/${id}`);
    if (!res.ok) return null;
    const data = (await res.json()) as DeckDetail;

    return {
      id: data.id,
      name: data.name,
      memo: data.memo,
      mainDeck: slotsToCards(data.slots, 'main', cardMap),
      lrigDeck: slotsToCards(data.slots, 'lrig', cardMap),
      candidateCards: slotsToCards(data.slots, 'candidate', cardMap),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async save(deck: DeckInput): Promise<string> {
    const isNew = !deck.id || !this.decks.find((d) => d.id === deck.id);
    const now = Date.now();

    if (!this.isLoggedIn) {
      const all = getAllDecks();
      if (isNew) {
        const newId = `deck_${now}`;
        persistDecks([...all, { ...deck, id: newId, createdAt: now, updatedAt: now }]);
        await this.loadList();
        return newId;
      }
      persistDecks(
        all.map((d) =>
          d.id === deck.id
            ? {
                ...d,
                name: deck.name,
                memo: deck.memo,
                mainDeck: deck.mainDeck,
                lrigDeck: deck.lrigDeck,
                candidateCards: deck.candidateCards,
                updatedAt: now,
              }
            : d
        )
      );
      await this.loadList();
      return deck.id!;
    }

    this.syncing = true;
    this.error = null;
    try {
      const body = {
        name: deck.name,
        memo: deck.memo,
        isPublic: false,
        slots: [
          ...cardsToSlots(deck.mainDeck, 'main'),
          ...cardsToSlots(deck.lrigDeck, 'lrig'),
          ...cardsToSlots(deck.candidateCards, 'candidate'),
        ],
      };

      const res = await fetch(isNew ? '/api/decks' : `/api/decks/${deck.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`${res.status}`);
      const saved = (await res.json()) as DeckDetail;

      const summary: DeckSummary = {
        id: saved.id,
        name: saved.name,
        memo: saved.memo,
        isPublic: saved.isPublic,
        mainCount: deck.mainDeck.length,
        lrigCount: deck.lrigDeck.length,
        candidateCount: deck.candidateCards.length,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      };

      this.decks = isNew
        ? [...this.decks, summary]
        : this.decks.map((d) => (d.id === saved.id ? summary : d));

      return saved.id;
    } catch {
      this.error = 'デッキの保存に失敗しました';
      throw new Error(this.error);
    } finally {
      this.syncing = false;
    }
  }

  async delete(id: string): Promise<void> {
    const prev = this.decks;
    this.decks = this.decks.filter((d) => d.id !== id);

    if (!this.isLoggedIn) {
      persistDecks(getAllDecks().filter((d) => d.id !== id));
      return;
    }

    try {
      const res = await fetch(`/api/decks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`${res.status}`);
    } catch {
      this.decks = prev;
      this.error = 'デッキの削除に失敗しました';
    }
  }
}
